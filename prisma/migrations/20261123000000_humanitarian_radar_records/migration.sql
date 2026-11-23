CREATE TABLE "HumanitarianRecord" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "city" TEXT,
  "area" TEXT,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "locationPrecision" TEXT NOT NULL DEFAULT 'APPROXIMATE',
  "sourceName" TEXT NOT NULL,
  "sourceUrl" TEXT,
  "sourceReference" TEXT,
  "observedAt" TIMESTAMP(3) NOT NULL,
  "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "verifiedAt" TIMESTAMP(3),
  "verifiedByUserId" TEXT,
  "verificationNote" TEXT,
  "sharingMode" TEXT NOT NULL DEFAULT 'PRIVATE',
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HumanitarianRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RadarRecordShare" (
  "id" TEXT NOT NULL,
  "recordId" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "permission" TEXT NOT NULL DEFAULT 'VIEW',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdByOrganizationId" TEXT NOT NULL,
  CONSTRAINT "RadarRecordShare_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RadarAuditEvent" (
  "id" TEXT NOT NULL,
  "recordId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "actorUserId" TEXT,
  "actorOrganizationId" TEXT,
  "details" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RadarAuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "HumanitarianRecord_organizationId_createdAt_idx" ON "HumanitarianRecord"("organizationId", "createdAt");
CREATE INDEX "HumanitarianRecord_verificationStatus_observedAt_idx" ON "HumanitarianRecord"("verificationStatus", "observedAt");
CREATE INDEX "HumanitarianRecord_sharingMode_verificationStatus_country_idx" ON "HumanitarianRecord"("sharingMode", "verificationStatus", "country");
CREATE INDEX "HumanitarianRecord_type_status_idx" ON "HumanitarianRecord"("type", "status");
CREATE UNIQUE INDEX "RadarRecordShare_recordId_organizationId_key" ON "RadarRecordShare"("recordId", "organizationId");
CREATE INDEX "RadarRecordShare_organizationId_createdAt_idx" ON "RadarRecordShare"("organizationId", "createdAt");
CREATE INDEX "RadarAuditEvent_recordId_createdAt_idx" ON "RadarAuditEvent"("recordId", "createdAt");
CREATE INDEX "RadarAuditEvent_actorUserId_createdAt_idx" ON "RadarAuditEvent"("actorUserId", "createdAt");
CREATE INDEX "RadarAuditEvent_actorOrganizationId_createdAt_idx" ON "RadarAuditEvent"("actorOrganizationId", "createdAt");

ALTER TABLE "HumanitarianRecord" ADD CONSTRAINT "HumanitarianRecord_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "HumanitarianRecord" ADD CONSTRAINT "HumanitarianRecord_verifiedByUserId_fkey" FOREIGN KEY ("verifiedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RadarRecordShare" ADD CONSTRAINT "RadarRecordShare_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "HumanitarianRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RadarRecordShare" ADD CONSTRAINT "RadarRecordShare_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RadarAuditEvent" ADD CONSTRAINT "RadarAuditEvent_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "HumanitarianRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RadarAuditEvent" ADD CONSTRAINT "RadarAuditEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RadarAuditEvent" ADD CONSTRAINT "RadarAuditEvent_actorOrganizationId_fkey" FOREIGN KEY ("actorOrganizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
