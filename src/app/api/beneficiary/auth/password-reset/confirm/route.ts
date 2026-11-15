import { createHash } from "crypto";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limit = await rateLimit(req, "beneficiary-password-reset-confirm", 6, 15 * 60 * 1000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter, limit.unavailable);

  const parsed = z.object({
    token: z.string().regex(/^[a-f0-9]{64}$/),
    password: z.string().min(10).max(128),
  }).safeParse(await req.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "الرابط غير صالح أو انتهت صلاحيته. اطلب رابطًا جديدًا." }, { status: 400 });
  }

  try {
    const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const result = await prisma.user.updateMany({
      where: {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: { gt: new Date() },
        role: "USER",
      },
      data: {
        passwordHash,
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
      },
    });

    if (result.count !== 1) {
      return NextResponse.json({ error: "الرابط غير صالح أو انتهت صلاحيته. اطلب رابطًا جديدًا." }, { status: 400 });
    }

    return NextResponse.json(
      { message: "تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول." },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "تعذر تغيير كلمة المرور حاليًا. حاول مرة أخرى." }, { status: 503 });
  }
}
