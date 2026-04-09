import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const unitId = searchParams.get("unitId");

    const where: Record<string, string> = {};
    if (type) where.type = type;
    if (unitId) where.unitId = unitId;

    const checklists = await prisma.checklist.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      checklists.map((c) => ({
        id: c.id,
        type: c.type,
        unitId: c.unitId,
        tenantId: c.tenantId,
        tenantName: c.tenantName,
        unitNumber: c.unitNumber,
        items: JSON.parse(c.items),
        notes: c.notes,
        completedAt: c.completedAt?.toISOString() || null,
        completedBy: c.completedBy,
        createdAt: c.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("GET checklists error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, unitId, tenantId, tenantName, unitNumber, items, notes } = body;

    const checklist = await prisma.checklist.create({
      data: {
        type,
        unitId,
        tenantId,
        tenantName,
        unitNumber,
        items: JSON.stringify(items || []),
        notes,
      },
    });

    logAudit({ action: "create", entity: "checklist", entityId: checklist.id, details: `${type} checklist for Unit ${unitNumber}` });

    return NextResponse.json({ id: checklist.id }, { status: 201 });
  } catch (error) {
    console.error("POST checklist error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, items, notes, completedBy } = body;

    const data: Record<string, unknown> = {};
    if (items) data.items = JSON.stringify(items);
    if (notes !== undefined) data.notes = notes;
    if (completedBy) {
      data.completedBy = completedBy;
      data.completedAt = new Date();
    }

    await prisma.checklist.update({ where: { id }, data });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH checklist error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await prisma.checklist.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE checklist error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
