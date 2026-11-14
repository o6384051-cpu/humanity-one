import { S3Client } from "@aws-sdk/client-s3";

const required = ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_ENDPOINT_URL_S3", "AWS_REGION", "BENEFICIARY_FILES_BUCKET"] as const;

export function beneficiaryBucket() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) throw new Error("Beneficiary file storage is not configured");
  return process.env.BENEFICIARY_FILES_BUCKET!;
}

export function beneficiaryS3() {
  return new S3Client({
    region: process.env.AWS_REGION!,
    endpoint: process.env.AWS_ENDPOINT_URL_S3!,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}
