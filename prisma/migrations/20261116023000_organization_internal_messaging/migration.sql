CREATE TABLE "Organization" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "country" TEXT NOT NULL DEFAULT 'غير محدد',
  "city" TEXT,
  "focusArea" TEXT,
  "website" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "passwordHash" TEXT,
  "activationTokenHash" TEXT,
  "activationExpiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "OrganizationConversation" (
  "id" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "organizationAId" TEXT NOT NULL,
  "organizationBId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OrganizationConversation_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "OrganizationMessage" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "senderOrganizationId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "readAt" TIMESTAMP(3),
  CONSTRAINT "OrganizationMessage_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Organization_applicationId_key" ON "Organization"("applicationId");
CREATE UNIQUE INDEX "Organization_email_key" ON "Organization"("email");
CREATE UNIQUE INDEX "Organization_activationTokenHash_key" ON "Organization"("activationTokenHash");
CREATE INDEX "Organization_status_name_idx" ON "Organization"("status", "name");
CREATE INDEX "OrganizationConversation_organizationAId_updatedAt_idx" ON "OrganizationConversation"("organizationAId", "updatedAt");
CREATE INDEX "OrganizationConversation_organizationBId_updatedAt_idx" ON "OrganizationConversation"("organizationBId", "updatedAt");
CREATE INDEX "OrganizationMessage_conversationId_createdAt_idx" ON "OrganizationMessage"("conversationId", "createdAt");
CREATE INDEX "OrganizationMessage_senderOrganizationId_createdAt_idx" ON "OrganizationMessage"("senderOrganizationId", "createdAt");
ALTER TABLE "OrganizationConversation" ADD CONSTRAINT "OrganizationConversation_organizationAId_fkey" FOREIGN KEY ("organizationAId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationConversation" ADD CONSTRAINT "OrganizationConversation_organizationBId_fkey" FOREIGN KEY ("organizationBId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationMessage" ADD CONSTRAINT "OrganizationMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "OrganizationConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationMessage" ADD CONSTRAINT "OrganizationMessage_senderOrganizationId_fkey" FOREIGN KEY ("senderOrganizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;