-- Add createdById column to maintenance_tickets
ALTER TABLE "maintenance_tickets" ADD COLUMN IF NOT EXISTS "createdById" TEXT;
ALTER TABLE "maintenance_tickets" ADD COLUMN IF NOT EXISTS "photos" TEXT;

-- Add foreign key constraint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'maintenance_tickets_createdById_fkey') THEN
    ALTER TABLE "maintenance_tickets"
      ADD CONSTRAINT "maintenance_tickets_createdById_fkey"
      FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
