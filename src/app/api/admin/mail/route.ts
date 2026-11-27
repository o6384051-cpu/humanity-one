import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession, hasAdminPermission } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin || !hasAdminPermission(admin, "MANAGE_MAIL")) return NextResponse.json({ error: "غير مصرح." }, { status: 403 });
  try {
    const messages = await prisma.mailMessage.findMany({ where: { parentId: null }, orderBy: { createdAt: "desc" }, take: 100, include: { replies: { orderBy: { createdAt: "asc" } } } });
    return NextResponse.json({ messages }, { headers: { "Cache-Control": "no-store, private" } });
  } catch { return NextResponse.json({ error: "تعذر تحميل صندوق البريد." }, { status: 503 }); }
}

export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "غير مصرح." }, { status: 401 });
  const parsed = z.object({ parentId: z.string().min(1), body: z.string().trim().min(2).max(5000) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "الرد غير صالح." }, { status: 400 });
  try {
    const parent = await prisma.mailMessage.findUnique({ where: { id: parsed.data.parentId }, select: { id: true, parentId: true } });
    if (!parent || parent.parentId) return NextResponse.json({ error: "المحادثة غير موجودة." }, { status: 404 });
    const reply = await prisma.mailMessage.create({ data: { senderName: admin.name || "إدارة HUMANITY ONE", senderEmail: admin.email, department: "administration", subject: "رد الإدارة", body: parsed.data.body, direction: "OUTBOUND", status: "SENT", senderUserId: admin.id, parentId: parent.id } });
    await prisma.mailMessage.update({ where: { id: parent.id }, data: { status: "REPLIED" } });
    return NextResponse.json({ ok: true, reply }, { status: 201 });
  } catch { return NextResponse.json({ error: "تعذر حفظ الرد." }, { status: 503 }); }
}

export async function PATCH(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "غير مصرح." }, { status: 401 });
  const parsed = z.object({ id: z.string().min(1), status: z.enum(["NEW", "IN_PROGRESS", "CLOSED"]) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "التحديث غير صالح." }, { status: 400 });
  try {
    await prisma.mailMessage.updateMany({ where: { id: parsed.data.id, parentId: null }, data: { status: parsed.data.status } });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "تعذر تحديث حالة الرسالة." }, { status: 503 }); }
}
