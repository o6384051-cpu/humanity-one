import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createOrganizationToken, ORGANIZATION_COOKIE } from "@/lib/organization-auth";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  const limit = await rateLimit(req, "organization-login", 8, 15 * 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter, limit.unavailable);
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email || password.length < 10) return NextResponse.json({ error: "أدخل البريد وكلمة المرور." }, { status: 400 });

  const organization = await prisma.organization.findUnique({ where: { email } });
  if (organization?.status === "ACTIVE" && organization.passwordHash && await bcrypt.compare(password, organization.passwordHash)) {
    const response = NextResponse.json({ ok: true, organization: { id: organization.id, name: organization.name, email: organization.email }, actorType: "OWNER" }, { headers: { "Cache-Control": "no-store" } });
    response.cookies.set(ORGANIZATION_COOKIE, createOrganizationToken(organization.id), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 12 });
    return response;
  }

  const member = await prisma.organizationMember.findUnique({ where: { email }, include: { organization: { select: { id: true, name: true, email: true, status: true } } });
  if (!member || member.status !== "ACTIVE" || member.organization.status !== "ACTIVE" || !(await bcrypt.compare(password, member.passwordHash))) {
    return NextResponse.json({ error: "بيانات الدخول غير صحيحة أو الحساب غير نشط." }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true, organization: { id: member.organization.id, name: member.organization.name, email: member.email }, actorType: "MEMBER", role: member.role }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(ORGANIZATION_COOKIE, createOrganizationToken(member.organizationId, member.id), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 12 });
  return response;
}
