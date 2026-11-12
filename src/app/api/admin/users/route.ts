import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET() {
  const actor = await getAdminSession();
  if (!actor || !["SUPER_ADMIN", "ADMIN"].includes(actor.role)) return NextResponse.json({ error: "غير مصرح." }, { status: 403 });
  const users = await prisma.user.findMany({
    where: { role: { in: ["SUPER_ADMIN", "ADMIN", "MODERATOR"] } },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const actor = await getAdminSession();
  if (!actor || actor.role !== "SUPER_ADMIN") return NextResponse.json({ error: "هذه الصلاحية للمؤسس فقط." }, { status: 403 });
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";
    const password = typeof body.password === "string" ? body.password : "";
    const role = body.role;
    if (!/^\S+@\S+\.\S+$/.test(email) || !name || password.length < 12 || !["ADMIN", "MODERATOR"].includes(role)) {
      return NextResponse.json({ error: "تحقق من البيانات. كلمة المرور 12 حرفًا على الأقل، والدور إداري أو مشرف." }, { status: 400 });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email, name, passwordHash, role }, select: { id: true, email: true, name: true, role: true } });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") return NextResponse.json({ error: "هذا البريد مسجل بالفعل." }, { status: 409 });
    return NextResponse.json({ error: "تعذر إضافة المستخدم." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const actor = await getAdminSession();
  if (!actor || actor.role !== "SUPER_ADMIN") return NextResponse.json({ error: "هذه الصلاحية للمؤسس فقط." }, { status: 403 });
  try {
    const body = await req.json();
    const id = typeof body.id === "string" ? body.id : "";
    const role = body.role;
    if (!id || !["ADMIN", "MODERATOR", "USER"].includes(role)) return NextResponse.json({ error: "البيانات غير صالحة." }, { status: 400 });
    const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
    if (!target || target.role === "SUPER_ADMIN") return NextResponse.json({ error: "لا يمكن تعديل حساب مؤسس." }, { status: 403 });
    const updated = await prisma.user.update({ where: { id }, data: { role }, select: { id: true, name: true, email: true, role: true } });
    return NextResponse.json({ user: updated });
  } catch {
    return NextResponse.json({ error: "تعذر تحديث الصلاحية." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const actor = await getAdminSession();
  if (!actor || actor.role !== "SUPER_ADMIN") return NextResponse.json({ error: "هذه الصلاحية للمؤسس فقط." }, { status: 403 });
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id || id === actor.id) return NextResponse.json({ error: "لا يمكن حذف حسابك الحالي." }, { status: 400 });
    const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
    if (!target || target.role === "SUPER_ADMIN") return NextResponse.json({ error: "لا يمكن حذف حساب مؤسس." }, { status: 403 });
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "تعذر حذف الحساب." }, { status: 500 });
  }
}
