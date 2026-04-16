import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";

// POST: Apply late fees to overdue tenants
export async function POST() {
  try {
    const property = await prisma.property.findFirst();
    if (!property) {
      return NextResponse.json({ error: "No property configured" }, { status: 400 });
    }

    const { paymentDueDay, lateFeeGraceDays, lateFeeAmount } = property;
    const today = new Date();
    const currentDay = today.getDate();

    // Late fee applies after due day + grace days
    const lateThreshold = paymentDueDay + lateFeeGraceDays;
    if (currentDay <= lateThreshold) {
      return NextResponse.json({
        message: "Not yet past grace period",
        dueDay: paymentDueDay,
        graceDays: lateFeeGraceDays,
        lateAfterDay: lateThreshold,
        currentDay,
        applied: 0,
      });
    }

    // Find active tenants with outstanding balance (meaning they haven't paid this month)
    const tenants = await prisma.tenant.findMany({
      where: { status: "ACTIVE", balance: { gt: 0 } },
      include: { user: true, unit: true },
    });

    // Check which tenants already got a late fee this month
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const existingFees = await prisma.payment.findMany({
      where: {
        description: { contains: "Late Fee" },
        createdAt: { gte: monthStart },
      },
    });
    const alreadyCharged = new Set(existingFees.map((f) => f.tenantId));

    const applied: { tenantName: string; unit: string; amount: number }[] = [];

    for (const tenant of tenants) {
      if (alreadyCharged.has(tenant.id)) continue;

      // Add late fee as a charge (negative payment = charge added to balance)
      await prisma.payment.create({
        data: {
          amount: lateFeeAmount,
          description: `Late Fee - ${today.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
          method: "ACH",
          status: "COMPLETED",
          confirmationNumber: `LF-${Date.now().toString(36).toUpperCase()}`,
          tenantId: tenant.id,
        },
      });

      // Add late fee to balance
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: { balance: { increment: lateFeeAmount } },
      });

      logAudit({
        action: "late_fee",
        entity: "tenant",
        entityId: tenant.id,
        details: `Late fee of $${lateFeeAmount.toFixed(2)} applied to ${tenant.user.name} (Unit ${tenant.unit?.number || "?"})`,
      });

      applied.push({
        tenantName: tenant.user.name,
        unit: tenant.unit?.number || "",
        amount: lateFeeAmount,
      });
    }

    return NextResponse.json({
      message: `Applied ${applied.length} late fee(s)`,
      lateFeeAmount,
      applied,
    });
  } catch (error) {
    console.error("Late fees error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET: Preview which tenants would get late fees
export async function GET() {
  try {
    const property = await prisma.property.findFirst();
    if (!property) {
      return NextResponse.json({ error: "No property configured" }, { status: 400 });
    }

    const { paymentDueDay, lateFeeGraceDays, lateFeeAmount } = property;
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const tenants = await prisma.tenant.findMany({
      where: { status: "ACTIVE", balance: { gt: 0 } },
      include: { user: true, unit: true },
    });

    const existingFees = await prisma.payment.findMany({
      where: {
        description: { contains: "Late Fee" },
        createdAt: { gte: monthStart },
      },
    });
    const alreadyCharged = new Set(existingFees.map((f) => f.tenantId));

    const eligible = tenants
      .filter((t) => !alreadyCharged.has(t.id))
      .map((t) => ({
        id: t.id,
        tenantName: t.user.name,
        unit: t.unit?.number || "",
        balance: t.balance,
        alreadyCharged: false,
      }));

    const charged = tenants
      .filter((t) => alreadyCharged.has(t.id))
      .map((t) => ({
        id: t.id,
        tenantName: t.user.name,
        unit: t.unit?.number || "",
        balance: t.balance,
        alreadyCharged: true,
      }));

    return NextResponse.json({
      paymentDueDay,
      lateFeeGraceDays,
      lateFeeAmount,
      currentDay: today.getDate(),
      pastGracePeriod: today.getDate() > paymentDueDay + lateFeeGraceDays,
      eligible,
      alreadyCharged: charged,
    });
  } catch (error) {
    console.error("GET late fees error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
