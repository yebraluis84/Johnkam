import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "summary";
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const dateFilter: Record<string, unknown> = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);
    const hasDateFilter = from || to;

    if (type === "rent-roll") {
      const tenants = await prisma.tenant.findMany({
        where: { status: "ACTIVE" },
        include: { user: true, unit: true },
        orderBy: { createdAt: "desc" },
      });

      const rentRoll = tenants.map((t) => ({
        tenantName: t.user.name,
        email: t.user.email,
        unit: t.unit?.number || "",
        rentAmount: t.rentAmount,
        balance: t.balance,
        leaseStart: t.leaseStart?.toISOString() || "",
        leaseEnd: t.leaseEnd?.toISOString() || "",
        status: t.status,
      }));

      const totalRent = rentRoll.reduce((s, r) => s + r.rentAmount, 0);
      const totalBalance = rentRoll.reduce((s, r) => s + r.balance, 0);

      return NextResponse.json({ rentRoll, totalRent, totalBalance });
    }

    if (type === "income") {
      const payments = await prisma.payment.findMany({
        where: {
          status: "COMPLETED",
          ...(hasDateFilter ? { createdAt: dateFilter } : {}),
        },
        include: { tenant: { include: { user: true, unit: true } } },
        orderBy: { createdAt: "desc" },
      });

      const income = payments.map((p) => ({
        date: p.createdAt.toISOString(),
        tenantName: p.tenant.user.name,
        unit: p.tenant.unit?.number || "",
        amount: p.amount,
        method: p.method,
        confirmation: p.confirmationNumber,
      }));

      const totalIncome = income.reduce((s, i) => s + i.amount, 0);
      return NextResponse.json({ income, totalIncome });
    }

    if (type === "expenses") {
      const expenses = await prisma.expense.findMany({
        where: hasDateFilter ? { date: dateFilter } : {},
        orderBy: { date: "desc" },
      });

      const expenseData = expenses.map((e) => ({
        date: e.date.toISOString(),
        category: e.category,
        description: e.description,
        amount: e.amount,
        vendor: e.vendor,
      }));

      const totalExpenses = expenseData.reduce((s, e) => s + e.amount, 0);
      const byCategory: Record<string, number> = {};
      expenseData.forEach((e) => {
        byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
      });

      return NextResponse.json({ expenses: expenseData, totalExpenses, byCategory });
    }

    // Summary report
    const [tenantCount, paymentTotal, expenseTotal, openTickets, occupiedUnits, totalUnits] =
      await Promise.all([
        prisma.tenant.count({ where: { status: "ACTIVE" } }),
        prisma.payment.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true } }),
        prisma.expense.aggregate({ _sum: { amount: true } }),
        prisma.maintenanceTicket.count({
          where: { status: { in: ["OPEN", "IN_PROGRESS", "SCHEDULED"] } },
        }),
        prisma.unit.count({ where: { status: "OCCUPIED" } }),
        prisma.unit.count(),
      ]);

    return NextResponse.json({
      activeTenants: tenantCount,
      totalIncome: paymentTotal._sum.amount || 0,
      totalExpenses: expenseTotal._sum.amount || 0,
      netIncome: (paymentTotal._sum.amount || 0) - (expenseTotal._sum.amount || 0),
      openTickets,
      occupancyRate: totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0,
      occupiedUnits,
      totalUnits,
    });
  } catch (error) {
    console.error("GET reports error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
