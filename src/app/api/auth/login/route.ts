import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, createAdminToken } from "@/lib/admin-auth";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const limit = await rateLimit(req, "admin-login", 8, 15 * 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter, limit.unavailable);
  if (!process.env.JWT_SECRET) return NextResponse.json({ error: "إعداد JWT_SECRET مفقود من الاستضافة." }, { status: 503 });
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || password.length < 8) return NextResponse.json({ error: "أدخل البريد وكلمة المرور الصحيحة." }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !["SUPER_ADMIN", "ADMIN", "MODERATOR"].includes(user.role) || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة أو لا تملك صلاحية الإدارة." }, { status: 401 });
    }
    const response = NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } }, { headers: { "Cache-Control": "no-store" } });
    response.cookies.set(ADMIN_COOKIE, createAdminToken(user.id, user.role as "SUPER_ADMIN" | "ADMIN" | "MODERATOR"), {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 8,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "تعذر تسجيل الدخول الآن." }, { status: 500 });
  }
}
