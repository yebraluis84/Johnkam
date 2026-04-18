import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Returns notifications relevant to maintenance staff:
// - New tickets (created since lastSeen, or all open tickets if no lastSeen)
// - High/urgent priority tickets that are still active
// - Overdue tickets (open > 48 hours, not completed/closed)
export async function GET() {
  try {
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const tickets = await prisma.maintenanceTicket.findMany({
      where: {
        status: { notIn: ["COMPLETED", "CLOSED"] },
      },
      include: {
        tenant: { include: { user: true, unit: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const notifications = tickets.map((t) => {
      const isHighPriority = t.priority === "HIGH" || t.priority === "URGENT";
      const isOverdue = t.createdAt < twoDaysAgo && t.status === "OPEN";

      const reasons: string[] = [];
      if (t.status === "OPEN") reasons.push("open");
      if (isHighPriority) reasons.push(t.priority.toLowerCase());
      if (isOverdue) reasons.push("overdue");

      return {
        id: t.id,
        ticketNumber: t.ticketNumber,
        title: t.title,
        priority: t.priority.toLowerCase(),
        status: t.status.toLowerCase().replace("_", "-"),
        tenantName: t.tenant.user.name,
        unit: t.tenant.unit?.number || "N/A",
        createdAt: t.createdAt.toISOString(),
        isHighPriority,
        isOverdue,
        reasons,
      };
    });

    return NextResponse.json({
      notifications,
      counts: {
        total: notifications.length,
        open: notifications.filter((n) => n.status === "open").length,
        highPriority: notifications.filter((n) => n.isHighPriority).length,
        overdue: notifications.filter((n) => n.isOverdue).length,
      },
    });
  } catch (error) {
    console.error("GET staff-notifications error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
