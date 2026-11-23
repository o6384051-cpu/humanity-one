import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  verificationStatus: z.enum(["VERIFIED", "REJECTED"]),
  verificationNote: z.string().trim().min(5).max(2000),
});

export async function POST(request: NextRequest, context: { params: { id: string } }) {
  const admin = await getAdminSession();
  if (!admin || !["SUPER_ADMIN", "ADMIN"].includes(admin.role)) {
    return NextResponse.json({ error: "اعتماد السجلات متاح للإدارة المركزية فقط" }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "حدد نتيجة التحقق واكتب ملاحظة توضح المراجعة" }, { status: 400 });

  const existing = await prisma.humanitarianRecord.findUnique({
    where: { id: context.params.id },
    select: { id: true, verificationStatus: true, sourceName: true, observedAt: true },
  });
  if (!existing) return NextResponse.json({ error: "السجل غير موجود" }, { status: 404 });
  if (!existing.sourceName.trim()) return NextResponse.json({ error: "لا يمكن اعتماد سجل بلا مصدر" }, { status: 409 });

  const { verificationStatus, verificationNote } = parsed.data;
  const now = new Date();
  await prisma.$transaction([
    prisma.humanitarianRecord.update({
      where: { id: existing.id },
      data: {
        verificationStatus,
        verifiedAt: verificationStatus === "VERIFIED" ? now : null,
        verifiedByUserId: admin.id,
        verificationNote,
        ...(verificationStatus === "REJECTED" ? { sharingMode: "PRIVATE" } : {}),
      },
    }),
    prisma.radarAuditEvent.create({
      data: {
        recordId: existing.id,
        action: verificationStatus === "VERIFIED" ? "RECORD_VERIFIED" : "RECORD_REJECTED",
        actorUserId: admin.id,
        details: {
          previousVerificationStatus: existing.verificationStatus,
          verificationStatus,
          verificationNote,
          sourceName: existing.sourceName,
          observedAt: existing.observedAt.toISOString(),
          verifiedAt: verificationStatus === "VERIFIED" ? now.toISOString() : null,
        },
      },
    }),
  ]);

  return NextResponse.json({ success: true, verificationStatus, verifiedAt: verificationStatus === "VERIFIED" ? now : null }, { headers: { "Cache-Control": "no-store" } });
}
