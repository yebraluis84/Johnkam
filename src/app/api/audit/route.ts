import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const entity = searchParams.get("entity");

    const where = entity ? { entity } : {};

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json(
      logs.map((l) => ({
        id: l.id,
        action: l.action,
        entity: l.entity,
        entityId: l.entityId,
        userId: l.userId,
        userName: l.userName,
        details: l.details,
        createdAt: l.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("GET audit error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, entity, entityId, userId, userName, details } = body;

    const log = await prisma.auditLog.create({
      data: { action, entity, entityId, userId, userName, details },
    });

    return NextResponse.json({ id: log.id }, { status: 201 });
  } catch (error) {
    console.error("POST audit error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
