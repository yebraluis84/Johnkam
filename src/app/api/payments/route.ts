import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
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
        method: p.method.toLowerCase().replace("_", " "),
        status: p.status.toLowerCase(),
        confirmationNumber: p.confirmationNumber,
        tenantId: p.tenantId,
        tenantName: p.tenant.user.name,
        unit: p.tenant.unit?.number || "N/A",
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

    const confirmationNumber = `PAY-${Date.now().toString(36).toUpperCase()}`;

    const methodMap: Record<string, string> = {
      "credit_card": "CREDIT_CARD",
      "credit card": "CREDIT_CARD",
      "ach": "ACH",
      "check": "CHECK",
    };

    const payment = await prisma.payment.create({
      data: {
        amount,
        description: description || "Rent Payment",
        method: (methodMap[method?.toLowerCase()] || "CREDIT_CARD") as "CREDIT_CARD" | "ACH" | "CHECK",
        status: "COMPLETED",
        confirmationNumber,
        tenantId,
      },
      include: { tenant: { include: { user: true } } },
    });

    // Update tenant balance
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { balance: { decrement: amount } },
    });

    // Send confirmation email
    const property = await prisma.property.findFirst();
    await sendPaymentConfirmation({
      to: payment.tenant.user.email,
      tenantName: payment.tenant.user.name,
      amount,
      method: method || "Credit Card",
      confirmationNumber,
      propertyName: property?.name || "TenantHub",
    });

    return NextResponse.json({
      id: payment.id,
      confirmationNumber,
      amount,
      status: "completed",
    }, { status: 201 });
  } catch (error) {
    console.error("POST payment error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
