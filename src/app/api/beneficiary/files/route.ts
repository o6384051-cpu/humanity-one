import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";
import { getBeneficiarySession } from "@/lib/beneficiary-auth";
import { beneficiaryBucket, beneficiaryS3 } from "@/lib/beneficiary-file-storage";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_BYTES = 4 * 1024 * 1024;

function detectMime(bytes: Buffer): string | null {
  if (bytes.subarray(0, 5).toString("ascii") === "%PDF-") return "application/pdf";
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "image/png";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  return null;
}

export async function POST(req: NextRequest) {
  const user = await getBeneficiarySession();
  if (!user) return NextResponse.json({ error: "سجّل الدخول أولًا." }, { status: 401 });

  const limit = await rateLimit(req, "beneficiary-file:" + user.id, 12, 86400000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

  let objectKey: string | null = null;
  try {
    const form = await req.formData();
    const file = form.get("file");
    const requestId = String(form.get("requestId") || "");
    if (!(file instanceof File)) return NextResponse.json({ error: "اختر ملفًا صالحًا." }, { status: 400 });
    if (!requestId || file.size < 1 || file.size > MAX_BYTES) {
      return NextResponse.json({ error: "الحد الأقصى للملف 4 ميجابايت." }, { status: 400 });
    }

    const request = await prisma.assistanceRequest.findFirst({
      where: { id: requestId, userId: user.id },
      select: { id: true },
    });
    if (!request) return NextResponse.json({ error: "طلب المساعدة غير موجود ضمن حسابك." }, { status: 404 });

    const bytes = Buffer.from(await file.arrayBuffer());
    const mimeType = detectMime(bytes);
    if (!mimeType) return NextResponse.json({ error: "الأنواع المسموحة: PDF أو PNG أو JPG فقط." }, { status: 415 });

    const safeName = file.name.replaceAll("/", "_").replaceAll("\\", "_").slice(0, 120) || "attachment";
    const id = randomUUID();
    objectKey = `beneficiaries/${user.id}/requests/${request.id}/${id}`;
    const bucket = beneficiaryBucket();
    const s3 = beneficiaryS3();

    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: bytes,
      ContentLength: bytes.length,
      ContentType: mimeType,
      Metadata: { owner: user.id, request: request.id },
    }));

    const saved = await prisma.beneficiaryFile.create({
      data: { id, userId: user.id, requestId: request.id, originalName: safeName, objectKey, mimeType, size: bytes.length },
      select: { id: true, originalName: true, mimeType: true, size: true, createdAt: true },
    });
    return NextResponse.json({ file: saved }, { status: 201, headers: { "Cache-Control": "no-store, private" } });
  } catch {
    if (objectKey) {
      try {
        await beneficiaryS3().send(new DeleteObjectCommand({ Bucket: beneficiaryBucket(), Key: objectKey }));
      } catch {
        // Preserve the original upload failure; an orphaned private object can be reconciled later.
      }
    }
    return NextResponse.json({ error: "تعذر حفظ الملف. حاول مرة أخرى." }, { status: 503 });
  }
}
