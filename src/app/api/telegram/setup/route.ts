import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const actor = await getAdminSession();
  if (!actor || !["SUPER_ADMIN", "ADMIN"].includes(actor.role)) {
    return NextResponse.json({ error: "غير مصرح. سجّل الدخول بحساب إداري." }, { status: 403 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!token || !webhookSecret) {
    return NextResponse.json({
      error: "أضف TELEGRAM_BOT_TOKEN و TELEGRAM_WEBHOOK_SECRET إلى متغيرات Vercel في بيئة Production ثم أعد النشر.",
    }, { status: 503 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://humanity-one-wc35.vercel.app";
  const webhookUrl = appUrl.replace(/\/$/, "") + "/api/telegram/webhook";

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        secret_token: webhookSecret,
        allowed_updates: ["message"],
        drop_pending_updates: false,
      }),
      signal: AbortSignal.timeout(10000),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.ok) {
      return NextResponse.json({ error: "رفض Telegram إعداد webhook. تحقق من رمز البوت ثم أعد المحاولة." }, { status: 502 });
    }
    return NextResponse.json({
      ok: true,
      message: "تم ربط بوت HUMANITY ONE بنجاح. أرسل /start إلى البوت الآن.",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "تعذر الاتصال بتليجرام الآن. حاول مرة أخرى." }, { status: 502 });
  }
}
