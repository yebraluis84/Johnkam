import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const category = searchParams.get("category");

    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (from || to) {
      where.date = {};
      if (from) (where.date as Record<string, unknown>).gte = new Date(from);
      if (to) (where.date as Record<string, unknown>).lte = new Date(to);
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return NextResponse.json(
      expenses.map((e) => ({
        id: e.id,
        category: e.category,
        description: e.description,
        amount: e.amount,
        vendor: e.vendor,
        date: e.date.toISOString(),
        recurring: e.recurring,
        notes: e.notes,
        createdBy: e.createdBy,
        createdAt: e.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("GET expenses error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const expense = await prisma.expense.create({
      data: {
        category: body.category,
        description: body.description,
        amount: parseFloat(body.amount),
        vendor: body.vendor || null,
        date: new Date(body.date),
        recurring: body.recurring || false,
        notes: body.notes || null,
        createdBy: body.createdBy || null,
      },
    });

    logAudit({
      action: "create",
      entity: "expense",
      entityId: expense.id,
      userName: body.createdBy,
      details: `$${body.amount} - ${body.description}`,
    });

    return NextResponse.json({ id: expense.id }, { status: 201 });
  } catch (error) {
    console.error("POST expense error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await prisma.expense.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE expense error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
