import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const unit = new URL(req.url).searchParams.get("unit");
    const status = new URL(req.url).searchParams.get("status");
    const where: Record<string, string> = {};
    if (unit) where.unit = unit;
    if (status) where.status = status;

    const packages = await prisma.package.findMany({ where, orderBy: { createdAt: "desc" } });
    return NextResponse.json(packages.map((p) => ({
      id: p.id, carrier: p.carrier, trackingNo: p.trackingNo,
      tenantId: p.tenantId, tenantName: p.tenantName, unit: p.unit,
      description: p.description, status: p.status, receivedBy: p.receivedBy,
      pickedUpAt: p.pickedUpAt?.toISOString() || null,
      notifiedAt: p.notifiedAt?.toISOString() || null,
      createdAt: p.createdAt.toISOString(),
    })));
  } catch (error) {
    console.error("GET packages error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pkg = await prisma.package.create({ data: {
      carrier: body.carrier, trackingNo: body.trackingNo,
      tenantId: body.tenantId, tenantName: body.tenantName, unit: body.unit,
      description: body.description, receivedBy: body.receivedBy,
    }});
    return NextResponse.json({ id: pkg.id }, { status: 201 });
  } catch (error) {
    console.error("POST package error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;
    const data: Record<string, unknown> = { status };
    if (status === "picked_up") data.pickedUpAt = new Date();
    await prisma.package.update({ where: { id }, data });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH package error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
