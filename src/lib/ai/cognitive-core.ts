/**
 * HUMANITY ONE cognitive core: bounded reasoning, task planning and council review.
 * The council is a single-model structured review (not four separately billed calls).
 */
export type CouncilSpecialist = "education" | "research" | "programming" | "economics" | "humanitarian";

export const COUNCIL_SPECIALISTS: Record<CouncilSpecialist, string> = {
  education: "راجع قابلية الشرح والتعلم وإمكانية التطبيق العملي.",
  research: "راجع الأدلة والمصادر وحدود اليقين، ولا تقبل ادعاءً بلا سند.",
  programming: "راجع الجدوى التقنية والأمان والاختبارات والاعتماديات.",
  economics: "راجع التكلفة والاستدامة والبدائل المجانية ومخاطر الإنفاق.",
  humanitarian: "راجع الكرامة والإنصاف والخصوصية والأثر الإنساني.",
};

export type DeepReasoningPlan = {
  problem: string;
  assumptions: string[];
  hypotheses: string[];
  options: string[];
  checks: string[];
};

export function buildDeepReasoningInstructions(): string {
  return [
    "نواة التفكير العميق:",
    "حلّل المشكلة داخليًا على مراحل، ولا تعرض سلسلة التفكير الخاصة أو المداولات السرية.",
    "حدّد الهدف والقيود، وافصل الحقائق عن الافتراضات.",
    "كوّن فرضيات معقولة، وقارن البدائل وفق الدقة والجدوى والتكلفة والأمان والأثر.",
    "اختبر التناقضات والحالات الاستثنائية، ثم اعرض خلاصة موجزة وأسبابًا قابلة للتحقق.",
    "إذا كانت البيانات غير كافية، صرّح بعدم اليقين ولا تملأ الفراغ بالتخمين.",
    "الوكيل المستقل: حوّل الهدف إلى مهام صغيرة ذات ترتيب واعتماديات ومعيار إنجاز؛ نفّذ فقط عبر أدوات متاحة ومصرح بها، وتوقف للموافقة قبل الأفعال الحساسة، واذكر ما بقي غير مكتمل.",
    "مجلس الذكاء الاصطناعي: راجع الحل من زوايا الخبراء التالية ضمن الاستدعاء نفسه لتجنب تكاليف عدة استدعاءات:",
    ...Object.entries(COUNCIL_SPECIALISTS).map(([name, instruction]) => `- ${name}: ${instruction}`),
    "ادمج الملاحظات، واذكر الخلاف أو عدم اليقين المهم بدل ادعاء إجماع غير حقيقي.",
  ].join("\n");
}

export function buildAutonomousTaskPlan(goal: string): {
  goal: string;
  steps: string[];
  requiresApproval: boolean;
  executionBoundary: string;
} {
  const sensitive = /إرسال|انشر|نشر|احذف|حذف|ادفع|شراء|تحويل|غيّر الصلاحيات|راسل الجميع|send|publish|delete|pay|purchase|transfer/i.test(goal);
  return {
    goal: goal.trim(),
    steps: [
      "تحديد النتيجة المطلوبة ومعيار نجاحها",
      "تحديد المعلومات والأدوات والصلاحيات اللازمة",
      "تقسيم الهدف إلى مهام مرتبة وقابلة للتحقق",
      "تنفيذ الخطوات المسموح بها فقط وتسجيل حالة كل خطوة",
      "مراجعة النتيجة وتحديد ما لم يكتمل",
    ],
    requiresApproval: sensitive,
    executionBoundary: sensitive
      ? "يلزم إذن صريح قبل أي إجراء حساس أو خارجي."
      : "لا يُعد التخطيط تنفيذًا؛ التنفيذ يتطلب أداة فعلية وصلاحية متاحة.",
  };
}
