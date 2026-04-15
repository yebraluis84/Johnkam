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

    // Add insurance & autopay columns to tenants
    const tenantCols = [
      { name: "insuranceProvider", type: "TEXT" },
      { name: "insurancePolicyNo", type: "TEXT" },
      { name: "insuranceExpiry", type: "TIMESTAMPTZ" },
      { name: "autopayEnabled", type: "BOOLEAN NOT NULL DEFAULT false" },
    ];
    for (const col of tenantCols) {
      try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "tenants" ADD COLUMN "${col.name}" ${col.type}`);
        results.push(`tenants: Added ${col.name}`);
      } catch { results.push(`tenants: ${col.name} already exists`); }
    }

    // Create rental_applications table
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "rental_applications" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
          "firstName" TEXT NOT NULL, "lastName" TEXT NOT NULL,
          "email" TEXT NOT NULL, "phone" TEXT NOT NULL,
          "currentAddress" TEXT, "employer" TEXT, "income" DOUBLE PRECISION,
          "moveInDate" TEXT, "desiredUnit" TEXT, "message" TEXT,
          "status" TEXT NOT NULL DEFAULT 'pending',
          "reviewedBy" TEXT, "reviewNotes" TEXT,
          "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT "rental_applications_pkey" PRIMARY KEY ("id")
        )
      `);
      results.push("rental_applications: table created or exists");
    } catch { results.push("rental_applications: already exists"); }

    // Add background check columns to rental_applications
    const screeningColumns = [
      { name: "dateOfBirth", type: "TEXT" },
      { name: "ssnLast4", type: "TEXT" },
      { name: "consentGiven", type: "BOOLEAN NOT NULL DEFAULT false" },
      { name: "screeningStatus", type: "TEXT DEFAULT 'not_started'" },
      { name: "screeningResult", type: "TEXT" },
      { name: "screeningDate", type: "TIMESTAMPTZ" },
      { name: "creditScore", type: "INT" },
      { name: "criminalClear", type: "BOOLEAN" },
      { name: "evictionClear", type: "BOOLEAN" },
      { name: "identityVerified", type: "BOOLEAN" },
    ];
    for (const col of screeningColumns) {
      try {
        await prisma.$executeRawUnsafe(
          `ALTER TABLE "rental_applications" ADD COLUMN "${col.name}" ${col.type}`
        );
        results.push(`rental_applications: Added ${col.name}`);
      } catch { results.push(`rental_applications: ${col.name} already exists`); }
    }

    // Create amenities table
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "amenities" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
          "name" TEXT NOT NULL, "description" TEXT, "location" TEXT,
          "capacity" INT NOT NULL DEFAULT 0,
          "requiresBooking" BOOLEAN NOT NULL DEFAULT true,
          "availableFrom" TEXT NOT NULL DEFAULT '08:00',
          "availableTo" TEXT NOT NULL DEFAULT '22:00',
          "rules" TEXT, "status" TEXT NOT NULL DEFAULT 'active',
          "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT "amenities_pkey" PRIMARY KEY ("id")
        )
      `);
      results.push("amenities: table created or exists");
    } catch { results.push("amenities: already exists"); }

    // Create amenity_bookings table
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "amenity_bookings" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
          "amenityId" TEXT NOT NULL, "tenantId" TEXT, "tenantName" TEXT NOT NULL,
          "unit" TEXT, "date" TEXT NOT NULL, "startTime" TEXT NOT NULL,
          "endTime" TEXT NOT NULL, "notes" TEXT,
          "status" TEXT NOT NULL DEFAULT 'confirmed',
          "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT "amenity_bookings_pkey" PRIMARY KEY ("id")
        )
      `);
      results.push("amenity_bookings: table created or exists");
    } catch { results.push("amenity_bookings: already exists"); }

    // Create packages table
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "packages" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
          "carrier" TEXT NOT NULL, "trackingNo" TEXT,
          "tenantId" TEXT, "tenantName" TEXT NOT NULL, "unit" TEXT NOT NULL,
          "description" TEXT, "status" TEXT NOT NULL DEFAULT 'received',
          "receivedBy" TEXT, "pickedUpAt" TIMESTAMPTZ, "notifiedAt" TIMESTAMPTZ,
          "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
        )
      `);
      results.push("packages: table created or exists");
    } catch { results.push("packages: already exists"); }

    // Create vendors table
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "vendors" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
          "name" TEXT NOT NULL, "company" TEXT, "email" TEXT, "phone" TEXT,
          "specialty" TEXT NOT NULL, "rating" INT NOT NULL DEFAULT 0,
          "notes" TEXT, "status" TEXT NOT NULL DEFAULT 'active',
          "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
        )
      `);
      results.push("vendors: table created or exists");
    } catch { results.push("vendors: already exists"); }

    // Create parking_spots table
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "parking_spots" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
          "spotNumber" TEXT NOT NULL UNIQUE,
          "type" TEXT NOT NULL DEFAULT 'standard', "level" TEXT,
          "tenantId" TEXT, "tenantName" TEXT, "unit" TEXT,
          "monthlyFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "status" TEXT NOT NULL DEFAULT 'available',
          "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT "parking_spots_pkey" PRIMARY KEY ("id")
        )
      `);
      results.push("parking_spots: table created or exists");
    } catch { results.push("parking_spots: already exists"); }

    // Create surveys table
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "surveys" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
          "title" TEXT NOT NULL, "description" TEXT,
          "questions" TEXT NOT NULL DEFAULT '[]',
          "status" TEXT NOT NULL DEFAULT 'active',
          "createdBy" TEXT, "expiresAt" TIMESTAMPTZ,
          "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT "surveys_pkey" PRIMARY KEY ("id")
        )
      `);
      results.push("surveys: table created or exists");
    } catch { results.push("surveys: already exists"); }

    // Create survey_responses table
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "survey_responses" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
          "surveyId" TEXT NOT NULL, "tenantId" TEXT,
          "tenantName" TEXT, "unit" TEXT,
          "answers" TEXT NOT NULL DEFAULT '[]',
          "rating" INT, "comment" TEXT,
          "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT "survey_responses_pkey" PRIMARY KEY ("id")
        )
      `);
      results.push("survey_responses: table created or exists");
    } catch { results.push("survey_responses: already exists"); }

    // Create expenses table
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "expenses" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
          "category" TEXT NOT NULL,
          "description" TEXT NOT NULL,
          "amount" DOUBLE PRECISION NOT NULL,
          "vendor" TEXT,
          "date" TIMESTAMPTZ NOT NULL,
          "recurring" BOOLEAN NOT NULL DEFAULT false,
          "notes" TEXT,
          "createdBy" TEXT,
          "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
        )
      `);
      results.push("expenses: table created or exists");
    } catch { results.push("expenses: already exists"); }

    // Create community_posts table
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "community_posts" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
          "title" TEXT NOT NULL,
          "content" TEXT NOT NULL,
          "category" TEXT NOT NULL DEFAULT 'general',
          "authorId" TEXT,
          "authorName" TEXT NOT NULL,
          "unit" TEXT,
          "pinned" BOOLEAN NOT NULL DEFAULT false,
          "likes" INT NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT "community_posts_pkey" PRIMARY KEY ("id")
        )
      `);
      results.push("community_posts: table created or exists");
    } catch { results.push("community_posts: already exists"); }

    // Create document_templates table
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "document_templates" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
          "name" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "content" TEXT NOT NULL,
          "variables" TEXT NOT NULL DEFAULT '[]',
          "createdBy" TEXT,
          "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT "document_templates_pkey" PRIMARY KEY ("id")
        )
      `);
      results.push("document_templates: table created or exists");
    } catch { results.push("document_templates: already exists"); }

    return NextResponse.json({ message: "Migration complete", results });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: "Migration failed", details: String(error) },
      { status: 500 }
    );
  }
}
