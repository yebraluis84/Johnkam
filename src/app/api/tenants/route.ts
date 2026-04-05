import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { sendTenantInvite } from "@/lib/email";

// GET all tenants
export async function GET() {
  try {
    const tenants = await prisma.tenant.findMany({
      include: { user: true, unit: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      tenants.map((t) => ({
        id: t.id,
        name: t.user.name,
        email: t.user.email,
        phone: t.user.phone || "",
        unit: t.unit?.number || "Unassigned",
        leaseStart: t.leaseStart?.toISOString().split("T")[0] || "",
        leaseEnd: t.leaseEnd?.toISOString().split("T")[0] || "",
        rentAmount: t.rentAmount,
        balance: t.balance,
        status: t.status.toLowerCase(),
        moveInDate: t.moveInDate?.toISOString().split("T")[0] || "",
        userId: t.userId,
      }))
    );
  } catch (error) {
    console.error("GET tenants error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST create new tenant
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      unit: unitNumber,
      rent,
      leaseStart,
      leaseEnd,
      moveIn,
      sendInvite,
    } = body;

    const name = `${firstName} ${lastName}`;

    // Create user with temp password
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        phone,
        role: "TENANT",
      },
    });

    // Find unit
    const unitRecord = unitNumber
      ? await prisma.unit.findUnique({ where: { number: unitNumber } })
      : null;

    // Create tenant record
    const tenant = await prisma.tenant.create({
      data: {
        userId: user.id,
        unitId: unitRecord?.id,
        leaseStart: leaseStart ? new Date(leaseStart) : null,
        leaseEnd: leaseEnd ? new Date(leaseEnd) : null,
        rentAmount: rent || 0,
        balance: 0,
        status: "PENDING",
        moveInDate: moveIn ? new Date(moveIn) : null,
      },
    });

    // Mark unit as occupied
    if (unitRecord) {
      await prisma.unit.update({
        where: { id: unitRecord.id },
        data: { status: "OCCUPIED" },
      });
    }

    // Send invite email
    let emailResult = null;
    if (sendInvite !== false) {
      const property = await prisma.property.findFirst();
      emailResult = await sendTenantInvite({
        to: email,
        tenantName: name,
        unit: unitNumber || "TBD",
        propertyName: property?.name || "TenantHub",
      });

      // Log notification
      await prisma.notificationLog.create({
        data: {
          templateName: "Tenant Invitation",
          recipient: name,
          email,
          subject: `Welcome to ${property?.name || "TenantHub"} - Your Tenant Portal Invitation`,
          status: emailResult.success ? "delivered" : "bounced",
          channel: "email",
        },
      });
    }

    return NextResponse.json({
      id: tenant.id,
      name,
      email,
      unit: unitNumber,
      emailSent: emailResult?.success || false,
    }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST tenant error:", error);
    const message = error instanceof Error && "code" in error && (error as { code: string }).code === "P2002"
      ? "A user with this email already exists"
      : "Server error";
    return NextResponse.json({ error: message }, { status: message === "Server error" ? 500 : 409 });
  }
}

// DELETE tenant
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    // Get tenant to find userId and unitId
    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

    // Free up the unit
    if (tenant.unitId) {
      await prisma.unit.update({
        where: { id: tenant.unitId },
        data: { status: "AVAILABLE" },
      });
    }

    // Delete tenant (cascades tickets, payments, etc.)
    await prisma.tenant.delete({ where: { id } });

    // Delete the user account too
    await prisma.user.delete({ where: { id: tenant.userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE tenant error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
