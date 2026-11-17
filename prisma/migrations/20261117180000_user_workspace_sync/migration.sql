CREATE TABLE "UserWorkspace" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "data" JSONB NOT NULL DEFAULT '{}',
  "language" TEXT NOT NULL DEFAULT 'ar',
  "theme" TEXT NOT NULL DEFAULT 'dark',
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserWorkspace_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "UserWorkspace_userId_key" ON "UserWorkspace"("userId");
ALTER TABLE "UserWorkspace" ADD CONSTRAINT "UserWorkspace_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
