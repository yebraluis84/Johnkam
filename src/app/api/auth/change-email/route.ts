import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { currentEmail, newEmail } = body;

    if (!currentEmail || !newEmail) {
      return NextResponse.json({ error: "currentEmail and newEmail are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: currentEmail } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { email: newEmail },
    });

    return NextResponse.json({ success: true, message: `Email changed from ${currentEmail} to ${newEmail}` });
  } catch (error) {
    console.error("Change email error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
