import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { issueEmailVerificationCode } from "@/lib/email-verification";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const limit = await rateLimit(req, "email-verification-resend", 3, 15 * 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter, limit.unavailable);
  const parsed = z.object({ email: z.string().trim().email().max(160) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "أدخل بريدًا صحيحًا." }, { status: 400 });
  try {
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() }, select: { id: true, email: true } });
    if (user) {
      const sent = await issueEmailVerificationCode(user.id, user.email);
      if (!sent) return NextResponse.json({ error: "تعذر إرسال الرمز حاليًا." }, { status: 503 });
    }
    return NextResponse.json({ ok: true, message: "إذا كان الحساب موجودًا، فسيصلك رمز جديد." }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "تعذر إعادة إرسال الرمز." }, { status: 503 });
  }
}
