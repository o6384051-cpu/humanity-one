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
    return NextResponse.json({ applications }, { headers: { "Cache-Control": "no-store, private" } });
  } catch {
    return NextResponse.json({ error: "تعذر تحميل طلبات المنظمات." }, { status: 503 });
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin || !roles.includes(admin.role)) return NextResponse.json({ error: "غير مصرح." }, { status: 403 });
  const parsed = z.object({
    id: z.string().min(1),
    status: z.enum(["IN_REVIEW", "APPROVED", "REJECTED", "CLOSED"]),
  }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "بيانات التحديث غير صالحة." }, { status: 400 });
  try {
    const application = await prisma.mailMessage.findFirst({
      where: { id: parsed.data.id, department: "partners", parentId: null },
      select: { id: true },
    });
    if (!application) return NextResponse.json({ error: "طلب المنظمة غير موجود." }, { status: 404 });
    const updated = await prisma.mailMessage.update({
      where: { id: application.id },
      data: { status: parsed.data.status },
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
