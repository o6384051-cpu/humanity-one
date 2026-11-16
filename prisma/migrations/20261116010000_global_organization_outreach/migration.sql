CREATE TABLE "OrganizationLead" (
  "id" TEXT NOT NULL,
  "organizationName" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "city" TEXT,
  "focusArea" TEXT NOT NULL,
  "website" TEXT,
  "contactName" TEXT,
  "contactEmail" TEXT,
  "sourceUrl" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DISCOVERED',
  "notes" TEXT,
  "lastContactAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OrganizationLead_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "OrganizationLead_status_country_createdAt_idx" ON "OrganizationLead"("status", "country", "createdAt");
CREATE INDEX "OrganizationLead_organizationName_idx" ON "OrganizationLead"("organizationName");
