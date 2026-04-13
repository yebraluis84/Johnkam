import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const vendors = await prisma.vendor.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(vendors.map((v) => ({
      id: v.id, name: v.name, company: v.company, email: v.email,
      phone: v.phone, specialty: v.specialty, rating: v.rating,
      notes: v.notes, status: v.status, createdAt: v.createdAt.toISOString(),
    })));
  } catch (error) {
    console.error("GET vendors error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const vendor = await prisma.vendor.create({ data: {
      name: body.name, company: body.company, email: body.email,
      phone: body.phone, specialty: body.specialty,
      rating: body.rating || 0, notes: body.notes,
    }});
    return NextResponse.json({ id: vendor.id }, { status: 201 });
  } catch (error) {
    console.error("POST vendor error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    await prisma.vendor.update({ where: { id }, data });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH vendor error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await prisma.vendor.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE vendor error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
