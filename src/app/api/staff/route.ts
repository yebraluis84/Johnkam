import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { sendCustomNotification } from "@/lib/email";

// GET all staff (ADMIN and MAINTENANCE users)
export async function GET() {
  try {
    const staff = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "MAINTENANCE", "MANAGEMENT"] } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      staff.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone || "",
        role: s.role,
        createdAt: s.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("GET staff error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST create new staff member
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, role, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const validRoles = ["ADMIN", "MAINTENANCE", "MANAGEMENT"];
    const staffRole = validRoles.includes(role) ? role : "MANAGEMENT";

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        role: staffRole,
        passwordHash,
      },
    });

    // Send welcome email with credentials
    const property = await prisma.property.findFirst();
    const portalUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    sendCustomNotification({
      to: [email],
      subject: `Your ${property?.name || "TenantHub"} Staff Account`,
      message: `Hello ${name},\n\nA ${staffRole === "ADMIN" ? "Admin" : staffRole === "MANAGEMENT" ? "Management" : "Maintenance Staff"} account has been created for you.\n\nLogin: ${portalUrl}/login\nEmail: ${email}\nPassword: ${password}\n\nPlease change your password after your first login.\n\nBest regards,\n${property?.name || "TenantHub"} Management`,
      propertyName: property?.name || "TenantHub",
    }).catch(() => {});

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST staff error:", error);
    const message = error instanceof Error && "code" in error && (error as { code: string }).code === "P2002"
      ? "A user with this email already exists"
      : "Server error";
    return NextResponse.json({ error: message }, { status: message === "Server error" ? 500 : 409 });
  }
}

// DELETE staff member
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.role === "TENANT") return NextResponse.json({ error: "Cannot delete tenant from staff endpoint" }, { status: 400 });

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE staff error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
