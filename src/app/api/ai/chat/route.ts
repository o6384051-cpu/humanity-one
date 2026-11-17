import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { HUMANITY_ONE_IDENTITY } from "@/lib/ai/identity";
import { buildOrchestrationContext } from "@/lib/ai/orchestration";
import { retrieveInstitutionalMemory, formatInstitutionalMemory } from "@/lib/ai/institutional-memory";

export const runtime = "nodejs";
export const maxDuration = 60;

const prompts: Record<string, string> = {
  coordinator: "أنت منسق HUMANITY ONE. حوّل الطلب إلى خطوات آمنة وعملية. لا تدّع تنفيذ ما لم تنفذه.",
  education: "أنت معلم إنساني. اشرح بوضوح وبما يناسب مستوى المتعلم، وميّز المعلومة المؤكدة.",
  humanitarian: "أنت مساعد إنساني. احفظ كرامة الناس وخصوصيتهم. لا تختلق جهات أو مساعدات أو أرقامًا، ووجّه للحالات الطارئة إلى الجهات المختصة.",
  research: "أنت باحث. افصل الحقائق عن التحليل والاقتراح، ولا تخترع مراجع أو روابط.",
  review: "أنت مراجع سلامة. اكشف المخاطر والخصوصية وعدم اليقين.",
};

type ProviderErrorCategory =
  | "authentication"
  | "quota_or_rate_limit"
  | "billing_required"
  | "model_configuration"
  | "endpoint_configuration"
  | "unsupported_parameter"
  | "invalid_request"
  | "provider_unavailable"
  | "unknown_rejection";

type ProviderConfig = {
  name: "primary" | "fallback";
  key: string;
  base: string;
  model: string;
};

type ProviderResult = {
  ok: boolean;
  status: number;
  data: any;
  category?: ProviderErrorCategory;
};

function safeProviderField(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return /^[a-zA-Z0-9_.:-]{1,80}$/.test(normalized) ? normalized : undefined;
}

function classifyProviderError(status: number, data: any): ProviderErrorCategory {
  if (status === 401 || status === 403) return "authentication";
  if (status === 402) return "billing_required";
  if (status === 429) return "quota_or_rate_limit";
  if (status >= 500) return "provider_unavailable";

  const error = data?.error;
  const details = [error?.code, error?.type, error?.param, error?.message, error?.status]
    .filter((value) => typeof value === "string")
    .join(" ")
    .toLowerCase();

  if (status === 404) {
    return /model|model_not_found/.test(details) ? "model_configuration" : "endpoint_configuration";
  }
  if (/model_not_found|unsupported model|model does not exist/.test(details)) {
    return "model_configuration";
  }
  if (
    typeof error?.param === "string" ||
    /unsupported|unknown parameter|invalid parameter|unrecognized|unexpected field|max_tokens|max_completion_tokens/.test(details)
  ) {
    return "unsupported_parameter";
  }
  if (/invalid_argument|invalid request|bad request|malformed/.test(details) || status === 400) {
    return "invalid_request";
  }
  return "unknown_rejection";
}

function safeProviderError(category: ProviderErrorCategory) {
  switch (category) {
    case "authentication":
      return "تعذر التحقق من إعداد مصادقة خدمة الذكاء الاصطناعي.";
    case "quota_or_rate_limit":
      return "وصلت خدمة الذكاء الاصطناعي إلى حد الاستخدام أو الحصة المتاحة. حاول لاحقًا.";
    case "billing_required":
      return "تتطلب خدمة الذكاء الاصطناعي مراجعة إعدادات الفوترة لدى المزود.";
    case "provider_unavailable":
      return "خدمة الذكاء الاصطناعي تواجه عطلًا مؤقتًا. حاول لاحقًا.";
    case "model_configuration":
      return "مزود الذكاء الاصطناعي لم يتعرف على النموذج المحدد. يلزم فحص اسم النموذج.";
    case "endpoint_configuration":
      return "تعذر العثور على مسار خدمة الذكاء الاصطناعي. يلزم فحص عنوان واجهة المزود.";
    case "unsupported_parameter":
      return "مزود الذكاء الاصطناعي رفض أحد إعدادات الطلب. يلزم تعديل توافق صيغة الطلب.";
    case "invalid_request":
      return "مزود الذكاء الاصطناعي رفض صيغة الطلب. تم تحديد نوع الخطأ دون تسجيل محتوى المحادثة أو الأسرار.";
    default:
      return "رفض مزود الذكاء الاصطناعي الطلب. يلزم فحص إعداد النموذج وصيغة الطلب.";
  }
}

