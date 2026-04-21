import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { sendTenantInvite } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { applicationId, unitNumber, rent, leaseStart, leaseEnd } = await req.json();
    if (!applicationId) {
      return NextResponse.json({ error: "applicationId required" }, { status: 400 });
    }

    const app = await prisma.rentalApplication.findUnique({ where: { id: applicationId } });
    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }
    if (app.status !== "approved") {
      return NextResponse.json({ error: "Application must be approved first" }, { status: 400 });
    }
    if (app.convertedToTenantId) {
      return NextResponse.json({ error: "Already converted to tenant" }, { status: 409 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: app.email } });
    if (existingUser) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
    }

    const name = `${app.firstName} ${app.lastName}`;
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = await prisma.user.create({
      data: {
        email: app.email,
        passwordHash,
        name,
        phone: app.phone,
        role: "TENANT",
      },
    });

    const unitRecord = unitNumber
      ? await prisma.unit.findUnique({ where: { number: unitNumber } })
      : null;

    const inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase();

    const tenant = await prisma.tenant.create({
      data: {
        userId: user.id,
        unitId: unitRecord?.id,
        leaseStart: leaseStart ? new Date(leaseStart) : null,
        leaseEnd: leaseEnd ? new Date(leaseEnd) : null,
        rentAmount: rent || unitRecord?.rent || 0,
        balance: 0,
        status: "PENDING",
        moveInDate: app.moveInDate ? new Date(app.moveInDate) : null,
        inviteCode,
      },
    });

    if (unitRecord) {
      await prisma.unit.update({
        where: { id: unitRecord.id },
        data: { status: "OCCUPIED" },
      });
    }

    await prisma.rentalApplication.update({
      where: { id: applicationId },
      data: { convertedToTenantId: tenant.id },
    });

    const property = await prisma.property.findFirst();
    await sendTenantInvite({
      to: app.email,
      tenantName: name,
      unit: unitNumber || "TBD",
      propertyName: property?.name || "TenantHub",
      inviteCode,
    });

    return NextResponse.json({
      success: true,
      tenantId: tenant.id,
      name,
      email: app.email,
      unit: unitNumber,
    }, { status: 201 });
  } catch (error) {
    console.error("Convert application error:", error);
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
