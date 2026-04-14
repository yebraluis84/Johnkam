import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendCustomNotification } from "@/lib/email";
import { logAudit } from "@/lib/audit";

export async function POST() {
  try {
    const property = await prisma.property.findFirst();
    if (!property) {
      return NextResponse.json({ error: "No property configured" }, { status: 400 });
    }

    const tenants = await prisma.tenant.findMany({
      where: { status: "ACTIVE", balance: { gt: 0 } },
      include: { user: true, unit: true },
    });

    if (tenants.length === 0) {
      return NextResponse.json({ message: "No overdue tenants", sent: 0 });
    }

    const dueDay = property.paymentDueDay;
    const now = new Date();
    const currentDay = now.getDate();
    const isOverdue = currentDay > dueDay;

    const results: string[] = [];

    for (const tenant of tenants) {
      const subject = isOverdue
        ? `Overdue Rent Notice - ${property.name}`
        : `Rent Reminder - Payment Due ${dueDay}th - ${property.name}`;

      const message = isOverdue
        ? `Dear ${tenant.user.name},\n\nThis is a reminder that your rent payment of $${tenant.rentAmount.toFixed(2)} was due on the ${dueDay}th of this month. Your current balance is $${tenant.balance.toFixed(2)}.\n\nPlease make your payment as soon as possible to avoid additional late fees.\n\nUnit: ${tenant.unit?.number || "N/A"}\nAmount Due: $${tenant.balance.toFixed(2)}\n\nYou can pay online through your tenant portal.\n\nThank you,\n${property.name} Management`
        : `Dear ${tenant.user.name},\n\nThis is a friendly reminder that your rent payment of $${tenant.rentAmount.toFixed(2)} is due on the ${dueDay}th of this month.\n\nCurrent Balance: $${tenant.balance.toFixed(2)}\nUnit: ${tenant.unit?.number || "N/A"}\n\nYou can pay online through your tenant portal.\n\nThank you,\n${property.name} Management`;

      try {
        await sendCustomNotification({
          to: [tenant.user.email],
          subject,
          message,
          propertyName: property.name,
        });
        results.push(`Sent to ${tenant.user.name} (${tenant.user.email})`);
      } catch {
        results.push(`Failed: ${tenant.user.name}`);
      }
    }

    logAudit({
      action: "send_reminders",
      entity: "payment",
      details: `Sent ${results.length} rent reminders`,
    });

    return NextResponse.json({
      message: "Reminders sent",
      sent: results.length,
      results,
    });
  } catch (error) {
    console.error("POST reminders error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
