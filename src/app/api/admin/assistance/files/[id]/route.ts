import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { beneficiaryBucket, beneficiaryS3 } from "@/lib/beneficiary-file-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, context: { params: { id: string } }) {
  const admin = await getAdminSession();
  if (!admin || !["SUPER_ADMIN", "ADMIN", "MODERATOR"].includes(admin.role)) {
    return NextResponse.json({ error: "غير مصرح." }, { status: 403 });
  }

  try {
    const file = await prisma.beneficiaryFile.findUnique({
      where: { id: context.params.id },
      select: { objectKey: true, originalName: true, mimeType: true, size: true },
    });
    if (!file) return NextResponse.json({ error: "المرفق غير موجود." }, { status: 404 });

    const result = await beneficiaryS3().send(new GetObjectCommand({
      Bucket: beneficiaryBucket(),
      Key: file.objectKey,
    }));
    if (!result.Body) return NextResponse.json({ error: "الملف غير متاح." }, { status: 404 });

    const bytes = await result.Body.transformToByteArray();
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Length": String(file.size),
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.originalName)}`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "تعذر تنزيل المرفق." }, { status: 503 });
  }
}
