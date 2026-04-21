import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const results: { step: string; status: string; error?: string }[] = [];

  // First, check what columns exist
  try {
    const cols: { column_name: string }[] = await prisma.$queryRawUnsafe(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'maintenance_tickets' ORDER BY ordinal_position`
    );
    results.push({ step: "existing_columns", status: cols.map(c => c.column_name).join(", ") });
  } catch (e) {
    results.push({ step: "existing_columns", status: "error", error: String(e) });
  }

  const alterStatements = [
    { name: "createdById", sql: `ALTER TABLE "maintenance_tickets" ADD COLUMN IF NOT EXISTS "createdById" TEXT` },
    { name: "photos", sql: `ALTER TABLE "maintenance_tickets" ADD COLUMN IF NOT EXISTS "photos" TEXT` },
    { name: "entryPermission", sql: `ALTER TABLE "maintenance_tickets" ADD COLUMN IF NOT EXISTS "entryPermission" TEXT` },
    { name: "location", sql: `ALTER TABLE "maintenance_tickets" ADD COLUMN IF NOT EXISTS "location" TEXT` },
    { name: "statusChangedById", sql: `ALTER TABLE "maintenance_tickets" ADD COLUMN IF NOT EXISTS "statusChangedById" TEXT` },
    { name: "statusChangedAt", sql: `ALTER TABLE "maintenance_tickets" ADD COLUMN IF NOT EXISTS "statusChangedAt" TIMESTAMP(3)` },
    { name: "tenantId_nullable", sql: `ALTER TABLE "maintenance_tickets" ALTER COLUMN "tenantId" DROP NOT NULL` },
    { name: "stripeCustomerId", sql: `ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT` },
    { name: "stripePaymentIntent", sql: `ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "stripePaymentIntent" TEXT` },
    { name: "incomeVerified", sql: `ALTER TABLE "rental_applications" ADD COLUMN IF NOT EXISTS "incomeVerified" BOOLEAN` },
    { name: "employmentVerified", sql: `ALTER TABLE "rental_applications" ADD COLUMN IF NOT EXISTS "employmentVerified" BOOLEAN` },
    { name: "landlordReference", sql: `ALTER TABLE "rental_applications" ADD COLUMN IF NOT EXISTS "landlordReference" TEXT` },
    { name: "landlordRefVerified", sql: `ALTER TABLE "rental_applications" ADD COLUMN IF NOT EXISTS "landlordRefVerified" BOOLEAN` },
    { name: "screeningScore", sql: `ALTER TABLE "rental_applications" ADD COLUMN IF NOT EXISTS "screeningScore" INTEGER` },
    { name: "screeningNotes", sql: `ALTER TABLE "rental_applications" ADD COLUMN IF NOT EXISTS "screeningNotes" TEXT` },
    { name: "convertedToTenantId", sql: `ALTER TABLE "rental_applications" ADD COLUMN IF NOT EXISTS "convertedToTenantId" TEXT` },
  ];

  for (const stmt of alterStatements) {
    try {
      await prisma.$executeRawUnsafe(stmt.sql);
      results.push({ step: stmt.name, status: "ok" });
    } catch (e) {
      results.push({ step: stmt.name, status: "error", error: String(e) });
    }
  }

  // Check columns after fix
  try {
    const cols: { column_name: string }[] = await prisma.$queryRawUnsafe(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'maintenance_tickets' ORDER BY ordinal_position`
    );
    results.push({ step: "columns_after_fix", status: cols.map(c => c.column_name).join(", ") });
  } catch (e) {
    results.push({ step: "columns_after_fix", status: "error", error: String(e) });
  }

  return NextResponse.json({ results });
}
