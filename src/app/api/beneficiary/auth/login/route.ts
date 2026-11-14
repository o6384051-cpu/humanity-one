import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { BENEFICIARY_COOKIE, createBeneficiaryToken } from "@/lib/beneficiary-auth";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const limit = await rateLimit(req, "beneficiary-login", 8, 900000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

  if (!process.env.JWT_SECRET) {
    return NextResponse.json({ error: "إعدادات الدخول غير مكتملة." }, { status: 503 });
  }

  try {
    const parsed = z.object({
      email: z.string().email().max(160),
      password: z.string().min(1).max(128),
    }).safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json({ error: "أدخل البريد وكلمة المرور." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
    if (!user || user.role !== "USER" || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة." }, { status: 401 });
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
