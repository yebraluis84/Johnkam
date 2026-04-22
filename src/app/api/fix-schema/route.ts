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
    // rental_applications - all columns
    { name: "ra_currentAddress", sql: `ALTER TABLE "rental_applications" ADD COLUMN IF NOT EXISTS "currentAddress" TEXT` },
    { name: "ra_employer", sql: `ALTER TABLE "rental_applications" ADD COLUMN IF NOT EXISTS "employer" TEXT` },
    { name: "ra_income", sql: `ALTER TABLE "rental_applications" ADD COLUMN IF NOT EXISTS "income" DOUBLE PRECISION` },
    { name: "ra_moveInDate", sql: `ALTER TABLE "rental_applications" ADD COLUMN IF NOT EXISTS "moveInDate" TEXT` },
    { name: "ra_desiredUnit", sql: `ALTER TABLE "rental_applications" ADD COLUMN IF NOT EXISTS "desiredUnit" TEXT` },
    { name: "ra_message", sql: `ALTER TABLE "rental_applications" ADD COLUMN IF NOT EXISTS "message" TEXT` },
    { name: "ra_reviewedBy", sql: `ALTER TABLE "rental_applications" ADD COLUMN IF NOT EXISTS "reviewedBy" TEXT` },
    { name: "ra_reviewNotes", sql: `ALTER TABLE "rental_applications" ADD COLUMN IF NOT EXISTS "reviewNotes" TEXT` },
    { name: "ra_dateOfBirth", sql: `ALTER TABLE "rental_applications" ADD COLUMN IF NOT EXISTS "dateOfBirth" TEXT` },
    { name: "ra_ssnLast4", sql: `ALTER TABLE "rental_applications" ADD COLUMN IF NOT EXISTS "ssnLast4" TEXT` },
    { name: "ra_consentGiven", sql: `ALTER TABLE "rental_applications" ADD COLUMN IF NOT EXISTS "consentGiven" BOOLEAN DEFAULT false` },
    { name: "ra_screeningStatus", sql: `ALTER TABLE "rental_applications" ADD COLUMN IF NOT EXISTS "screeningStatus" TEXT DEFAULT 'not_started'` },
    { name: "ra_screeningResult", sql: `ALTER TABLE "rental_applications" ADD COLUMN IF NOT EXISTS "screeningResult" TEXT` },
    { name: "ra_screeningDate", sql: `ALTER TABLE "rental_applications" ADD COLUMN IF NOT EXISTS "screeningDate" TIMESTAMP(3)` },
    { name: "ra_creditScore", sql: `ALTER TABLE "rental_applications" ADD COLUMN IF NOT EXISTS "creditScore" INTEGER` },
    { name: "ra_criminalClear", sql: `ALTER TABLE "rental_applications" ADD COLUMN IF NOT EXISTS "criminalClear" BOOLEAN` },
    { name: "ra_evictionClear", sql: `ALTER TABLE "rental_applications" ADD COLUMN IF NOT EXISTS "evictionClear" BOOLEAN` },
    { name: "ra_identityVerified", sql: `ALTER TABLE "rental_applications" ADD COLUMN IF NOT EXISTS "identityVerified" BOOLEAN` },
    { name: "ra_incomeVerified", sql: `ALTER TABLE "rental_applications" ADD COLUMN IF NOT EXISTS "incomeVerified" BOOLEAN` },
    { name: "ra_employmentVerified", sql: `ALTER TABLE "rental_applications" ADD COLUMN IF NOT EXISTS "employmentVerified" BOOLEAN` },
    { name: "ra_landlordReference", sql: `ALTER TABLE "rental_applications" ADD COLUMN IF NOT EXISTS "landlordReference" TEXT` },
    { name: "ra_landlordRefVerified", sql: `ALTER TABLE "rental_applications" ADD COLUMN IF NOT EXISTS "landlordRefVerified" BOOLEAN` },
    { name: "ra_screeningScore", sql: `ALTER TABLE "rental_applications" ADD COLUMN IF NOT EXISTS "screeningScore" INTEGER` },
    { name: "ra_screeningNotes", sql: `ALTER TABLE "rental_applications" ADD COLUMN IF NOT EXISTS "screeningNotes" TEXT` },
    { name: "ra_convertedToTenantId", sql: `ALTER TABLE "rental_applications" ADD COLUMN IF NOT EXISTS "convertedToTenantId" TEXT` },
    // Stripe Connect on properties
    { name: "prop_stripeAccountId", sql: `ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "stripeAccountId" TEXT` },
    { name: "prop_stripeOnboarded", sql: `ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "stripeOnboarded" BOOLEAN DEFAULT false` },
    { name: "prop_platformFeePercent", sql: `ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "platformFeePercent" DOUBLE PRECISION DEFAULT 2.5` },
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
