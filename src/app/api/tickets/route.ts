import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMaintenanceUpdate, sendNewTicketAlert } from "@/lib/email";
import { logAudit } from "@/lib/audit";
import { getAuthFromCookie } from "@/lib/auth";

let schemaHealed = false;
async function ensureSchema() {
  if (schemaHealed) return;
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "maintenance_tickets" ADD COLUMN IF NOT EXISTS "createdById" TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "maintenance_tickets" ADD COLUMN IF NOT EXISTS "photos" TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "maintenance_tickets" ADD COLUMN IF NOT EXISTS "entryPermission" TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "maintenance_tickets" ADD COLUMN IF NOT EXISTS "location" TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "maintenance_tickets" ADD COLUMN IF NOT EXISTS "statusChangedById" TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "maintenance_tickets" ADD COLUMN IF NOT EXISTS "statusChangedAt" TIMESTAMP(3)`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "maintenance_tickets" ADD COLUMN IF NOT EXISTS "assignedToId" TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "maintenance_tickets" ALTER COLUMN "tenantId" DROP NOT NULL`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notifyOnNewTicket" BOOLEAN DEFAULT true`);
    schemaHealed = true;
  } catch (e) {
    console.error("Schema heal failed:", e);
  }
}

async function notifyMaintenanceUsers(ticket: {
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  tenantName: string;
  unit: string;
}) {
  try {
    const [maintenanceUsers, property] = await Promise.all([
      prisma.user.findMany({
        where: { role: "MAINTENANCE", notifyOnNewTicket: true },
        select: { email: true },
      }),
      prisma.property.findFirst(),
    ]);

    if (maintenanceUsers.length === 0) return;

    await sendNewTicketAlert({
      to: maintenanceUsers.map((u) => u.email),
      ticketNumber: ticket.ticketNumber,
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      tenantName: ticket.tenantName,
      unit: ticket.unit,
      propertyName: property?.name || "TenantHub",
    });
  } catch (e) {
    console.error("notifyMaintenanceUsers failed:", e);
  }
}

