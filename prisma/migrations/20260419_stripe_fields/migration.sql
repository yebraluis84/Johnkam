-- Add Stripe fields
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT;
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "stripePaymentIntent" TEXT;

-- Add unique constraint on stripeCustomerId
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tenants_stripeCustomerId_key') THEN
    ALTER TABLE "tenants" ADD CONSTRAINT "tenants_stripeCustomerId_key" UNIQUE ("stripeCustomerId");
  END IF;
END $$;
