import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const readableRoles = ["SUPER_ADMIN", "ADMIN", "MODERATOR"];
const editableRoles = ["SUPER_ADMIN", "ADMIN"];
const categorySchema = z.enum(["institutional", "decision", "project", "policy"]);

const createSchema = z.object({
  title: z.string().trim().min(3).max(180),
  content: z.string().trim().min(10).max(12000),
  source: z.string().trim().max(1000).optional().nullable(),
  category: categorySchema,
});

const updateSchema = createSchema.extend({ id: z.string().min(1) });

export async function GET() {
  const admin = await getAdminSession();
  if (!admin || !readableRoles.includes(admin.role)) {
    return NextResponse.json({ error: "غير مصرح. يلزم تسجيل الدخول بحساب إداري." }, { status: 403 });
  }
  try {
    const documents = await prisma.knowledgeDocument.findMany({
      where: { category: { in: ["institutional", "decision", "project", "policy"] } },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, title: true, content: true, source: true, category: true, createdAt: true },
    });
    return NextResponse.json({ documents }, { headers: { "Cache-Control": "no-store, private" } });
  } catch {
    return NextResponse.json({ error: "تعذر تحميل الذاكرة المؤسسية." }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin || !editableRoles.includes(admin.role)) {
    return NextResponse.json({ error: "إضافة الذاكرة أو تعديلها متاح للإدارة فقط." }, { status: 403 });
  }
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "بيانات الذاكرة غير مكتملة أو غير صالحة." }, { status: 400 });
  try {
    const document = await prisma.knowledgeDocument.create({
      data: {
        title: parsed.data.title,
        content: parsed.data.content,
        source: parsed.data.source || null,
        category: parsed.data.category,
      },
      select: { id: true, title: true, source: true, category: true, createdAt: true },
    });
    return NextResponse.json({ ok: true, document }, { status: 201, headers: { "Cache-Control": "no-store, private" } });
  } catch {
    return NextResponse.json({ error: "تعذر حفظ سجل الذاكرة." }, { status: 503 });
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin || !editableRoles.includes(admin.role)) {
    return NextResponse.json({ error: "تصحيح الذاكرة متاح للإدارة فقط." }, { status: 403 });
  }
  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "بيانات التصحيح غير مكتملة أو غير صالحة." }, { status: 400 });
  try {
    const existing = await prisma.knowledgeDocument.findUnique({ where: { id: parsed.data.id }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: "سجل الذاكرة غير موجود." }, { status: 404 });
    const document = await prisma.knowledgeDocument.update({
      where: { id: parsed.data.id },
      data: {
        title: parsed.data.title,
        content: parsed.data.content,
        source: parsed.data.source || null,
        category: parsed.data.category,
      },
      select: { id: true, title: true, source: true, category: true, createdAt: true },
    });
    return NextResponse.json({ ok: true, document }, { headers: { "Cache-Control": "no-store, private" } });
  } catch {
    return NextResponse.json({ error: "تعذر تصحيح سجل الذاكرة." }, { status: 503 });
  }
}
