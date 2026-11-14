CREATE TABLE "BeneficiaryNotification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "requestId" TEXT,
  "type" TEXT NOT NULL DEFAULT 'REQUEST_UPDATE',
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BeneficiaryNotification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "BeneficiaryNotification_userId_readAt_createdAt_idx"
  ON "BeneficiaryNotification"("userId", "readAt", "createdAt");
CREATE INDEX "BeneficiaryNotification_requestId_createdAt_idx"
  ON "BeneficiaryNotification"("requestId", "createdAt");
ALTER TABLE "BeneficiaryNotification" ADD CONSTRAINT "BeneficiaryNotification_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BeneficiaryNotification" ADD CONSTRAINT "BeneficiaryNotification_requestId_fkey"
  FOREIGN KEY ("requestId") REFERENCES "AssistanceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
