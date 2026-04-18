-- Make tenantId nullable so admin/management can create tickets without a tenant
ALTER TABLE "maintenance_tickets" ALTER COLUMN "tenantId" DROP NOT NULL;
