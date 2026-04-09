import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET document by sign token (for the signing page)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const doc = await prisma.document.findUnique({
      where: { signToken: token },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found or link expired" }, { status: 404 });
    }

    // Get tenant info
    let tenantName = "";
    let unitNumber = "";
    if (doc.tenantId) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: doc.tenantId },
        include: { user: true, unit: true },
      });
      tenantName = tenant?.user.name || "";
      unitNumber = tenant?.unit?.number || "";
    }

    return NextResponse.json({
      id: doc.id,
      name: doc.name,
      content: doc.content,
      status: doc.status,
      signedAt: doc.signedAt?.toISOString() || null,
      signedName: doc.signedName,
      tenantName,
      unitNumber,
    });
  } catch (error) {
    console.error("GET sign document error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST sign the document
export async function POST(req: NextRequest) {
  try {
    const { token, signedName } = await req.json();

    if (!token || !signedName) {
      return NextResponse.json({ error: "Token and signature name required" }, { status: 400 });
    }

    const doc = await prisma.document.findUnique({
      where: { signToken: token },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (doc.status === "signed") {
      return NextResponse.json({ error: "Document already signed" }, { status: 400 });
    }

    const updated = await prisma.document.update({
      where: { signToken: token },
      data: {
        status: "signed",
        signedAt: new Date(),
        signedName,
      },
    });

    return NextResponse.json({
      success: true,
      signedAt: updated.signedAt?.toISOString(),
      signedName: updated.signedName,
    });
  } catch (error) {
    console.error("POST sign document error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
