import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, inviteCode } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    });

    if (!user) {
      return NextResponse.json({ error: "No account found with this email. Please contact your property manager." }, { status: 404 });
    }

    if (!user.tenant) {
      return NextResponse.json({ error: "No tenant record found for this account." }, { status: 404 });
    }

    // Verify invite code if provided
    if (inviteCode && user.tenant.inviteCode && user.tenant.inviteCode !== inviteCode) {
      return NextResponse.json({ error: "Invalid invitation code." }, { status: 403 });
    }

    // Update password
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Activate tenant
    await prisma.tenant.update({
      where: { id: user.tenant.id },
      data: { status: "ACTIVE", inviteCode: null },
    });

    return NextResponse.json({
      success: true,
      message: "Account activated! You can now log in.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
