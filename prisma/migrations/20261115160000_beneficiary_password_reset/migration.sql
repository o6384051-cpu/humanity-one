ALTER TABLE "User"
ADD COLUMN "passwordResetTokenHash" TEXT,
ADD COLUMN "passwordResetExpiresAt" TIMESTAMP(3);

CREATE INDEX "User_passwordResetExpiresAt_idx"
ON "User"("passwordResetExpiresAt");
