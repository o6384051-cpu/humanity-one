import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";
async function founder() {
  const actor = await getAdminSession();
  return actor?.role === "SUPER_ADMIN" ? actor : null;
}
export async function GET() {
  if (!await founder()) return NextResponse.json({ error: "هذه الصفحة للمؤسس فقط." }, { status: 403 });
  const organizations = await prisma.organization.findMany({
    select: { id: true, name: true, email: true, status: true, country: true, city: true, members: { select: { id: true, name: true, email: true, role: true, permissions: true, status: true, createdAt: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ organizations }, { headers: { "Cache-Control": "no-store, private" } });
}
export async function POST(req: NextRequest) {
  if (!await founder()) return NextResponse.json({ error: "هذه الصلاحية للمؤسس فقط." }, { status: 403 });
  const body = await req.json().catch(() => null);
  const organizationId = typeof body?.organizationId === "string" ? body.organizationId : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 80) : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const role = body?.role === "MANAGER" ? "MANAGER" : "SUPERVISOR";
  const permissions = Array.isArray(body?.permissions) ? body.permissions.filter((p: unknown) => ["VIEW_DATA", "MANAGE_MEMBERS", "MANAGE_RECORDS"].includes(String(p))) : ["VIEW_DATA"];
  if (!organizationId || !/^\S+@\S+\.\S+$/.test(email) || !name || password.length < 12) return NextResponse.json({ error: "تحقق من المنظمة والاسم والبريد وكلمة المرور (12 حرفًا على الأقل)." }, { status: 400 });
  const organization = await prisma.organization.findUnique({ where: { id: organizationId }, select: { id: true } });
  if (!organization) return NextResponse.json({ error: "المنظمة غير موجودة." }, { status: 404 });
  try {
    const member = await prisma.organizationMember.create({ data: { organizationId, email, name, passwordHash: await bcrypt.hash(password, 12), role, permissions }, select: { id: true, organizationId: true, name: true, email: true, role: true, permissions: true, status: true } });
    return NextResponse.json({ member }, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") return NextResponse.json({ error: "هذا البريد مستخدم بالفعل." }, { status: 409 });
    return NextResponse.json({ error: "تعذر إنشاء حساب مشرف المنظمة." }, { status: 500 });
  }
}
export async function DELETE(req: NextRequest) {
  if (!await founder()) return NextResponse.json({ error: "هذه الصلاحية للمؤسس فقط." }, { status: 403 });
  const id = req.nextUrl.searchParams.get("memberId");
  if (!id) return NextResponse.json({ error: "معرّف المشرف مطلوب." }, { status: 400 });
  const member = await prisma.organizationMember.findUnique({ where: { id }, select: { id: true, role: true, organizationId: true } });
  if (!member) return NextResponse.json({ error: "المشرف غير موجود." }, { status: 404 });
  await prisma.organizationMember.delete({ where: { id } });
  return NextResponse.json({ ok: true, removedFromOrganizationId: member.organizationId });
}
