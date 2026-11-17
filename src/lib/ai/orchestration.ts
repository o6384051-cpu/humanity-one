/**
 * HUMANITY ONE — lightweight request orchestrator.
 *
 * This layer classifies the user's goal and gives the model a bounded workflow.
 * It does not execute external tools. Real tool adapters must be added separately
 * and must enforce authentication, authorization, and explicit approval.
 */

import { buildDeepReasoningInstructions, buildAutonomousTaskPlan } from "@/lib/ai/cognitive-core";

export type AssistantRole =
  | "coordinator"
  | "education"
  | "humanitarian"
  | "research"
  | "review";

export type TaskMode =
  | "answer"
  | "plan"
  | "learn"
  | "research"
  | "humanitarian_support"
  | "sensitive_action";

export type RiskLevel = "low" | "medium" | "high";

export type OrchestrationDecision = {
  mode: TaskMode;
  risk: RiskLevel;
  specialist: AssistantRole;
  requiresHumanApproval: boolean;
  workflow: string[];
};

const SENSITIVE_ACTION_PATTERN =
  /\b(send|publish|delete|transfer|pay|purchase|refund|change password|change permissions|invite users|email everyone)\b|إرسال|انشر|نشر|احذف|حذف|تحويل أموال|ادفع|شراء|استرداد|غيّر الصلاحيات|تغيير الصلاحيات|أرسل للجميع|راسل الجميع/i;

const RESEARCH_PATTERN =
  /ابحث|بحث|مصادر|مراجع|تحقق|قارن|دراسة|إحصائيات|آخر الأخبار|research|sources|verify|compare|statistics/i;

const LEARNING_PATTERN =
  /علمني|علّمني|تعلم|تعلّم|درس|اشرح لي|تدريب|تمرين|اقرأ|تدريب على الكتابة|teach me|learn|lesson|practice/i;

const HUMANITARIAN_PATTERN =
  /مساعدة إنسانية|مساعدات|فقر|محتاج|مستفيد|فرصة عمل|وظيفة|مشروع صغير|دعم مجتمعي|humanitarian|beneficiary|poverty|job opportunity/i;

const PLANNING_PATTERN =
  /خطة|خطط|نفذ|تنفيذ|مشروع|مبادرة|خطوات|جدول|رتب|صمم|أنشئ|build|implement|project|initiative|roadmap|schedule/i;

export function classifyAssistantRequest(
  message: string,
  requestedRole: string,
): OrchestrationDecision {
  const text = message.trim();
  const isSensitive = SENSITIVE_ACTION_PATTERN.test(text);
  const isResearch = RESEARCH_PATTERN.test(text);
  const isLearning = LEARNING_PATTERN.test(text);
  const isHumanitarian = HUMANITARIAN_PATTERN.test(text);
  const isPlanning = PLANNING_PATTERN.test(text);

  let mode: TaskMode = "answer";
  if (isSensitive) mode = "sensitive_action";
  else if (isLearning) mode = "learn";
  else if (isResearch) mode = "research";
  else if (isHumanitarian) mode = "humanitarian_support";
  else if (isPlanning) mode = "plan";

  const specialist: AssistantRole =
    mode === "learn" ? "education"
      : mode === "research" ? "research"
      : mode === "humanitarian_support" ? "humanitarian"
      : mode === "sensitive_action" ? "review"
      : (["coordinator", "education", "humanitarian", "research", "review"] as const).includes(
          requestedRole as AssistantRole,
        )
        ? requestedRole as AssistantRole
        : "coordinator";

  const workflow =
    mode === "plan"
      ? ["حدد النتيجة المطلوبة والقيود", "قسّم العمل إلى خطوات قابلة للتحقق", "رتّب الخطوات حسب الأولوية والاعتماديات", "اذكر ما يمكن تنفيذه الآن وما يحتاج أداة أو إذنًا", "قدّم معيارًا واضحًا للتحقق من الإنجاز"]
      : mode === "learn"
      ? ["قدّر مستوى المتعلم من السياق دون افتراضات", "اشرح مفهومًا واحدًا بوضوح", "قدّم تدريبًا عمليًا مناسبًا", "تحقق من الفهم وصحح الأخطاء بلطف"]
      : mode === "research"
      ? ["حدد السؤال بدقة", "افصل الحقائق عن الاستنتاجات", "اطلب أو استخدم مصادر قابلة للتحقق عند توفر البحث", "اذكر حدود المعرفة وتاريخ المعلومات عند الحاجة"]
      : mode === "humanitarian_support"
      ? ["افهم الاحتياج دون طلب بيانات شخصية غير لازمة", "اقترح خيارات واقعية تحفظ الكرامة", "لا تخترع جهات أو فرصًا أو مساعدات", "وضح شروط التحقق والخطوة التالية"]
      : mode === "sensitive_action"
      ? ["توقف قبل أي إجراء خارجي أو دائم", "اشرح الأثر والمخاطر بوضوح", "اطلب موافقة صريحة ومحددة قبل التنفيذ", "لا تدّع تنفيذ الإجراء"]
      : ["افهم السؤال والسياق", "أجب مباشرة وبوضوح", "تحقق من الاتساق وعدم اختلاق معلومات"];

  return {
    mode,
    risk: isSensitive ? "high" : isHumanitarian || isResearch ? "medium" : "low",
    specialist,
    requiresHumanApproval: isSensitive,
    workflow,
  };
}

export function buildOrchestrationContext(
  message: string,
  requestedRole: string,
): { decision: OrchestrationDecision; prompt: string } {
  const decision = classifyAssistantRequest(message, requestedRole);
  const taskPlan = buildAutonomousTaskPlan(message);
  const approvalRule = decision.requiresHumanApproval
    ? "تنبيه أمان: الطلب قد يتضمن إجراءً حساسًا. لا تنفذ أي إجراء خارجي أو دائم. اشرح المطلوب ومخاطره واطلب موافقة صريحة ومحددة أولًا."
    : "حدود التنفيذ: لا تدّع استخدام أداة أو تنفيذ إجراء خارجي. إذا لم تتوفر أداة فعلية، قدّم خطة أو إرشادات فقط.";

  const prompt = [
    "طبقة تنسيق المهام في HUMANITY ONE:",
    buildDeepReasoningInstructions(),
    "خطة الوكيل المستقل:",
    `الهدف: ${taskPlan.goal}`,
    ...taskPlan.steps.map((step, index) => `${index + 1}. ${step}`),
    taskPlan.executionBoundary,
    `نوع المهمة: ${decision.mode}`,
    `الدور المتخصص: ${decision.specialist}`,
    `مستوى المخاطر: ${decision.risk}`,
    "سير العمل:",
    ...decision.workflow.map((step, index) => `${index + 1}. ${step}`),
    approvalRule,
    "راجع الرد قبل إرساله: هل أجبت عن الهدف؟ هل اخترعت معلومة؟ هل ادعيت تنفيذ شيء لم يحدث؟",
  ].join("\n");

  return { decision, prompt };
}
