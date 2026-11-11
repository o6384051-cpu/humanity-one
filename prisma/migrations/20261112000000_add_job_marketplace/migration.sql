CREATE TABLE "JobListing" (
  "id" TEXT NOT NULL,
  "employerName" TEXT NOT NULL,
  "businessType" TEXT NOT NULL,
  "businessName" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "area" TEXT,
  "contactPhone" TEXT NOT NULL,
  "contactEmail" TEXT,
  "jobTitle" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "skills" TEXT,
  "experienceLevel" TEXT NOT NULL DEFAULT 'لا يشترط خبرة',
  "educationRequirement" TEXT NOT NULL DEFAULT 'لا يشترط مؤهل',
  "salaryMin" INTEGER,
  "salaryMax" INTEGER,
  "salaryPeriod" TEXT NOT NULL DEFAULT 'شهري',
  "employmentType" TEXT NOT NULL DEFAULT 'دوام كامل',
  "shift" TEXT,
  "openings" INTEGER NOT NULL DEFAULT 1,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3),
  CONSTRAINT "JobListing_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "JobApplication" (
  "id" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "applicantName" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "experience" TEXT,
  "message" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "JobListing_status_createdAt_idx" ON "JobListing"("status", "createdAt");
CREATE INDEX "JobListing_city_businessType_idx" ON "JobListing"("city", "businessType");
CREATE INDEX "JobApplication_jobId_createdAt_idx" ON "JobApplication"("jobId", "createdAt");
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
