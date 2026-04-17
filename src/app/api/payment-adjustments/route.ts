import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";

// POST: Create a manual adjustment (charge, credit, or refund)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, type, amount, description, adminName } = body;
    const parsedAmount = parseFloat(amount);

    if (!tenantId || !type || !parsedAmount || parsedAmount <= 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { user: true, unit: true },
    });
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const confirmation = `ADJ-${Date.now().toString(36).toUpperCase()}`;
    let paymentDescription = "";
    let balanceChange = 0;

    switch (type) {
      case "charge":
        paymentDescription = description || "Manual Charge";
        balanceChange = parsedAmount; // increase balance (tenant owes more)
        break;
      case "credit":
        paymentDescription = description || "Account Credit";
        balanceChange = -parsedAmount; // decrease balance (tenant owes less)
        break;
      case "refund":
        paymentDescription = description || "Payment Refund";
        balanceChange = parsedAmount; // increase balance (reverse a payment)
        break;
      default:
        return NextResponse.json({ error: "Invalid type. Use: charge, credit, refund" }, { status: 400 });
    }

    // Create the payment record
    await prisma.payment.create({
      data: {
        amount: parsedAmount,
        description: paymentDescription,
        method: "ACH", // Adjustments use ACH as placeholder
        status: "COMPLETED",
        confirmationNumber: confirmation,
        tenantId,
      },
    });

    // Update balance
    if (balanceChange > 0) {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { balance: { increment: balanceChange } },
      });
    } else {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { balance: { decrement: Math.abs(balanceChange) } },
      });
    }

    logAudit({
      action: `payment_${type}`,
      entity: "payment",
      entityId: confirmation,
      userName: adminName || "Admin",
      details: `${type.charAt(0).toUpperCase() + type.slice(1)}: $${parsedAmount.toFixed(2)} for ${tenant.user.name} (Unit ${tenant.unit?.number || "?"}) - ${paymentDescription}`,
    });

    return NextResponse.json({
      success: true,
      confirmation,
      type,
      amount: parsedAmount,
      tenantName: tenant.user.name,
      newBalance: tenant.balance + balanceChange,
    });
  } catch (error) {
    console.error("Payment adjustment error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
