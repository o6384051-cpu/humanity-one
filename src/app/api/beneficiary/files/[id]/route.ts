import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";
import { getBeneficiarySession } from "@/lib/beneficiary-auth";
import { beneficiaryBucket, beneficiaryS3 } from "@/lib/beneficiary-file-storage";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, context: { params: { id: string } }) {
  const user = await getBeneficiarySession();
  if (!user) return NextResponse.json({ error: "سجّل الدخول أولًا." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const limit = await rateLimit(req, "beneficiary-file-download:" + user.id, 60, 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter, limit.unavailable);
  try {
    const file = await prisma.beneficiaryFile.findFirst({
      where: { id: context.params.id, userId: user.id },
      select: { objectKey: true, originalName: true, mimeType: true, size: true },
    });
    if (!file) return NextResponse.json({ error: "الملف غير موجود أو لا تملك صلاحية الوصول إليه." }, { status: 404 });
    const result = await beneficiaryS3().send(new GetObjectCommand({ Bucket: beneficiaryBucket(), Key: file.objectKey }));
    if (!result.Body) return NextResponse.json({ error: "الملف غير متاح." }, { status: 404 });
    const bytes = await result.Body.transformToByteArray();
    const safeName = encodeURIComponent(file.originalName);
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Length": String(file.size),
        "Content-Disposition": `attachment; filename*=UTF-8''${safeName}`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "تعذر تنزيل الملف." }, { status: 503 });
  }
}
