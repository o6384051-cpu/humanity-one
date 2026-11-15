import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const prompts: Record<string, string> = {
  coordinator: "أنت منسق HUMANITY ONE. حوّل الطلب إلى خطوات آمنة وعملية. لا تدّع تنفيذ ما لم تنفذه.",
  education: "أنت معلم إنساني. اشرح بوضوح وبما يناسب مستوى المتعلم، وميّز المعلومة المؤكدة.",
  humanitarian: "أنت مساعد إنساني. احفظ كرامة الناس وخصوصيتهم. لا تختلق جهات أو مساعدات أو أرقامًا، ووجّه للحالات الطارئة إلى الجهات المختصة.",
  research: "أنت باحث. افصل الحقائق عن التحليل والاقتراح، ولا تخترع مراجع أو روابط.",
  review: "أنت مراجع سلامة. اكشف المخاطر والخصوصية وعدم اليقين.",
};

function safeProviderError(status: number) {
  if (status === 401 || status === 403) return "تعذر التحقق من مفتاح خدمة الذكاء الاصطناعي. راجع إعداد المفتاح لدى مزود الخدمة.";
  if (status === 429) return "وصلت خدمة الذكاء الاصطناعي إلى حد الاستخدام أو الحصة المجانية. حاول لاحقًا.";
  if (status >= 500) return "خدمة الذكاء الاصطناعي تواجه عطلًا مؤقتًا. حاول لاحقًا.";
  return "رفض مزود الذكاء الاصطناعي الطلب. راجع إعداد النموذج والخدمة.";
}

export async function POST(req: NextRequest) {
  const limit = await rateLimit(req, "ai-chat", 20, 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter, limit.unavailable);

  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > 24_000) return NextResponse.json({ error: "حجم المحادثة أكبر من المسموح." }, { status: 413 });

  // Never log or return provider credentials.
  const key = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  if (!key) {
    console.error("[ai-chat] configuration_error: missing_provider_key");
    return NextResponse.json({ error: "خدمة الذكاء الاصطناعي غير مهيأة حاليًا." }, { status: 503 });
  }

  try {
    const body = await req.json();
    const role = typeof body.role === "string" && body.role in prompts ? body.role : "coordinator";
    const incoming = Array.isArray(body.messages) ? body.messages : [];
    const messages = incoming
      .filter((message: any) => message && ["user", "assistant"].includes(message.role) && typeof message.content === "string")
      .slice(-12)
      .map((message: any) => ({ role: message.role, content: message.content.slice(0, 3500) }));

    if (!messages.length || messages[messages.length - 1].role !== "user") {
      return NextResponse.json({ error: "الرسالة غير صالحة." }, { status: 400 });
    }

    const base = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
    const model = process.env.AI_MODEL || "gpt-4o-mini";
    const upstream = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        temperature: 0.25,
        max_tokens: 1400,
        messages: [{ role: "system", content: prompts[role] }, ...messages],
      }),
      signal: AbortSignal.timeout(55_000),
    });

    const raw = await upstream.text();
    let data: any = {};
    try { data = raw ? JSON.parse(raw) : {}; } catch { /* handled as invalid provider response */ }

    if (!upstream.ok) {
      // Log only status and a coarse category. Never log provider body, prompt, or credentials.
      console.error("[ai-chat] provider_error", { status: upstream.status, category: upstream.status === 429 ? "quota_or_rate_limit" : upstream.status === 401 || upstream.status === 403 ? "authentication" : upstream.status >= 500 ? "provider_unavailable" : "request_rejected" });
      return NextResponse.json({ error: safeProviderError(upstream.status) }, {
        status: upstream.status === 429 ? 429 : upstream.status === 401 || upstream.status === 403 ? 503 : 502,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) {
      console.error("[ai-chat] invalid_provider_response", { model });
      return NextResponse.json({ error: "وصل رد غير مفهوم من خدمة الذكاء الاصطناعي. حاول مرة أخرى." }, { status: 502 });
    }

    return NextResponse.json({ reply, model }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const name = error instanceof Error ? error.name : "UnknownError";
    console.error("[ai-chat] request_failed", { category: name === "TimeoutError" ? "provider_timeout" : "network_or_processing_error" });
    return NextResponse.json({
      error: name === "TimeoutError"
        ? "استغرق رد المساعد وقتًا أطول من المعتاد. حاول مرة أخرى."
        : "تعذر الاتصال بخدمة الذكاء الاصطناعي. حاول مرة أخرى.",
    }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
