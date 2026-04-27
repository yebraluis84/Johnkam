import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthFromCookie } from "@/lib/auth";

let schemaHealed = false;
async function ensureSchema() {
  if (schemaHealed) return;
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notifyOnNewTicket" BOOLEAN DEFAULT true`
    );
    schemaHealed = true;
  } catch (e) {
    console.error("Schema heal failed:", e);
  }
}

export async function GET() {
  try {
    await ensureSchema();
    const auth = await getAuthFromCookie();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { notifyOnNewTicket: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ notifyOnNewTicket: user.notifyOnNewTicket });
  } catch (error) {
    console.error("GET preferences error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await ensureSchema();
    const auth = await getAuthFromCookie();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { notifyOnNewTicket } = body;

    if (typeof notifyOnNewTicket !== "boolean") {
      return NextResponse.json(
        { error: "notifyOnNewTicket must be a boolean" },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: auth.userId },
      data: { notifyOnNewTicket },
      select: { notifyOnNewTicket: true },
    });

    return NextResponse.json({ success: true, notifyOnNewTicket: updated.notifyOnNewTicket });
  } catch (error) {
    console.error("PATCH preferences error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
