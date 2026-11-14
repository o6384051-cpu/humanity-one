CREATE TABLE "AssistanceReviewEvent" (
  "id" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "adminUserId" TEXT,
  "fromStatus" TEXT,
  "toStatus" TEXT NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AssistanceReviewEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AssistanceReviewEvent_requestId_createdAt_idx"
  ON "AssistanceReviewEvent"("requestId", "createdAt");
CREATE INDEX "AssistanceReviewEvent_adminUserId_createdAt_idx"
  ON "AssistanceReviewEvent"("adminUserId", "createdAt");
ALTER TABLE "AssistanceReviewEvent" ADD CONSTRAINT "AssistanceReviewEvent_requestId_fkey"
  FOREIGN KEY ("requestId") REFERENCES "AssistanceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssistanceReviewEvent" ADD CONSTRAINT "AssistanceReviewEvent_adminUserId_fkey"
  FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
