import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const spots = await prisma.parkingSpot.findMany({ orderBy: { spotNumber: "asc" } });
    return NextResponse.json(spots.map((s) => ({
      id: s.id, spotNumber: s.spotNumber, type: s.type, level: s.level,
      tenantId: s.tenantId, tenantName: s.tenantName, unit: s.unit,
      monthlyFee: s.monthlyFee, status: s.status,
    })));
  } catch (error) {
    console.error("GET parking error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const spot = await prisma.parkingSpot.create({ data: {
      spotNumber: body.spotNumber, type: body.type || "standard",
      level: body.level, monthlyFee: body.monthlyFee || 0,
    }});
    return NextResponse.json({ id: spot.id }, { status: 201 });
  } catch (error) {
    console.error("POST parking error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, tenantId, tenantName, unit, status } = body;
    const data: Record<string, unknown> = {};
    if (tenantId !== undefined) data.tenantId = tenantId;
    if (tenantName !== undefined) data.tenantName = tenantName;
    if (unit !== undefined) data.unit = unit;
    if (status) data.status = status;
    await prisma.parkingSpot.update({ where: { id }, data });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH parking error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await prisma.parkingSpot.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE parking error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
