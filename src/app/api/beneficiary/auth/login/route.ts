import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { issueEmailVerificationCode } from "@/lib/email-verification";
import { BENEFICIARY_COOKIE, createBeneficiaryToken } from "@/lib/beneficiary-auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // Keep a network-level ceiling, but avoid blocking every beneficiary behind
  // the same mobile-carrier NAT after only a handful of attempts.
  const networkLimit = await rateLimit(req, "beneficiary-login-network", 30, 900000);
  if (!networkLimit.allowed) return rateLimitResponse(networkLimit.retryAfter, networkLimit.unavailable);

  if (!process.env.JWT_SECRET) {
    return NextResponse.json({ error: "إعدادات الدخول غير مكتملة." }, { status: 503 });
  }

  try {
    const parsed = z.object({
      email: z.string().trim().email().max(160),
      password: z.string().min(1).max(128),
    }).safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json({ error: "أدخل البريد وكلمة المرور." }, { status: 400 });
    }

    // A separate per-account bucket follows the account across different IPs.
    const accountLimit = await rateLimit(
      req,
      "beneficiary-login-account",
      8,
      900000,
      parsed.data.email.toLowerCase(),
    );
    if (!accountLimit.allowed) return rateLimitResponse(accountLimit.retryAfter, accountLimit.unavailable);

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
    if (!user || user.role !== "USER" || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة." }, { status: 401 });
    }

    if (!user.emailVerifiedAt) {
      const sent = await issueEmailVerificationCode(user.id, user.email);
      if (!sent) return NextResponse.json({ error: "تعذر إرسال رمز التأكيد. خدمة البريد غير مهيأة أو متاحة حاليًا." }, { status: 503 });
      return NextResponse.json({ requiresEmailVerification: true, email: user.email }, { headers: { "Cache-Control": "no-store" } });
    }

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    }, { headers: { "Cache-Control": "no-store" } });
    response.cookies.set(BENEFICIARY_COOKIE, createBeneficiaryToken(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 1209600,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "تعذر تسجيل الدخول." }, { status: 503 });
  }
}
