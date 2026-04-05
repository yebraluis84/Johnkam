import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    // Drop all existing tables and types
    const dropStatements = [
      'DROP TABLE IF EXISTS "_ConversationParticipants" CASCADE',
      'DROP TABLE IF EXISTS "notification_logs" CASCADE',
      'DROP TABLE IF EXISTS "documents" CASCADE',
      'DROP TABLE IF EXISTS "messages" CASCADE',
      'DROP TABLE IF EXISTS "conversations" CASCADE',
      'DROP TABLE IF EXISTS "announcements" CASCADE',
      'DROP TABLE IF EXISTS "lease_renewals" CASCADE',
      'DROP TABLE IF EXISTS "payments" CASCADE',
      'DROP TABLE IF EXISTS "ticket_comments" CASCADE',
      'DROP TABLE IF EXISTS "maintenance_tickets" CASCADE',
      'DROP TABLE IF EXISTS "tenants" CASCADE',
      'DROP TABLE IF EXISTS "units" CASCADE',
      'DROP TABLE IF EXISTS "properties" CASCADE',
      'DROP TABLE IF EXISTS "users" CASCADE',
    ];

    for (const sql of dropStatements) {
      await prisma.$executeRawUnsafe(sql);
    }

    // Create enums
    const enumStatements = [
      'DROP TYPE IF EXISTS "UserRole" CASCADE',
      'DROP TYPE IF EXISTS "TenantStatus" CASCADE',
      'DROP TYPE IF EXISTS "TicketPriority" CASCADE',
      'DROP TYPE IF EXISTS "TicketStatus" CASCADE',
      'DROP TYPE IF EXISTS "PaymentMethod" CASCADE',
      'DROP TYPE IF EXISTS "PaymentStatus" CASCADE',
      'DROP TYPE IF EXISTS "UnitStatus" CASCADE',
      "CREATE TYPE \"UserRole\" AS ENUM ('ADMIN', 'TENANT', 'MAINTENANCE')",
      "CREATE TYPE \"TenantStatus\" AS ENUM ('ACTIVE', 'PENDING', 'INACTIVE', 'DELINQUENT')",
      "CREATE TYPE \"TicketPriority\" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT')",
      "CREATE TYPE \"TicketStatus\" AS ENUM ('OPEN', 'IN_PROGRESS', 'SCHEDULED', 'COMPLETED', 'CLOSED')",
      "CREATE TYPE \"PaymentMethod\" AS ENUM ('CREDIT_CARD', 'ACH', 'CHECK')",
      "CREATE TYPE \"PaymentStatus\" AS ENUM ('COMPLETED', 'PENDING', 'FAILED')",
      "CREATE TYPE \"UnitStatus\" AS ENUM ('AVAILABLE', 'RESERVED', 'MAINTENANCE', 'OCCUPIED')",
    ];

    for (const sql of enumStatements) {
      await prisma.$executeRawUnsafe(sql);
    }

    // Create tables with exact column names Prisma expects (camelCase)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "users" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "email" TEXT NOT NULL,
        "passwordHash" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "phone" TEXT,
        "role" "UserRole" NOT NULL DEFAULT 'TENANT',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      );
      CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE "properties" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "name" TEXT NOT NULL,
        "address" TEXT NOT NULL DEFAULT '',
        "city" TEXT NOT NULL DEFAULT '',
        "totalUnits" INTEGER NOT NULL DEFAULT 0,
        "paymentDueDay" INTEGER NOT NULL DEFAULT 1,
        "lateFeeGraceDays" INTEGER NOT NULL DEFAULT 5,
        "lateFeeAmount" DOUBLE PRECISION NOT NULL DEFAULT 50,
        "acceptCreditCard" BOOLEAN NOT NULL DEFAULT true,
        "acceptACH" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE "units" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "number" TEXT NOT NULL,
        "floor" INTEGER NOT NULL DEFAULT 1,
        "bedrooms" INTEGER NOT NULL DEFAULT 1,
        "bathrooms" INTEGER NOT NULL DEFAULT 1,
        "sqft" INTEGER NOT NULL DEFAULT 0,
        "rent" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "status" "UnitStatus" NOT NULL DEFAULT 'AVAILABLE',
        "availableDate" TIMESTAMP(3),
        "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
        "propertyId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "units_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "units_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
      CREATE UNIQUE INDEX "units_number_key" ON "units"("number");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE "tenants" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL,
        "unitId" TEXT,
        "leaseStart" TIMESTAMP(3),
        "leaseEnd" TIMESTAMP(3),
        "rentAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "status" "TenantStatus" NOT NULL DEFAULT 'PENDING',
        "moveInDate" TIMESTAMP(3),
        "moveOutDate" TIMESTAMP(3),
        "inviteCode" TEXT,
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "tenants_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "tenants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "tenants_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
      CREATE UNIQUE INDEX "tenants_userId_key" ON "tenants"("userId");
      CREATE UNIQUE INDEX IF NOT EXISTS "tenants_inviteCode_key" ON "tenants"("inviteCode");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE "maintenance_tickets" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "ticketNumber" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL DEFAULT '',
        "category" TEXT NOT NULL DEFAULT 'General',
        "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
        "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
        "location" TEXT,
        "scheduledDate" TIMESTAMP(3),
        "tenantId" TEXT NOT NULL,
        "entryPermission" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "maintenance_tickets_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "maintenance_tickets_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
      CREATE UNIQUE INDEX "maintenance_tickets_ticketNumber_key" ON "maintenance_tickets"("ticketNumber");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE "ticket_comments" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "message" TEXT NOT NULL,
        "authorId" TEXT NOT NULL,
        "ticketId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ticket_comments_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "ticket_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "ticket_comments_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "maintenance_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE "payments" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "amount" DOUBLE PRECISION NOT NULL,
        "description" TEXT NOT NULL DEFAULT 'Rent Payment',
        "method" "PaymentMethod" NOT NULL DEFAULT 'CREDIT_CARD',
        "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
        "confirmationNumber" TEXT,
        "tenantId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "payments_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "payments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE "lease_renewals" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "tenantId" TEXT NOT NULL,
        "currentLeaseEnd" TIMESTAMP(3) NOT NULL,
        "newLeaseStart" TIMESTAMP(3) NOT NULL,
        "newLeaseEnd" TIMESTAMP(3) NOT NULL,
        "currentRent" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "proposedRent" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "offeredDate" TIMESTAMP(3),
        "respondedDate" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "lease_renewals_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "lease_renewals_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE "announcements" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "priority" TEXT NOT NULL DEFAULT 'normal',
        "author" TEXT NOT NULL DEFAULT 'Property Management',
        "propertyId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "announcements_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "announcements_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE "conversations" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "subject" TEXT NOT NULL DEFAULT '',
        "participants" TEXT[] DEFAULT ARRAY[]::TEXT[],
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE "messages" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "conversationId" TEXT NOT NULL,
        "senderId" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "read" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "messages_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE "documents" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "name" TEXT NOT NULL,
        "type" TEXT NOT NULL DEFAULT 'other',
        "fileUrl" TEXT,
        "size" TEXT,
        "tenantId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE "notification_logs" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "templateName" TEXT NOT NULL DEFAULT '',
        "recipient" TEXT NOT NULL DEFAULT '',
        "email" TEXT NOT NULL DEFAULT '',
        "subject" TEXT NOT NULL DEFAULT '',
        "status" TEXT NOT NULL DEFAULT 'pending',
        "channel" TEXT NOT NULL DEFAULT 'email',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
      );
    `);

    return NextResponse.json({ message: "All tables created successfully! Now run /api/seed to load demo data." });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Setup failed", details: String(error) },
      { status: 500 }
    );
  }
}