function getProviders(): ProviderConfig[] {
  const primaryKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  if (!primaryKey) return [];

  // Free/low-cost-first: the configured primary provider is the only default.
  // A second provider is contacted only when the user explicitly configures
  // all fallback settings; requests are always sequential, never parallel.
  const primary: ProviderConfig = {
    name: "primary",
    key: primaryKey,
    base: (process.env.AI_BASE_URL || process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, ""),
    model: process.env.AI_ECONOMY_MODEL || process.env.AI_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini",
  };

  // Failover is deliberately opt-in: no second provider is called, and no extra
  // cost can be incurred, unless all three fallback settings are configured.
  const fallbackKey = process.env.AI_FALLBACK_API_KEY;
  const fallbackBase = process.env.AI_FALLBACK_BASE_URL;
  const fallbackModel = process.env.AI_FALLBACK_MODEL;
  if (!fallbackKey || !fallbackBase || !fallbackModel) return [primary];

  return [
    primary,
    {
      name: "fallback",
      key: fallbackKey,
      base: fallbackBase.replace(/\/+$/, ""),
      model: fallbackModel,
    },
  ];
}

async function callProvider(
  provider: ProviderConfig,
  role: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  orchestrationPrompt: string,
): Promise<ProviderResult> {
  const isGeminiOpenAIEndpoint =
    provider.base.includes("generativelanguage.googleapis.com") && provider.base.includes("/v1beta/openai");
  const chatMessages = [{ role: "system", content: `${HUMANITY_ONE_IDENTITY}\n\nالدور التخصصي الحالي:\n${prompts[role]}\n\n${orchestrationPrompt}` }, ...messages];
  const payload = isGeminiOpenAIEndpoint
    ? { model: provider.model, messages: chatMessages }
    : { model: provider.model, temperature: 0.25, max_tokens: 1400, messages: chatMessages };

  const upstream = await fetch(`${provider.base}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${provider.key}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(24_000),
  });

  const raw = await upstream.text();
  let data: any = {};
  try { data = raw ? JSON.parse(raw) : {}; } catch { /* handled as invalid provider response */ }

  return {
    ok: upstream.ok,
    status: upstream.status,
    data,
    category: upstream.ok ? undefined : classifyProviderError(upstream.status, data),
  };
}

function shouldUseFallback(result: ProviderResult) {
  // A validated user request should not be retried on another provider when the
  // request itself is malformed. Compatibility/configuration failures may be.
  return result.category !== "invalid_request";
}

export async function POST(req: NextRequest) {
  const limit = await rateLimit(req, "ai-chat", 20, 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter, limit.unavailable);

  // Daily per-IP ceiling limits unexpected provider usage and protects the free tier.
  const configuredDailyLimit = Number.parseInt(process.env.AI_DAILY_REQUEST_LIMIT || "100", 10);
  const dailyLimit = Number.isFinite(configuredDailyLimit)
    ? Math.min(1000, Math.max(1, configuredDailyLimit))
    : 100;
  const daily = await rateLimit(req, "ai-chat-daily", dailyLimit, 24 * 60 * 60 * 1000);
  if (!daily.allowed) {
    return NextResponse.json(
      { error: "وصلت إلى الحد اليومي المجاني للمساعد. حاول مرة أخرى غدًا." },
      { status: daily.unavailable ? 503 : 429, headers: { "Retry-After": String(daily.retryAfter), "Cache-Control": "no-store" } },
    );
  }

  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > 24_000) {
    return NextResponse.json({ error: "حجم المحادثة أكبر من المسموح." }, { status: 413 });
  }

  const providers = getProviders();
  if (!providers.length) {
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

    const orchestration = buildOrchestrationContext(messages[messages.length - 1].content, role);
    const institutionalMemory = await retrieveInstitutionalMemory(messages[messages.length - 1].content);
    const enrichedOrchestrationPrompt = `${orchestration.prompt}\n\n${formatInstitutionalMemory(institutionalMemory)}`;
    const activeRole = orchestration.decision.specialist;

    // Route routine work to the economical model. A higher-capability model is
    // used only for tasks that benefit from deeper reasoning and only if the
    // operator explicitly configured AI_ADVANCED_MODEL. No model is auto-added.
    const advancedModes = new Set(["plan", "research", "sensitive_action"]);
    const selectedModel = advancedModes.has(orchestration.decision.mode)
      ? process.env.AI_ADVANCED_MODEL || providers[0].model
      : providers[0].model;

    let result: ProviderResult | undefined;
    let activeProvider = { ...providers[0], model: selectedModel };

    try {
      result = await callProvider(activeProvider, activeRole, messages, enrichedOrchestrationPrompt);
    } catch (error) {
      const name = error instanceof Error ? error.name : "UnknownError";
      console.error("[ai-chat] primary_provider_request_failed", {
        category: name === "TimeoutError" ? "provider_timeout" : "network_error",
      });
      if (providers.length === 1) {
        return NextResponse.json({
          error: name === "TimeoutError"
            ? "استغرق رد المساعد وقتًا أطول من المعتاد. حاول مرة أخرى."
            : "تعذر الاتصال بخدمة الذكاء الاصطناعي. حاول مرة أخرى.",
        }, { status: 502, headers: { "Cache-Control": "no-store" } });
      }
    }

    if (result && !result.ok && providers.length > 1 && shouldUseFallback(result)) {
      console.error("[ai-chat] primary_provider_fallback", {
        status: result.status,
        category: result.category,
      });
      activeProvider = providers[1];
      try {
        result = await callProvider(activeProvider, activeRole, messages, enrichedOrchestrationPrompt);
      } catch (error) {
        const name = error instanceof Error ? error.name : "UnknownError";
        console.error("[ai-chat] fallback_provider_request_failed", {
          category: name === "TimeoutError" ? "provider_timeout" : "network_error",
        });
        return NextResponse.json({
          error: "تعذر الاتصال بمزودي الذكاء الاصطناعي حاليًا. حاول مرة أخرى لاحقًا.",
        }, { status: 502, headers: { "Cache-Control": "no-store" } });
      }
    } else if (!result && providers.length > 1) {
      activeProvider = providers[1];
      try {
        result = await callProvider(activeProvider, activeRole, messages, enrichedOrchestrationPrompt);
      } catch (error) {
        const name = error instanceof Error ? error.name : "UnknownError";
        console.error("[ai-chat] fallback_provider_request_failed", {
          category: name === "TimeoutError" ? "provider_timeout" : "network_error",
        });
        return NextResponse.json({
          error: "تعذر الاتصال بمزودي الذكاء الاصطناعي حاليًا. حاول مرة أخرى لاحقًا.",
        }, { status: 502, headers: { "Cache-Control": "no-store" } });
      }
    }

    if (!result) {
      return NextResponse.json({ error: "تعذر الاتصال بخدمة الذكاء الاصطناعي." }, { status: 502 });
    }

    if (!result.ok) {
      const providerError = result.data?.error;
      console.error("[ai-chat] provider_error", {
        provider: activeProvider.name,
        status: result.status,
        category: result.category,
        providerCode: safeProviderField(providerError?.code),
        providerType: safeProviderField(providerError?.type),
        providerParam: safeProviderField(providerError?.param),
      });
      return NextResponse.json({ error: safeProviderError(result.category || "unknown_rejection") }, {
        status: result.status === 429 ? 429 : result.status === 401 || result.status === 403 ? 503 : 502,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const reply = result.data?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) {
      console.error("[ai-chat] invalid_provider_response", { provider: activeProvider.name, model: activeProvider.model });
      return NextResponse.json({ error: "وصل رد غير مفهوم من خدمة الذكاء الاصطناعي. حاول مرة أخرى." }, { status: 502 });
    }

    return NextResponse.json({ reply, model: activeProvider.model }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const name = error instanceof Error ? error.name : "UnknownError";
    console.error("[ai-chat] request_failed", {
      category: name === "TimeoutError" ? "provider_timeout" : "network_or_processing_error",
    });
    return NextResponse.json({
      error: name === "TimeoutError"
        ? "استغرق رد المساعد وقتًا أطول من المعتاد. حاول مرة أخرى."
        : "تعذر الاتصال بخدمة الذكاء الاصطناعي. حاول مرة أخرى.",
    }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
