import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function matchesSecret(received: string, expected: string | undefined) {
  if (!expected) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET() {
  return new NextResponse(
    `<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>إعداد HUMANITY ONE CONNECT</title><body style="font-family:system-ui;max-width:520px;margin:48px auto;padding:20px;line-height:1.8"><h2>إعداد ربط HUMANITY ONE CONNECT</h2><p>أدخل رمز الإعداد المؤقت الذي أضفته في إعدادات Vercel. لا تدخل رمز BotFather هنا.</p><form method="post"><label for="secret">رمز الإعداد المؤقت</label><br><input id="secret" name="setup_secret" type="password" required minlength="32" autocomplete="off" style="width:100%;padding:12px;margin:10px 0"><button style="padding:12px 20px">تسجيل Webhook</button></form><p>هذه الصفحة مخصصة لإتمام الربط التجريبي فقط.</p></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } }
  );
}

export async function POST(request: NextRequest) {
  const setupSecret = process.env.TELEGRAM_SETUP_SECRET;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const publicUrl = process.env.HUMANITY_ONE_PUBLIC_URL;

  if (!setupSecret || !botToken || !webhookSecret || !publicUrl) {
    return NextResponse.json({ error: "Setup is not configured." }, { status: 503 });
  }

  let webhookUrl: URL;
  try {
    const base = new URL(publicUrl);
    if (base.protocol !== "https:" || base.username || base.password) {
      return NextResponse.json({ error: "Invalid public platform URL." }, { status: 500 });
    }
    base.pathname = base.pathname.replace(/\/$/, "") + "/api/telegram/webhook";
    base.search = "";
    base.hash = "";
    webhookUrl = base;
  } catch {
    return NextResponse.json({ error: "Invalid public platform URL." }, { status: 500 });
  }

  let submitted = "";
  try {
    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, "utf8") > 2048) {
      return NextResponse.json({ error: "Request too large." }, { status: 413 });
    }
    submitted = new URLSearchParams(rawBody).get("setup_secret") || "";
  } catch {
    return NextResponse.json({ error: "Invalid form submission." }, { status: 400 });
  }

  if (!matchesSecret(submitted, setupSecret)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl.toString(),
        secret_token: webhookSecret,
        allowed_updates: ["message"],
        drop_pending_updates: false,
      }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    const result = await response.json() as { ok?: boolean };
    if (!response.ok || !result.ok) {
      return NextResponse.json({ error: "Telegram could not register the webhook." }, { status: 502 });
    }
    return NextResponse.json({ ok: true, message: "Webhook registered successfully." });
  } catch {
    return NextResponse.json({ error: "Telegram service is temporarily unavailable." }, { status: 502 });
  }
}
