import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    const results: string[] = [];

    // Properties table columns
    const propertyColumns = [
      { name: "bankName", type: "TEXT NOT NULL DEFAULT ''" },
      { name: "bankAccountHolder", type: "TEXT NOT NULL DEFAULT ''" },
      { name: "bankRoutingNumber", type: "TEXT NOT NULL DEFAULT ''" },
      { name: "bankAccountNumber", type: "TEXT NOT NULL DEFAULT ''" },
      { name: "bankAccountType", type: "TEXT NOT NULL DEFAULT 'checking'" },
      { name: "zelleEmail", type: "TEXT NOT NULL DEFAULT ''" },
      { name: "paymentInstructions", type: "TEXT NOT NULL DEFAULT ''" },
    ];

    for (const col of propertyColumns) {
      try {
        await prisma.$executeRawUnsafe(
          `ALTER TABLE "properties" ADD COLUMN "${col.name}" ${col.type}`
        );
        results.push(`properties: Added ${col.name}`);
      } catch {
        results.push(`properties: ${col.name} already exists`);
      }
    }

    // Documents table columns for e-sign
    const documentColumns = [
      { name: "content", type: "TEXT" },
      { name: "signToken", type: "TEXT" },
      { name: "signedAt", type: "TIMESTAMPTZ" },
      { name: "signedName", type: "TEXT" },
      { name: "status", type: "TEXT NOT NULL DEFAULT 'draft'" },
    ];

    for (const col of documentColumns) {
      try {
        await prisma.$executeRawUnsafe(
          `ALTER TABLE "documents" ADD COLUMN "${col.name}" ${col.type}`
        );
        results.push(`documents: Added ${col.name}`);
      } catch {
        results.push(`documents: ${col.name} already exists`);
      }
    }

    // Unique index on signToken
    try {
      await prisma.$executeRawUnsafe(
        `CREATE UNIQUE INDEX IF NOT EXISTS "documents_signToken_key" ON "documents" ("signToken")`
      );
      results.push("documents: signToken unique index ensured");
    } catch {
      results.push("documents: signToken index already exists");
    }

    // Create audit_logs table
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "audit_logs" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
          "action" TEXT NOT NULL,
          "entity" TEXT NOT NULL,
          "entityId" TEXT,
          "userId" TEXT,
          "userName" TEXT,
          "details" TEXT,
          "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
        )
      `);
      results.push("audit_logs: table created or exists");
    } catch {
      results.push("audit_logs: table already exists");
    }

    // Create checklists table
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "checklists" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
          "type" TEXT NOT NULL,
          "unitId" TEXT,
          "tenantId" TEXT,
          "tenantName" TEXT,
          "unitNumber" TEXT,
          "items" TEXT NOT NULL DEFAULT '[]',
          "notes" TEXT,
          "completedAt" TIMESTAMPTZ,
          "completedBy" TEXT,
          "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT "checklists_pkey" PRIMARY KEY ("id")
        )
      `);
      results.push("checklists: table created or exists");
    } catch {
      results.push("checklists: table already exists");
    }

    // Add photos column to maintenance_tickets
    try {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "maintenance_tickets" ADD COLUMN "photos" TEXT`
      );
      results.push("maintenance_tickets: Added photos");
    } catch {
      results.push("maintenance_tickets: photos already exists");
    }

    return NextResponse.json({ message: "Migration complete", results });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: "Migration failed", details: String(error) },
      { status: 500 }
    );
  }
}
