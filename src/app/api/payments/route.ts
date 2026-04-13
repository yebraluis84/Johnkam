import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";

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

    return NextResponse.json(payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      description: p.description,
      method: p.method.toLowerCase(),
      status: p.status.toLowerCase(),
      confirmationNumber: p.confirmationNumber,
      tenantId: p.tenantId,
      tenantName: p.tenant.user.name,
      unit: p.tenant.unit?.number || "",
      createdAt: p.createdAt.toISOString(),
    })));
  } catch (error) {
    console.error("GET payments error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, description, method, tenantId } = body;

    const confirmation = `PAY-${Date.now().toString(36).toUpperCase()}`;

    const payment = await prisma.payment.create({
      data: {
        amount: parseFloat(amount),
        description: description || "Rent Payment",
        method: (method || "ACH").toUpperCase() as "CREDIT_CARD" | "ACH" | "CHECK",
        status: "COMPLETED",
        confirmationNumber: confirmation,
        tenantId,
      },
      include: { tenant: { include: { user: true } } },
    });

    // Update tenant balance
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { balance: { decrement: parseFloat(amount) } },
    });

    logAudit({
      action: "payment",
      entity: "payment",
      entityId: payment.id,
      userName: payment.tenant.user.name,
      details: `$${amount} payment via ${method}`,
    });

    return NextResponse.json({
      id: payment.id,
      confirmationNumber: confirmation,
      status: "completed",
    }, { status: 201 });
  } catch (error) {
    console.error("POST payment error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
