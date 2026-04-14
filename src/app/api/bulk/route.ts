import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendCustomNotification } from "@/lib/email";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "send-notice") {
      const { subject, message, tenantIds } = body;
      if (!subject || !message) {
        return NextResponse.json({ error: "Missing subject or message" }, { status: 400 });
      }

      const property = await prisma.property.findFirst();
      const propertyName = property?.name || "Property Management";

      let tenants;
      if (tenantIds && tenantIds.length > 0) {
        tenants = await prisma.tenant.findMany({
          where: { id: { in: tenantIds } },
          include: { user: true },
        });
      } else {
        tenants = await prisma.tenant.findMany({
          where: { status: "ACTIVE" },
          include: { user: true },
        });
      }

      const emails = tenants.map((t) => t.user.email);
      if (emails.length === 0) {
        return NextResponse.json({ error: "No recipients found" }, { status: 400 });
      }

      await sendCustomNotification({ to: emails, subject, message, propertyName });

      logAudit({
        action: "bulk_notice",
        entity: "notification",
        details: `Sent "${subject}" to ${emails.length} tenants`,
      });

      return NextResponse.json({ success: true, sent: emails.length });
    }

    if (action === "update-rent") {
      const { tenantIds, adjustmentType, adjustmentValue } = body;
      if (!tenantIds?.length || !adjustmentType || !adjustmentValue) {
        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
      }

      const value = parseFloat(adjustmentValue);
      let updated = 0;

      for (const tenantId of tenantIds) {
        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) continue;

        let newRent = tenant.rentAmount;
        if (adjustmentType === "fixed") {
          newRent = value;
        } else if (adjustmentType === "increase") {
          newRent = tenant.rentAmount + value;
        } else if (adjustmentType === "percentage") {
          newRent = tenant.rentAmount * (1 + value / 100);
        }

        await prisma.tenant.update({
          where: { id: tenantId },
          data: { rentAmount: Math.round(newRent * 100) / 100 },
        });
        updated++;
      }

      logAudit({
        action: "bulk_rent_update",
        entity: "tenant",
        details: `Updated rent for ${updated} tenants (${adjustmentType}: ${adjustmentValue})`,
      });

      return NextResponse.json({ success: true, updated });
    }

    if (action === "apply-late-fees") {
      const property = await prisma.property.findFirst();
      const graceDays = property?.lateFeeGraceDays || 5;
      const feeAmount = property?.lateFeeAmount || 50;
      const dueDay = property?.paymentDueDay || 1;

      const now = new Date();
      const currentDay = now.getDate();

      if (currentDay <= dueDay + graceDays) {
        return NextResponse.json({ message: "Not past grace period yet", applied: 0 });
      }

      const overdue = await prisma.tenant.findMany({
        where: { status: "ACTIVE", balance: { gt: 0 } },
      });

      let applied = 0;
      for (const tenant of overdue) {
        await prisma.tenant.update({
          where: { id: tenant.id },
          data: { balance: { increment: feeAmount } },
        });
        applied++;
      }

      logAudit({
        action: "apply_late_fees",
        entity: "payment",
        details: `Applied $${feeAmount} late fee to ${applied} tenants`,
      });

      return NextResponse.json({ success: true, applied, feeAmount });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("POST bulk error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
