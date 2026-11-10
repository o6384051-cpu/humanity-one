import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const prompts: Record<string, string> = {
  coordinator: "أنت منسق HUMANITY ONE. حوّل الطلب إلى خطوات آمنة وعملية. لا تدّع تنفيذ ما لم تنفذه.",
  education: "أنت معلم إنساني. اشرح بوضوح وبما يناسب مستوى المتعلم، وميّز المعلومة المؤكدة.",
  humanitarian: "أنت مساعد إنساني. احفظ كرامة الناس وخصوصيتهم. لا تختلق جهات أو مساعدات أو أرقامًا، ووجّه للحالات الطارئة إلى الجهات المختصة.",
  research: "أنت باحث. افصل الحقائق عن التحليل والاقتراح، ولا تخترع مراجع أو روابط.",
  review: "أنت مراجع سلامة. اكشف المخاطر والخصوصية وعدم اليقين.",
};

export async function POST(req: NextRequest) {
  // AI_API_KEY is provider-neutral. OPENAI_API_KEY remains as a backward-compatible fallback.
  const key = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "لم يتم ضبط AI_API_KEY في إعدادات الاستضافة." },
      { status: 503 },
    );
  }

  try {
    const body = await req.json();
    const role =
      typeof body.role === "string" && body.role in prompts
        ? body.role
        : "coordinator";
    const incoming = Array.isArray(body.messages) ? body.messages : [];
    const messages = incoming
      .filter(
        (message: any) =>
          message &&
          ["user", "assistant"].includes(message.role) &&
          typeof message.content === "string",
      )
      .slice(-12)
      .map((message: any) => ({
        role: message.role,
        content: message.content.slice(0, 8000),
      }));

    if (!messages.length || messages[messages.length - 1].role !== "user") {
      return NextResponse.json({ error: "الرسالة غير صالحة." }, { status: 400 });
    }

    const base = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(
      /\/+$/,
      "",
    );
    const model = process.env.AI_MODEL || "gpt-4o-mini";
    const upstream = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.25,
        messages: [{ role: "system", content: prompts[role] }, ...messages],
      }),
      signal: AbortSignal.timeout(60000),
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const providerMessage =
        typeof data?.error?.message === "string"
          ? data.error.message
          : "فشل مزود النموذج.";
      return NextResponse.json(
        { error: providerMessage },
        { status: upstream.status >= 500 ? 502 : 400 },
      );
    }

    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) {
      return NextResponse.json(
        { error: "لم يرجع النموذج إجابة صالحة." },
        { status: 502 },
      );
    }

    return NextResponse.json({ reply, model });
  } catch {
    return NextResponse.json(
      { error: "تعذر الاتصال بمزود الذكاء الاصطناعي. حاول مرة أخرى." },
      { status: 500 },
    );
  }
}
