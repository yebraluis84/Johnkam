import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const adminEmail = body.email || "admin@mapleheights.com";
    const adminPassword = body.password || "admin2026";
    const adminName = body.name || "Admin User";

    // Check if any admin exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (existingAdmin) {
      return NextResponse.json({ message: "Admin account already exists", email: existingAdmin.email });
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Create admin user only
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: adminName,
        role: "ADMIN",
      },
    });

    return NextResponse.json({
      message: "Admin account created successfully! Log in and set up your property from the Settings page.",
      email: admin.email,
    }, { status: 201 });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seed failed", details: String(error) }, { status: 500 });
  }
}
