import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const genericMessage = "إذا كان البريد مرتبطًا بحساب مستفيد، فستصلك رسالة تحتوي على رابط آمن لإعادة تعيين كلمة المرور.";

export async function POST(req: NextRequest) {
  const limit = await rateLimit(req, "beneficiary-password-reset-request", 3, 60 * 60 * 1000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter, limit.unavailable);

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    return NextResponse.json(
      { error: "خدمة إرسال رسائل الاستعادة غير مهيأة حاليًا. حاول لاحقًا." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const parsed = z.object({ email: z.string().trim().email().max(160) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "أدخل بريدًا إلكترونيًا صحيحًا." }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
      select: { id: true, email: true, role: true },
    });

    // Keep the response identical for unknown addresses and non-beneficiary accounts.
    if (!user || user.role !== "USER") {
      return NextResponse.json({ message: genericMessage }, { headers: { "Cache-Control": "no-store" } });
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetTokenHash: tokenHash, passwordResetExpiresAt: expiresAt },
    });

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://humanity-one-wc35.vercel.app").replace(/\/+$/, "");
    const resetUrl = `${appUrl}/beneficiary/reset-password?token=${token}`;

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [user.email],
          subject: "إعادة تعيين كلمة مرور HUMANITY ONE",
          text: `وصلنا طلب لإعادة تعيين كلمة مرور حسابك في HUMANITY ONE. افتح الرابط التالي خلال 30 دقيقة لإعداد كلمة مرور جديدة: ${resetUrl}\nإذا لم تطلب ذلك، فتجاهل هذه الرسالة.`,
          html: `<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.9"><h2>إعادة تعيين كلمة المرور</h2><p>وصلنا طلب لإعادة تعيين كلمة مرور حسابك في HUMANITY ONE.</p><p><a href="${resetUrl}">اضغط هنا لإعداد كلمة مرور جديدة</a></p><p>الرابط صالح لمدة 30 دقيقة ويُستخدم مرة واحدة فقط.</p><p>إذا لم تطلب ذلك، فتجاهل هذه الرسالة.</p></div>`,
        }),
        cache: "no-store",
      });

      if (!response.ok) {
        await prisma.user.updateMany({
          where: { id: user.id, passwordResetTokenHash: tokenHash },
          data: { passwordResetTokenHash: null, passwordResetExpiresAt: null },
        });
      }
    } catch {
      // Do not reveal whether an address belongs to an account when email delivery fails.
      await prisma.user.updateMany({
        where: { id: user.id, passwordResetTokenHash: tokenHash },
        data: { passwordResetTokenHash: null, passwordResetExpiresAt: null },
      }).catch(() => undefined);
    }

    return NextResponse.json({ message: genericMessage }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json(
      { error: "تعذر معالجة الطلب حاليًا. حاول مرة أخرى بعد قليل." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
