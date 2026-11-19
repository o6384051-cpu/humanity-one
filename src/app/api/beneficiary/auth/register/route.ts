import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { issueEmailVerificationCode } from "@/lib/email-verification";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const limit = await rateLimit(req, "beneficiary-register", 5, 3600000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

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

    const sent = await issueEmailVerificationCode(user.id, user.email);
    if (!sent) {
      await prisma.user.delete({ where: { id: user.id } });
      return NextResponse.json({ error: "تعذر إرسال رمز التأكيد. حاول لاحقًا." }, { status: 503 });
    }
    return NextResponse.json({ requiresEmailVerification: true, email: user.email }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "هذا البريد مسجل بالفعل." }, { status: 409 });
    }
    return NextResponse.json({ error: "تعذر إنشاء الحساب." }, { status: 503 });
  }
}
