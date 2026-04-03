import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const units = await prisma.unit.findMany({
      include: { tenants: { include: { user: true } }, property: true },
      orderBy: { number: "asc" },
    });

    return NextResponse.json(
      units.map((u) => ({
        id: u.id,
        number: u.number,
        floor: u.floor,
        bedrooms: u.bedrooms,
        bathrooms: u.bathrooms,
        sqft: u.sqft,
        rent: u.rent,
        status: u.status.toLowerCase(),
        availableDate: u.availableDate?.toISOString().split("T")[0] || "",
        features: u.features,
        propertyId: u.propertyId,
        propertyName: u.property?.name || "",
        tenant: u.tenants[0]
          ? { id: u.tenants[0].id, name: u.tenants[0].user.name }
          : null,
      }))
    );
  } catch (error) {
    console.error("GET units error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { number, floor, bedrooms, bathrooms, sqft, rent, features, propertyId } = body;

    const unit = await prisma.unit.create({
      data: {
        number,
        floor: floor || 1,
        bedrooms: bedrooms || 1,
        bathrooms: bathrooms || 1,
        sqft: sqft || 0,
        rent: rent || 0,
        status: "AVAILABLE",
        features: features || [],
        propertyId: propertyId || null,
      },
    });

    return NextResponse.json(unit, { status: 201 });
  } catch (error: unknown) {
    console.error("POST unit error:", error);
    const message =
      error instanceof Error && "code" in error && (error as { code: string }).code === "P2002"
        ? "A unit with this number already exists"
        : "Server error";
    return NextResponse.json({ error: message }, { status: message === "Server error" ? 500 : 409 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await prisma.unit.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE unit error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
