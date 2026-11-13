import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const inputSchema = z.object({
  task: z.string().trim().min(3).max(6000),
  domain: z.enum(["general", "education", "health", "agriculture", "humanitarian", "career", "science", "research"]).default("general"),
  memories: z.array(z.string().trim().min(1).max(500)).max(8).optional().default([]),
});

const specialists: Record<string, string> = {
  general: "أنت الوكيل المتخصص العام في HUMANITY ONE. قدم مساعدة عملية واضحة.",
  education: "أنت وكيل التعليم. علّم خطوة بخطوة، اختبر الفهم، ولا تنجز التقييم بدل المتعلم.",
  health: "أنت وكيل التوعية الصحية. قدم معلومات عامة فقط، لا تشخّص ولا تصف علاجًا فرديًا. اذكر علامات الخطر التي تستلزم رعاية عاجلة.",
  agriculture: "أنت وكيل الإرشاد الزراعي. ميّز بين المبادئ العامة والتوصيات التي تتطلب معرفة المحصول والتربة والمناخ المحلي.",
  humanitarian: "أنت الوكيل الإنساني. احفظ كرامة الناس وخصوصيتهم، ولا تختلق مساعدات أو جهات أو أرقامًا.",
  career: "أنت الوكيل المهني. قدم خطوات عملية للتوظيف والتدريب وريادة الأعمال، ولا تعد بوظائف أو دخل مضمون.",
  science: "أنت الوكيل العلمي. افصل بين الأدلة والفرضيات، ووضح حدود المعرفة.",
  research: "أنت وكيل البحث. لا تخترع مراجع أو روابط أو نتائج بحث. إذا لم تتوفر أداة بحث مباشرة فصرح بذلك ولا تدع أنك أجريت بحثًا على الإنترنت.",
};

async function complete(key: string, base: string, model: string, system: string, user: string) {
  const response = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
    }),
    signal: AbortSignal.timeout(45000),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof data?.error?.message === "string" ? data.error.message : "تعذر الاتصال بمزود النموذج.");
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) throw new Error("لم يرجع النموذج محتوى صالحًا.");
  return text.trim();
}

export async function POST(req: NextRequest) {
  const limit = rateLimit(req, "agent-team", 6, 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

  const key = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ error: "لم يتم ضبط AI_API_KEY في إعدادات الاستضافة." }, { status: 503 });

  try {
    const parsed = inputSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "الطلب غير صالح. راجع طول المهمة والتخصص." }, { status: 400 });

    const { task, domain, memories } = parsed.data;
    const base = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
    const model = process.env.AI_MODEL || "gpt-4o-mini";
    const context = memories.length
      ? "\n\nملاحظات ذاكرة أضافها المستخدم لهذه الجلسة فقط (غير موثقة خارجيًا):\n" + memories.map((m, i) => `${i + 1}. ${m}`).join("\n")
      : "";

    const plan = await complete(
      key, base, model,
      "أنت منسق فريق HUMANITY ONE. حوّل المهمة إلى خطة قصيرة من 2 إلى 4 خطوات. لا تنفذ إجراءات خارجية ولا تدّع استخدام أدوات غير متاحة. أخرج الخطة بالعربية.",
      task + context,
    );

    const draft = await complete(
      key, base, model,
      specialists[domain] + "\n\nنفذ الجزء التحليلي من المهمة اعتمادًا على المعلومات المتاحة فقط. لا تختلق مصادر أو أسعارًا أو جهات. وضح ما يحتاج تحققًا خارجيًا.",
      "المهمة:\n" + task + context + "\n\nخطة المنسق:\n" + plan,
    );

    const reviewed = await complete(
      key, base, model,
      "أنت مراجع السلامة والجودة في HUMANITY ONE. راجع المسودة بحثًا عن ادعاءات غير مسندة، مخاطر صحية أو قانونية أو مالية، انتهاك خصوصية، أو خطوات غير آمنة. صححها وأخرج إجابة عربية نهائية نافعة. لا تضف مصادر لم تُقدم لك.",
      "المهمة:\n" + task + "\n\nالمسودة:\n" + draft,
    );

    return NextResponse.json({
      answer: reviewed,
      plan,
      agents: [
        { id: "coordinator", label: "منسق المهمة", status: "completed" },
        { id: domain, label: "الوكيل المتخصص", status: "completed" },
        { id: "safety-reviewer", label: "مراجع السلامة والجودة", status: "completed" },
      ],
      model,
      limitations: ["هذا تنسيق متعدد المراحل عبر النموذج نفسه، وليس ثلاثة نماذج مستقلة.", "لم تُنفذ إجراءات خارجية أو بحث مباشر على الإنترنت.", "الملاحظات المرسلة كذاكرة تُستخدم لهذه المهمة فقط ولا تُحفظ على الخادم."],
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر تنفيذ المهمة.";
    return NextResponse.json({ error: message }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
