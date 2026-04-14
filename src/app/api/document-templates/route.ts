import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const templates = await prisma.documentTemplate.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(
      templates.map((t) => ({
        id: t.id,
        name: t.name,
        type: t.type,
        content: t.content,
        variables: JSON.parse(t.variables),
        createdBy: t.createdBy,
        createdAt: t.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("GET templates error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const template = await prisma.documentTemplate.create({
      data: {
        name: body.name,
        type: body.type,
        content: body.content,
        variables: JSON.stringify(body.variables || []),
        createdBy: body.createdBy || null,
      },
    });
    return NextResponse.json({ id: template.id }, { status: 201 });
  } catch (error) {
    console.error("POST template error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await prisma.documentTemplate.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE template error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
