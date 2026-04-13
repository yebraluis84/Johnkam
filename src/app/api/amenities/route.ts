import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const amenities = await prisma.amenity.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(amenities.map((a) => ({
      id: a.id, name: a.name, description: a.description, location: a.location,
      capacity: a.capacity, requiresBooking: a.requiresBooking,
      availableFrom: a.availableFrom, availableTo: a.availableTo,
      rules: a.rules, status: a.status,
    })));
  } catch (error) {
    console.error("GET amenities error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const amenity = await prisma.amenity.create({ data: {
      name: body.name, description: body.description, location: body.location,
      capacity: body.capacity || 0, requiresBooking: body.requiresBooking ?? true,
      availableFrom: body.availableFrom || "08:00", availableTo: body.availableTo || "22:00",
      rules: body.rules,
    }});
    return NextResponse.json({ id: amenity.id }, { status: 201 });
  } catch (error) {
    console.error("POST amenity error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await prisma.amenity.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE amenity error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
