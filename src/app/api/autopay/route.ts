import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";

// GET: Get autopay status for a tenant
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId");
    if (!tenantId) {
      return NextResponse.json({ error: "tenantId required" }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { autopayEnabled: true, rentAmount: true },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    return NextResponse.json({
      autopayEnabled: tenant.autopayEnabled,
      rentAmount: tenant.rentAmount,
    });
  } catch (error) {
    console.error("GET autopay error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT: Toggle autopay for a tenant
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, enabled } = body;

    if (!tenantId || typeof enabled !== "boolean") {
      return NextResponse.json({ error: "tenantId and enabled required" }, { status: 400 });
    }

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { autopayEnabled: enabled },
      include: { user: true },
    });

    logAudit({
      action: enabled ? "autopay_enabled" : "autopay_disabled",
      entity: "tenant",
      entityId: tenantId,
      userName: tenant.user.name,
      details: `Autopay ${enabled ? "enabled" : "disabled"} for ${tenant.user.name}`,
    });

    return NextResponse.json({
      success: true,
      autopayEnabled: tenant.autopayEnabled,
    });
  } catch (error) {
    console.error("PUT autopay error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
