-- Track who changed ticket status and when
ALTER TABLE "maintenance_tickets" ADD COLUMN IF NOT EXISTS "statusChangedById" TEXT;
ALTER TABLE "maintenance_tickets" ADD COLUMN IF NOT EXISTS "statusChangedAt" TIMESTAMP(3);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'maintenance_tickets_statusChangedById_fkey') THEN
    ALTER TABLE "maintenance_tickets"
      ADD CONSTRAINT "maintenance_tickets_statusChangedById_fkey"
      FOREIGN KEY ("statusChangedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
