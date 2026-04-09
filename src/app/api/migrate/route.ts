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

    // Add unique index on signToken if not exists
    try {
      await prisma.$executeRawUnsafe(
        `CREATE UNIQUE INDEX IF NOT EXISTS "documents_signToken_key" ON "documents" ("signToken")`
      );
      results.push("documents: signToken unique index ensured");
    } catch {
      results.push("documents: signToken index already exists");
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
