import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const surveyId = new URL(req.url).searchParams.get("surveyId");
    if (!surveyId) return NextResponse.json({ error: "Missing surveyId" }, { status: 400 });

    const responses = await prisma.surveyResponse.findMany({
      where: { surveyId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(responses.map((r) => ({
      id: r.id, surveyId: r.surveyId, tenantId: r.tenantId,
      tenantName: r.tenantName, unit: r.unit,
      answers: JSON.parse(r.answers), rating: r.rating,
      comment: r.comment, createdAt: r.createdAt.toISOString(),
    })));
  } catch (error) {
    console.error("GET responses error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const resp = await prisma.surveyResponse.create({ data: {
      surveyId: body.surveyId, tenantId: body.tenantId,
      tenantName: body.tenantName, unit: body.unit,
      answers: JSON.stringify(body.answers || []),
      rating: body.rating, comment: body.comment,
    }});
    return NextResponse.json({ id: resp.id }, { status: 201 });
  } catch (error) {
    console.error("POST response error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
