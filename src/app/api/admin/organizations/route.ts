import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const roles = ["SUPER_ADMIN", "ADMIN", "MODERATOR"];

export async function GET() {
  const admin = await getAdminSession();
  if (!admin || !roles.includes(admin.role)) return NextResponse.json({ error: "غير مصرح. سجّل الدخول بحساب إداري." }, { status: 403 });
  try {
    const applications = await prisma.mailMessage.findMany({
      where: { department: "partners", parentId: null },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, senderName: true, senderEmail: true, subject: true, body: true, status: true, createdAt: true, updatedAt: true },
    });
    return NextResponse.json({ applications, actorRole: admin.role }, { headers: { "Cache-Control": "no-store, private" } });
  } catch {
    return NextResponse.json({ error: "تعذر تحميل طلبات المنظمات." }, { status: 503 });
  }
}

const approvalSchema = z.object({
  legalIdentityVerified: z.literal(true),
  officialChannelsVerified: z.literal(true),
  writtenConsentVerified: z.literal(true),
  verificationNote: z.string().trim().min(10).max(1200),
});

export async function PATCH(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin || !roles.includes(admin.role)) return NextResponse.json({ error: "غير مصرح." }, { status: 403 });
  const parsed = z.object({
    id: z.string().min(1),
    status: z.enum(["IN_REVIEW", "APPROVED", "REJECTED", "CLOSED"]),
    verification: approvalSchema.optional(),
  }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "بيانات التحديث غير صالحة. يلزم استكمال عناصر التحقق الثلاثة وكتابة ملاحظة عند الاعتماد." }, { status: 400 });

  if (parsed.data.status === "APPROVED") {
    if (admin.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "الاعتماد النهائي للمنظمات من صلاحية حساب المؤسس فقط." }, { status: 403 });
    }
    const verification = approvalSchema.safeParse(parsed.data.verification);
    if (!verification.success) {
      return NextResponse.json({ error: "لا يمكن اعتماد المنظمة قبل تأكيد التحقق من الهوية القانونية والقنوات الرسمية والموافقة المكتوبة، مع تسجيل ملاحظة المراجعة." }, { status: 400 });
    }
  }

  try {
    const application = await prisma.mailMessage.findFirst({
      where: { id: parsed.data.id, department: "partners", parentId: null },
      select: { id: true, body: true, status: true },
    });
    if (!application) return NextResponse.json({ error: "طلب المنظمة غير موجود." }, { status: 404 });

    const data: { status: string; body?: string } = { status: parsed.data.status };
    if (parsed.data.status === "APPROVED" && parsed.data.verification) {
      const verification = parsed.data.verification;
      const audit = [
        "",
        "--- سجل الاعتماد النهائي في HUMANITY ONE ---",
        "المعتمد: " + admin.email,
        "الدور: المؤسس",
        "التاريخ: " + new Date().toISOString(),
        "التحقق من الهوية القانونية والمستندات: تم التأكيد",
        "التحقق من القنوات الرسمية: تم التأكيد",
        "الموافقة المكتوبة على التعاون: تم التأكيد",
        "ملاحظة المراجعة: " + verification.verificationNote,
      ].join("\\n");
      data.body = application.body + audit;
    }

    const updated = await prisma.mailMessage.update({
      where: { id: application.id },
      data,
      select: { id: true, status: true, updatedAt: true },
    });
    return NextResponse.json({ ok: true, status: updated.status, updatedAt: updated.updatedAt }, {
      headers: { "Cache-Control": "no-store, private" },
    });
  } catch (error) {
    const e = error as { name?: string; code?: string };
    console.error("[admin-organizations] status update failed", {
      name: e?.name || "UnknownError",
      code: e?.code || "UNKNOWN",
    });
    return NextResponse.json({ error: "تعذر تحديث حالة طلب المنظمة. أعد المحاولة، وإذا تكرر الخطأ راجع سجل النظام." }, { status: 503 });
  }
}
