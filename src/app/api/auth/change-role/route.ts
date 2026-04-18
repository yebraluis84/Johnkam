import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, role } = await req.json();

    if (!email || !role) {
      return NextResponse.json({ error: "Email and role required" }, { status: 400 });
    }

    if (!["ADMIN", "MAINTENANCE", "TENANT", "MANAGEMENT"].includes(role)) {
      return NextResponse.json({ error: "Invalid role. Must be ADMIN, MAINTENANCE, MANAGEMENT, or TENANT" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { email },
      data: { role },
    });

    return NextResponse.json({
      success: true,
      email: updated.email,
      name: updated.name,
      role: updated.role,
    });
  } catch (error) {
    console.error("Change role error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
