CREATE TABLE "BeneficiaryFile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "originalName" TEXT NOT NULL,
  "objectKey" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BeneficiaryFile_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "BeneficiaryFile_objectKey_key" ON "BeneficiaryFile"("objectKey");
CREATE INDEX "BeneficiaryFile_userId_requestId_createdAt_idx" ON "BeneficiaryFile"("userId", "requestId", "createdAt");
ALTER TABLE "BeneficiaryFile" ADD CONSTRAINT "BeneficiaryFile_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BeneficiaryFile" ADD CONSTRAINT "BeneficiaryFile_requestId_fkey"
  FOREIGN KEY ("requestId") REFERENCES "AssistanceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
