import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendLeaseDocument } from "@/lib/email";
import crypto from "crypto";

// GET all lease documents (admin) or tenant's documents
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId");

    const where: Record<string, unknown> = { type: "lease" };
    if (tenantId) where.tenantId = tenantId;

    const docs = await prisma.document.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Get tenant info for each doc
    const tenantIds = [...new Set(docs.map((d) => d.tenantId).filter(Boolean))];
    const tenants = tenantIds.length
      ? await prisma.tenant.findMany({
          where: { id: { in: tenantIds as string[] } },
          include: { user: true, unit: true },
        })
      : [];

    const tenantMap = new Map(tenants.map((t) => [t.id, t]));

    return NextResponse.json(
      docs.map((d) => {
        const tenant = d.tenantId ? tenantMap.get(d.tenantId) : null;
        return {
          id: d.id,
          name: d.name,
          type: d.type,
          content: d.content,
          status: d.status,
          tenantId: d.tenantId,
          tenantName: tenant?.user.name || "",
          tenantEmail: tenant?.user.email || "",
          unitNumber: tenant?.unit?.number || "",
          signedAt: d.signedAt?.toISOString() || null,
          signedName: d.signedName,
          createdAt: d.createdAt.toISOString(),
        };
      })
    );
  } catch (error) {
    console.error("GET documents error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST create and send lease document
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, name, content, sendEmail } = body;

    if (!tenantId || !name || !content) {
      return NextResponse.json(
        { error: "tenantId, name, and content are required" },
        { status: 400 }
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { user: true, unit: true },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const signToken = crypto.randomBytes(32).toString("hex");

    const doc = await prisma.document.create({
      data: {
        name,
        type: "lease",
        content,
        tenantId,
        signToken,
        status: "pending",
      },
    });

    let emailSent = false;
    if (sendEmail !== false) {
      const property = await prisma.property.findFirst();
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://johnkam.vercel.app";
      const signUrl = `${appUrl}/sign/${signToken}`;

      const result = await sendLeaseDocument({
        to: tenant.user.email,
        tenantName: tenant.user.name,
        documentName: name,
        propertyName: property?.name || "TenantHub",
        signUrl,
      });
      emailSent = result.success;

      await prisma.notificationLog.create({
        data: {
          templateName: "Lease Document",
          recipient: tenant.user.name,
          email: tenant.user.email,
          subject: `Lease Document Ready for Signature - ${name}`,
          status: emailSent ? "delivered" : "bounced",
          channel: "email",
        },
      });
    }

    return NextResponse.json(
      {
        id: doc.id,
        name: doc.name,
        status: doc.status,
        emailSent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST document error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE a lease document
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await prisma.document.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE document error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
