import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TelegramMessage = {
  text?: unknown;
  chat?: { id?: unknown; type?: unknown };
};

type TelegramUpdate = {
  update_id?: unknown;
  message?: TelegramMessage;
};

const MAX_BODY_BYTES = 16_384;

function safeSecretMatch(received: string | null, expected: string | undefined) {
  if (!received || !expected) return false;
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer);
}

function getCommand(text: unknown) {
  if (typeof text !== "string" || text.length > 500) return null;
  const match = text.trim().match(/^\/(start|help|about|join)(?:@[a-z0-9_]+)?(?:\s|$)/i);
  return match?.[1]?.toLowerCase() ?? null;
}

function replyFor(command: string, publicUrl: string) {
  const home = publicUrl ? `\n\nبوابة المنظمات: ${publicUrl.replace(/\/$/, "")}/organizations` : "";
  switch (command) {
    case "start":
      return "مرحبًا بك في HUMANITY ONE CONNECT 🤝\nقناة للتعريف بشبكة التعاون بين المنظمات المستقلة. لا يعني التواصل عبر البوت اعتماد أي جهة كشريك.";
    case "about":
      return "تعمل HUMANITY ONE على ربط المنظمات المستقلة لتنسيق التعاون الإنساني، مع احترام استقلال كل جهة وحماية خصوصية المستفيدين. لا توجد شراكة أو مساعدة مؤكدة لمجرد استخدام البوت." + home;
    case "join":
      return "لطلب الانضمام، استخدم بوابة المنظمات أو راسلنا من البريد الرسمي لمؤسستك على humanityone.contact@gmail.com. سيظل الطلب قيد المراجعة، ولن تُعرض منظمتك كشريك معتمد قبل التحقق والموافقة المكتوبة." + home;
    case "help":
    default:
      return "الأوامر المتاحة:\n/start — بدء الاستخدام\n/about — التعرف على الشبكة\n/join — معلومات طلب الانضمام\n/help — المساعدة\n\nلا ترسل بيانات مستفيدين أو مستندات شخصية عبر هذا البوت في هذه المرحلة.";
  }
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!webhookSecret || !botToken) {
    return NextResponse.json({ error: "Telegram integration is not configured." }, { status: 503 });
  }

  if (!safeSecretMatch(request.headers.get("x-telegram-bot-api-secret-token"), webhookSecret)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }

  let update: TelegramUpdate;
  try {
    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Payload too large." }, { status: 413 });
    }
    update = JSON.parse(rawBody) as TelegramUpdate;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!Number.isSafeInteger(update.update_id)) {
    return NextResponse.json({ ok: true });
  }

  const message = update.message;
  const chatId = message?.chat?.id;
  const command = getCommand(message?.text);

  // This first version intentionally handles private-chat commands only.
  // It does not collect, store, or forward personal or beneficiary information.
  if (
    message?.chat?.type !== "private" ||
    !Number.isSafeInteger(chatId) ||
    !command
  ) {
    return NextResponse.json({ ok: true });
  }

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: replyFor(command, process.env.HUMANITY_ONE_PUBLIC_URL || ""),
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });

    if (!telegramResponse.ok) {
      return NextResponse.json({ error: "Telegram delivery failed." }, { status: 502 });
    }
    const result = await telegramResponse.json() as { ok?: boolean };
    if (!result.ok) {
      return NextResponse.json({ error: "Telegram rejected the message." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Telegram service is temporarily unavailable." }, { status: 502 });
  }
}
