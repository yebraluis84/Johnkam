import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const amenityId = new URL(req.url).searchParams.get("amenityId");
    const tenantId = new URL(req.url).searchParams.get("tenantId");
    const where: Record<string, string> = {};
    if (amenityId) where.amenityId = amenityId;
    if (tenantId) where.tenantId = tenantId;

    const bookings = await prisma.amenityBooking.findMany({
      where,
      include: { amenity: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(bookings.map((b) => ({
      id: b.id, amenityId: b.amenityId, amenityName: b.amenity.name,
      tenantId: b.tenantId, tenantName: b.tenantName, unit: b.unit,
      date: b.date, startTime: b.startTime, endTime: b.endTime,
      notes: b.notes, status: b.status, createdAt: b.createdAt.toISOString(),
    })));
  } catch (error) {
    console.error("GET bookings error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const booking = await prisma.amenityBooking.create({ data: {
      amenityId: body.amenityId, tenantId: body.tenantId,
      tenantName: body.tenantName, unit: body.unit,
      date: body.date, startTime: body.startTime, endTime: body.endTime,
      notes: body.notes,
    }});
    return NextResponse.json({ id: booking.id }, { status: 201 });
  } catch (error) {
    console.error("POST booking error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await prisma.amenityBooking.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE booking error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
