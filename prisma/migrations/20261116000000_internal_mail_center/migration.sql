CREATE TABLE "MailMessage" (
  "id" TEXT NOT NULL,
  "senderName" TEXT NOT NULL,
  "senderEmail" TEXT,
  "department" TEXT NOT NULL DEFAULT 'support',
  "subject" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'NEW',
  "direction" TEXT NOT NULL DEFAULT 'INBOUND',
  "senderUserId" TEXT,
  "parentId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MailMessage_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "MailMessage_department_status_createdAt_idx" ON "MailMessage"("department", "status", "createdAt");
CREATE INDEX "MailMessage_parentId_createdAt_idx" ON "MailMessage"("parentId", "createdAt");
CREATE INDEX "MailMessage_senderUserId_createdAt_idx" ON "MailMessage"("senderUserId", "createdAt");
ALTER TABLE "MailMessage" ADD CONSTRAINT "MailMessage_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MailMessage" ADD CONSTRAINT "MailMessage_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "MailMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
