import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { BENEFICIARY_COOKIE, createBeneficiaryToken } from "@/lib/beneficiary-auth";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const limit = await rateLimit(req, "beneficiary-register", 5, 3600000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter, limit.unavailable);

  if (!process.env.JWT_SECRET) {
    return NextResponse.json({ error: "إعدادات الدخول غير مكتملة." }, { status: 503 });
  }

  try {
    const parsed = z.object({
      name: z.string().trim().min(2).max(80),
      email: z.string().trim().email().max(160),
      password: z.string().min(10).max(128),
    }).safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json({ error: "أدخل اسمًا وبريدًا صحيحًا وكلمة مرور من 10 أحرف على الأقل." }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        passwordHash: await bcrypt.hash(parsed.data.password, 12),
        role: "USER",
      },
      select: { id: true, name: true, email: true, role: true },
    });

    const response = NextResponse.json({ user }, { status: 201, headers: { "Cache-Control": "no-store" } });
    response.cookies.set(BENEFICIARY_COOKIE, createBeneficiaryToken(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 1209600,
    });
    return response;
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "هذا البريد مسجل بالفعل." }, { status: 409 });
    }
    return NextResponse.json({ error: "تعذر إنشاء الحساب." }, { status: 503 });
  }
}
