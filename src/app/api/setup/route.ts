import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    // Create all tables using raw SQL
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "email" TEXT NOT NULL,
        "password_hash" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "phone" TEXT,
        "role" TEXT NOT NULL DEFAULT 'TENANT',
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "properties" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "name" TEXT NOT NULL,
        "address" TEXT NOT NULL DEFAULT '',
        "city" TEXT NOT NULL DEFAULT '',
        "total_units" INTEGER NOT NULL DEFAULT 0,
        "payment_due_day" INTEGER NOT NULL DEFAULT 1,
        "late_fee_grace_days" INTEGER NOT NULL DEFAULT 5,
        "late_fee_amount" DOUBLE PRECISION NOT NULL DEFAULT 50,
        "accept_credit_card" BOOLEAN NOT NULL DEFAULT true,
        "accept_ach" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "units" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "number" TEXT NOT NULL,
        "floor" INTEGER NOT NULL DEFAULT 1,
        "bedrooms" INTEGER NOT NULL DEFAULT 1,
        "bathrooms" INTEGER NOT NULL DEFAULT 1,
        "sqft" INTEGER NOT NULL DEFAULT 0,
        "rent" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
        "available_date" TIMESTAMP(3),
        "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
        "property_id" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "units_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "units_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "units_number_key" ON "units"("number");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "tenants" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "user_id" TEXT NOT NULL,
        "unit_id" TEXT,
        "lease_start" TIMESTAMP(3),
        "lease_end" TIMESTAMP(3),
        "rent_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "move_in_date" TIMESTAMP(3),
        "move_out_date" TIMESTAMP(3),
        "invite_code" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "tenants_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "tenants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "tenants_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "tenants_user_id_key" ON "tenants"("user_id");
      CREATE UNIQUE INDEX IF NOT EXISTS "tenants_invite_code_key" ON "tenants"("invite_code");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "maintenance_tickets" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "ticket_number" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL DEFAULT '',
        "category" TEXT NOT NULL DEFAULT 'General',
        "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
        "status" TEXT NOT NULL DEFAULT 'OPEN',
        "location" TEXT,
        "scheduled_date" TIMESTAMP(3),
        "entry_permission" TEXT,
        "tenant_id" TEXT NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "maintenance_tickets_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "maintenance_tickets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "maintenance_tickets_ticket_number_key" ON "maintenance_tickets"("ticket_number");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ticket_comments" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "message" TEXT NOT NULL,
        "ticket_id" TEXT NOT NULL,
        "author_id" TEXT NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ticket_comments_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "ticket_comments_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "maintenance_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "ticket_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "payments" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "amount" DOUBLE PRECISION NOT NULL,
        "description" TEXT NOT NULL DEFAULT 'Rent Payment',
        "method" TEXT NOT NULL DEFAULT 'CREDIT_CARD',
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "confirmation_number" TEXT,
        "tenant_id" TEXT NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "payments_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "payments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "lease_renewals" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "tenant_id" TEXT NOT NULL,
        "current_end" TIMESTAMP(3) NOT NULL,
        "proposed_end" TIMESTAMP(3) NOT NULL,
        "new_rent" DOUBLE PRECISION,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "responded_at" TIMESTAMP(3),
        CONSTRAINT "lease_renewals_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "lease_renewals_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "announcements" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "priority" TEXT NOT NULL DEFAULT 'normal',
        "author" TEXT NOT NULL DEFAULT 'Property Management',
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "conversations" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "subject" TEXT NOT NULL DEFAULT '',
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "messages" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "content" TEXT NOT NULL,
        "sender_id" TEXT NOT NULL,
        "conversation_id" TEXT NOT NULL,
        "read" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "messages_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "documents" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "name" TEXT NOT NULL,
        "type" TEXT NOT NULL DEFAULT 'other',
        "url" TEXT NOT NULL DEFAULT '',
        "size" TEXT,
        "tenant_id" TEXT,
        "uploaded_by" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "documents_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "documents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "notification_logs" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "template_name" TEXT NOT NULL DEFAULT '',
        "recipient" TEXT NOT NULL DEFAULT '',
        "email" TEXT NOT NULL DEFAULT '',
        "subject" TEXT NOT NULL DEFAULT '',
        "status" TEXT NOT NULL DEFAULT 'pending',
        "channel" TEXT NOT NULL DEFAULT 'email',
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "_ConversationParticipants" (
        "A" TEXT NOT NULL,
        "B" TEXT NOT NULL,
        CONSTRAINT "_ConversationParticipants_AB_unique" UNIQUE ("A", "B"),
        CONSTRAINT "_ConversationParticipants_A_fkey" FOREIGN KEY ("A") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "_ConversationParticipants_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "_ConversationParticipants_B_index" ON "_ConversationParticipants"("B");
    `);

    return NextResponse.json({ message: "All tables created successfully!" });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Setup failed", details: String(error) },
      { status: 500 }
    );
  }
}
