import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TelegramUpdate = {
  message?: {
    text?: string;
    chat?: { id?: number; type?: string };
    from?: { first_name?: string };
  };
};

export async function POST(req: NextRequest) {
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const receivedSecret = req.headers.get("x-telegram-bot-api-secret-token");

  if (!expectedSecret || !receivedSecret || receivedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const update = (await req.json().catch(() => null)) as TelegramUpdate | null;
  const message = update?.message;
  const chatId = message?.chat?.id;
  const text = message?.text?.trim();

  if (!chatId || !text) {
    return NextResponse.json({ ok: true });
  }

  if (text === "/start" || text.startsWith("/start ")) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return NextResponse.json({ ok: true });

    const reply = [
      "مرحبًا بك في HUMANITY ONE CONNECT.",
      "",
      "تم تفعيل استقبال رسائلك بنجاح.",
      "معرّف المحادثة (Chat ID): " + chatId,
      "",
      "لإكمال ربط إشعارات طلبات المنظمات، أضف هذا الرقم في Vercel كمتغير TELEGRAM_CHAT_ID ثم أعد النشر.",
      "لن يتم اعتماد أي منظمة تلقائيًا؛ جميع الطلبات تظل قيد مراجعة فريق HUMANITY ONE.",
    ].join("\n");

    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: reply }),
        signal: AbortSignal.timeout(8000),
      });
    } catch {
      // Telegram delivery is best-effort; webhook acknowledgement must remain fast.
    }
  } else if (text === "/help") {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (token) {
      try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "HUMANITY ONE CONNECT يستقبل إشعارات طلبات انضمام المنظمات بعد إكمال إعداد الربط.",
          }),
          signal: AbortSignal.timeout(8000),
        });
      } catch {
        // Best-effort response.
      }
    }
  }

  return NextResponse.json({ ok: true });
}
