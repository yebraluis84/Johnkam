import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMaintenanceUpdate } from "@/lib/email";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId");

    const where = tenantId ? { tenantId } : {};

    const tickets = await prisma.maintenanceTicket.findMany({
      where,
      include: {
        tenant: { include: { user: true, unit: true } },
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
        tenantName: t.tenant.user.name,
        unit: t.tenant.unit?.number || "N/A",
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
    const { title, description, category, priority, location, tenantId, entryPermission, photos } = body;

    const count = await prisma.maintenanceTicket.count();
    const ticketNumber = `MT-${String(count + 1).padStart(4, "0")}`;

    const ticket = await prisma.maintenanceTicket.create({
      data: {
        ticketNumber,
        title,
        description,
        category,
        priority: (priority || "MEDIUM").toUpperCase(),
        location,
        tenantId,
        entryPermission,
        photos: Array.isArray(photos) ? JSON.stringify(photos) : undefined,
      },
      include: { tenant: { include: { user: true, unit: true } } },
    });

    logAudit({ action: "create", entity: "ticket", entityId: ticket.id, details: `${ticket.ticketNumber}: ${ticket.title}` });

    return NextResponse.json({
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      title: ticket.title,
      status: "open",
      tenantName: ticket.tenant.user.name,
    }, { status: 201 });
  } catch (error) {
    console.error("POST ticket error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, scheduledDate } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const data: Record<string, unknown> = {};
    if (status) data.status = status.toUpperCase().replace("-", "_");
    if (scheduledDate) data.scheduledDate = new Date(scheduledDate);

    const ticket = await prisma.maintenanceTicket.update({
      where: { id },
      data,
      include: { tenant: { include: { user: true, unit: true } } },
    });

    // Send email notification on status change
    if (status) {
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

    logAudit({ action: "update_status", entity: "ticket", entityId: ticket.id, details: `Status changed to ${status}` });

    return NextResponse.json({ success: true, status: ticket.status });
  } catch (error) {
    console.error("PATCH ticket error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