export async function GET(req: NextRequest) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId");

    const where = tenantId ? { tenantId } : {};

    const tickets = await prisma.maintenanceTicket.findMany({
      where,
      include: {
        tenant: { include: { user: true, unit: true } },
        createdBy: true,
        statusChangedBy: true,
        assignedTo: true,
        comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      tickets.map((t) => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        title: t.title,
        description: t.description,
        category: t.category,
        priority: t.priority.toLowerCase(),
        status: t.status.toLowerCase().replace("_", "-"),
        location: t.location,
        scheduledDate: t.scheduledDate?.toISOString().split("T")[0] || "",
        entryPermission: t.entryPermission,
        photos: t.photos ? JSON.parse(t.photos) : [],
        tenantId: t.tenantId,
        tenantName: t.tenant?.user.name || "",
        unit: t.tenant?.unit?.number || "N/A",
        createdByName: t.createdBy?.name || t.tenant?.user.name || "Unknown",
        createdByRole: t.createdBy?.role || (t.tenant ? "TENANT" : "UNKNOWN"),
        statusChangedByName: t.statusChangedBy?.name || null,
        statusChangedByRole: t.statusChangedBy?.role || null,
        statusChangedAt: t.statusChangedAt?.toISOString() || null,
        assignedToId: t.assignedToId,
        assignedToName: t.assignedTo?.name || null,
        createdAt: t.createdAt.toISOString(),
        comments: t.comments.map((c) => ({
          id: c.id,
          message: c.message,
          author: c.author.name,
          authorRole: c.author.role,
          createdAt: c.createdAt.toISOString(),
        })),
      }))
    );
  } catch (error) {
    console.error("GET tickets error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, category, priority, location, tenantId, entryPermission, photos, createdById } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    await ensureSchema();

    const count = await prisma.maintenanceTicket.count();
    const ticketNumber = `MT-${String(count + 1).padStart(4, "0")}`;

    const data: Record<string, unknown> = {
      ticketNumber,
      title: title.trim(),
      description: description || "",
      category: category || "General",
      priority: (priority || "MEDIUM").toUpperCase(),
      location: location || null,
      entryPermission: entryPermission || null,
      photos: Array.isArray(photos) ? JSON.stringify(photos) : null,
      createdById: createdById || null,
    };
    if (tenantId) {
      data.tenantId = tenantId;
    }

    const ticket = await prisma.maintenanceTicket.create({
      data: data as Parameters<typeof prisma.maintenanceTicket.create>[0]["data"],
      include: { tenant: { include: { user: true, unit: true } }, createdBy: true },
    });

    logAudit({ action: "create", entity: "ticket", entityId: ticket.id, details: `${ticket.ticketNumber}: ${ticket.title}` });

    // Fire-and-forget: alert maintenance users who have notifications enabled
    void notifyMaintenanceUsers({
      ticketNumber: ticket.ticketNumber,
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      tenantName: ticket.tenant?.user.name || ticket.createdBy?.name || "Unknown",
      unit: ticket.tenant?.unit?.number || "N/A",
    });

    return NextResponse.json({
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      title: ticket.title,
      status: "open",
      tenantName: ticket.tenant?.user.name || ticket.createdBy?.name || "Unknown",
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("POST ticket error:", message);
    return NextResponse.json({ error: message || "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await ensureSchema();
    const body = await req.json();
    const { id, status, scheduledDate, updatedById, assignedToId } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const data: Record<string, unknown> = {};
    if (status) {
      data.status = status.toUpperCase().replace("-", "_");
      data.statusChangedAt = new Date();
      if (updatedById) data.statusChangedById = updatedById;
    }
    if (scheduledDate) data.scheduledDate = new Date(scheduledDate);

    // Assignment: only ADMIN or MANAGEMENT can set/change. null/empty clears.
    if (Object.prototype.hasOwnProperty.call(body, "assignedToId")) {
      const auth = await getAuthFromCookie();
      if (!auth || (auth.role !== "ADMIN" && auth.role !== "MANAGEMENT")) {
        return NextResponse.json(
          { error: "Only admin or management can assign tickets" },
          { status: 403 }
        );
      }
      if (assignedToId) {
        // Verify the target user exists and is MAINTENANCE
        const target = await prisma.user.findUnique({
          where: { id: assignedToId },
          select: { role: true },
        });
        if (!target) {
          return NextResponse.json({ error: "Assignee not found" }, { status: 404 });
        }
        if (target.role !== "MAINTENANCE") {
          return NextResponse.json(
            { error: "Tickets can only be assigned to maintenance staff" },
            { status: 400 }
          );
        }
        data.assignedToId = assignedToId;
      } else {
        data.assignedToId = null;
      }
    }

    const ticket = await prisma.maintenanceTicket.update({
      where: { id },
      data,
      include: {
        tenant: { include: { user: true, unit: true } },
        statusChangedBy: true,
        assignedTo: true,
      },
    });

    // Send email notification on status change (only if ticket is linked to a tenant)
    if (status && ticket.tenant) {
      const property = await prisma.property.findFirst();
      await sendMaintenanceUpdate({
        to: ticket.tenant.user.email,
        tenantName: ticket.tenant.user.name,
        ticketNumber: ticket.ticketNumber,
        title: ticket.title,
        newStatus: status,
        propertyName: property?.name || "TenantHub",
      });
    }

    if (status) {
      logAudit({ action: "update_status", entity: "ticket", entityId: ticket.id, details: `Status changed to ${status}` });
    }
    if (Object.prototype.hasOwnProperty.call(body, "assignedToId")) {
      logAudit({
        action: "assign_ticket",
        entity: "ticket",
        entityId: ticket.id,
        details: assignedToId
          ? `Assigned to ${ticket.assignedTo?.name || assignedToId}`
          : "Unassigned",
      });
    }

    return NextResponse.json({
      success: true,
      status: ticket.status,
      assignedToId: ticket.assignedToId,
      assignedToName: ticket.assignedTo?.name || null,
    });
  } catch (error) {
    console.error("PATCH ticket error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
