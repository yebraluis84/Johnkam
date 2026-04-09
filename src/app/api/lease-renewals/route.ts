import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";

// GET lease renewals
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId");

    const where = tenantId ? { tenantId } : {};

    const renewals = await prisma.leaseRenewal.findMany({
      where,
      include: { tenant: { include: { user: true, unit: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      renewals.map((r) => ({
        id: r.id,
        tenantId: r.tenantId,
        tenantName: r.tenant.user.name,
        unit: r.tenant.unit?.number || "",
        currentLeaseEnd: r.currentLeaseEnd.toISOString().split("T")[0],
        newLeaseStart: r.newLeaseStart.toISOString().split("T")[0],
        newLeaseEnd: r.newLeaseEnd.toISOString().split("T")[0],
        currentRent: r.currentRent,
        proposedRent: r.proposedRent,
        status: r.status,
        offeredDate: r.offeredDate?.toISOString().split("T")[0] || null,
        respondedDate: r.respondedDate?.toISOString().split("T")[0] || null,
        createdAt: r.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("GET renewals error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST create renewal offer
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, newLeaseStart, newLeaseEnd, proposedRent } = body;

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { user: true },
    });
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

    const renewal = await prisma.leaseRenewal.create({
      data: {
        tenantId,
        currentLeaseEnd: tenant.leaseEnd || new Date(),
        newLeaseStart: new Date(newLeaseStart),
        newLeaseEnd: new Date(newLeaseEnd),
        currentRent: tenant.rentAmount,
        proposedRent,
        status: "offered",
        offeredDate: new Date(),
      },
    });

    logAudit({ action: "create", entity: "lease_renewal", entityId: renewal.id, details: `Renewal offered to ${tenant.user.name}` });

    return NextResponse.json({ id: renewal.id, status: renewal.status }, { status: 201 });
  } catch (error) {
    console.error("POST renewal error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH respond to renewal
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body; // status: "accepted" | "declined"

    const renewal = await prisma.leaseRenewal.update({
      where: { id },
      data: {
        status,
        respondedDate: new Date(),
      },
      include: { tenant: { include: { user: true } } },
    });

    // If accepted, update tenant's lease dates and rent
    if (status === "accepted") {
      await prisma.tenant.update({
        where: { id: renewal.tenantId },
        data: {
          leaseStart: renewal.newLeaseStart,
          leaseEnd: renewal.newLeaseEnd,
          rentAmount: renewal.proposedRent,
        },
      });
    }

    logAudit({ action: status, entity: "lease_renewal", entityId: id, userName: renewal.tenant.user.name, details: `Renewal ${status} by ${renewal.tenant.user.name}` });

    return NextResponse.json({ success: true, status: renewal.status });
  } catch (error) {
    console.error("PATCH renewal error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
