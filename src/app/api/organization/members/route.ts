import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getOrganizationSession } from "@/lib/organization-auth";

export const runtime = "nodejs";
const founderOnly = async () => null;

export async function GET() {
  const session = await getOrganizationSession();
  if (!session) return NextResponse.json({ error: "سجّل الدخول أولًا." }, { status: 401 });
  if (session.actorType !== "OWNER" && !session.permissions.includes("MANAGE_MEMBERS")) return NextResponse.json({ error: "لا تملك صلاحية إدارة أعضاء المنظمة." }, { status: 403 });
  const members = await prisma.organizationMember.findMany({ where: { organizationId: session.organizationId }, select: { id: true, name: true, email: true, role: true, permissions: true, status: true, createdAt: true }, orderBy: { createdAt: "asc" } });
  return NextResponse.json({ members }, { headers: { "Cache-Control": "no-store, private" } });
}

export async function POST(req: NextRequest) {
  const session = await getOrganizationSession();
  if (!session) return NextResponse.json({ error: "سجّل الدخول أولًا." }, { status: 401 });
  if (session.actorType !== "OWNER" && !session.permissions.includes("MANAGE_MEMBERS")) return NextResponse.json({ error: "إدارة الأعضاء للمالك أو المفوض فقط." }, { status: 403 });
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 80) : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const role = body?.role === "MANAGER" ? "MANAGER" : "SUPERVISOR";
  const permissions = Array.isArray(body?.permissions) ? body.permissions.filter((p: unknown) => ["VIEW_DATA", "MANAGE_MEMBERS", "MANAGE_RECORDS"].includes(String(p))) : ["VIEW_DATA"];
  if (!/^\S+@\S+\.\S+$/.test(email) || !name || password.length < 12) return NextResponse.json({ error: "أدخل اسمًا وبريدًا صحيحًا وكلمة مرور لا تقل عن 12 حرفًا." }, { status: 400 });
  const [existingOrganization, existingUser] = await Promise.all([prisma.organization.findUnique({ where: { email }, select: { id: true } }), prisma.user.findUnique({ where: { email }, select: { id: true } })]);
  if (existingOrganization || existingUser) return NextResponse.json({ error: "هذا البريد مرتبط بحساب آخر بالفعل." }, { status: 409 });
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const member = await prisma.organizationMember.create({ data: { organizationId: session.organizationId, email, name, passwordHash, role, permissions }, select: { id: true, email: true, name: true, role: true, permissions: true, status: true } });
    return NextResponse.json({ member }, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") return NextResponse.json({ error: "هذا البريد مستخدم بالفعل." }, { status: 409 });
    return NextResponse.json({ error: "تعذر إنشاء حساب المشرف." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getOrganizationSession();
  if (!session) return NextResponse.json({ error: "سجّل الدخول أولًا." }, { status: 401 });
  if (session.actorType !== "OWNER" && !session.permissions.includes("MANAGE_MEMBERS")) return NextResponse.json({ error: "لا تملك صلاحية إزالة الأعضاء." }, { status: 403 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "معرّف العضو مطلوب." }, { status: 400 });
  const member = await prisma.organizationMember.findFirst({ where: { id, organizationId: session.organizationId }, select: { id: true, role: true } });
  if (!member) return NextResponse.json({ error: "العضو غير موجود في منظمتك." }, { status: 404 });
  await prisma.organizationMember.delete({ where: { id: member.id } });
  return NextResponse.json({ ok: true });
}
