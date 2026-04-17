import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { sendPaymentConfirmation } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId");
    const where = tenantId ? { tenantId } : {};

    const payments = await prisma.payment.findMany({
      where,
      include: { tenant: { include: { user: true, unit: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        description: p.description,
        method: p.method.toLowerCase(),
        status: p.status.toLowerCase(),
        confirmationNumber: p.confirmationNumber,
        tenantId: p.tenantId,
        tenantName: p.tenant.user.name,
        tenantEmail: p.tenant.user.email,
        unit: p.tenant.unit?.number || "",
        createdAt: p.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("GET payments error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, description, method, tenantId } = body;
    const parsedAmount = parseFloat(amount);

    if (!parsedAmount || parsedAmount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { user: true, unit: true },
    });
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const confirmation = `PAY-${Date.now().toString(36).toUpperCase()}`;
    const methodUpper = (method || "ACH").toUpperCase() as
      | "CREDIT_CARD"
      | "ACH"
      | "CHECK";

    const payment = await prisma.payment.create({
      data: {
        amount: parsedAmount,
        description: description || "Rent Payment",
        method: methodUpper,
        status: "COMPLETED",
        confirmationNumber: confirmation,
        tenantId,
      },
    });

    // Update tenant balance
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { balance: { decrement: parsedAmount } },
    });

    logAudit({
      action: "payment",
      entity: "payment",
      entityId: payment.id,
      userName: tenant.user.name,
      details: `$${parsedAmount.toFixed(2)} payment via ${methodUpper} - ${confirmation}`,
    });

    // Send email receipt (fire-and-forget)
    const property = await prisma.property.findFirst();
    sendPaymentConfirmation({
      to: tenant.user.email,
      tenantName: tenant.user.name,
      amount: parsedAmount,
      method: methodUpper,
      confirmationNumber: confirmation,
      propertyName: property?.name || "TenantHub",
    }).catch(() => {});

    return NextResponse.json(
      {
        id: payment.id,
        confirmationNumber: confirmation,
        status: "completed",
        amount: parsedAmount,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST payment error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
