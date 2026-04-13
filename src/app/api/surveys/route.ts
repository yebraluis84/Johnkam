import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const surveys = await prisma.survey.findMany({
      include: { responses: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(surveys.map((s) => ({
      id: s.id, title: s.title, description: s.description,
      questions: JSON.parse(s.questions), status: s.status,
      createdBy: s.createdBy, responseCount: s.responses.length,
      avgRating: s.responses.length > 0
        ? Math.round((s.responses.reduce((sum, r) => sum + (r.rating || 0), 0) / s.responses.filter(r => r.rating).length) * 10) / 10
        : null,
      createdAt: s.createdAt.toISOString(),
      expiresAt: s.expiresAt?.toISOString() || null,
    })));
  } catch (error) {
    console.error("GET surveys error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const survey = await prisma.survey.create({ data: {
      title: body.title, description: body.description,
      questions: JSON.stringify(body.questions || []),
      createdBy: body.createdBy,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    }});
    return NextResponse.json({ id: survey.id }, { status: 201 });
  } catch (error) {
    console.error("POST survey error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await prisma.survey.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE survey error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
