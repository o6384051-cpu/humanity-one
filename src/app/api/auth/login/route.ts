import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { issueEmailVerificationCode } from "@/lib/email-verification";
import { ADMIN_COOKIE, createAdminToken } from "@/lib/admin-auth";

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
    if (!user.emailVerifiedAt) {
      const sent = await issueEmailVerificationCode(user.id, user.email);
      if (!sent) return NextResponse.json({ error: "تعذر إرسال رمز التأكيد. خدمة البريد غير مهيأة أو متاحة حاليًا." }, { status: 503 });
      return NextResponse.json({ requiresEmailVerification: true, email: user.email }, { headers: { "Cache-Control": "no-store" } });
    }

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    }, { headers: { "Cache-Control": "no-store" } });
    response.cookies.set(ADMIN_COOKIE, createAdminToken(user.id, user.role as "SUPER_ADMIN" | "ADMIN" | "MODERATOR"), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return response;
  } catch (error) {
    // Log only a stable error identifier; never log credentials, request data, or connection strings.
    const code =
      error && typeof error === "object" && "code" in error
        ? String((error as { code?: unknown }).code ?? "UNKNOWN")
        : "UNKNOWN";
    const name = error instanceof Error ? error.name : "UnknownError";
    console.error("[admin-login] request failed", { code, name });
    return NextResponse.json({ error: "تعذر تسجيل الدخول الآن." }, { status: 500 });
  }
}
