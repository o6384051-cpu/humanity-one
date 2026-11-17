import { retrieveInstitutionalMemory } from "@/lib/ai/memory";
import type { OrchestrationDecision } from "@/lib/ai/orchestration";

export type AgentStep = {
  id: string;
  title: string;
  status: "completed" | "in_progress" | "blocked";
  detail: string;
};

export type AgentRun = {
  goal: string;
  decision: OrchestrationDecision;
  steps: AgentStep[];
  context: string;
};

/**
 * Bounded agent runner. Knowledge retrieval is read-only.
 * External writes, publishing, messaging and financial actions have no adapter.
 */
export async function prepareAgentRun(goal: string, decision: OrchestrationDecision): Promise<AgentRun> {
  const steps: AgentStep[] = [
    { id: "understand", title: "فهم الهدف والقيود", status: "completed", detail: "تم تصنيف الطلب وتحديد مستوى المخاطر." },
    { id: "plan", title: "تقسيم الهدف إلى مهام", status: "completed", detail: decision.workflow.join("؛ ") },
    { id: "knowledge", title: "استرجاع المعرفة المؤسسية", status: "in_progress", detail: "جارٍ البحث في السجلات المعرفية الموثقة." },
    { id: "execute", title: "تنفيذ الأدوات المسموح بها", status: "blocked", detail: "لا توجد أداة تنفيذ خارجية موثقة ومصرح بها لهذا الطلب." },
    { id: "review", title: "مراجعة النتيجة وتحديد المتبقي", status: "in_progress", detail: "ستتم مراجعة النتيجة قبل الرد." },
  ];
  const records = await retrieveInstitutionalMemory(goal);
  steps[2] = {
    ...steps[2],
    status: "completed",
    detail: records.length ? `تم العثور على ${records.length} سجل معرفي موثق.` : "لم يُعثر على سجلات مؤسسية مطابقة؛ لم يتم اختلاق ذاكرة.",
  };
  return {
    goal,
    decision,
    steps,
    context: records.map((item) =>
      `[${item.category}] ${item.title} | ${item.source || "مصدر غير محدد"} | ${item.createdAt.toISOString().slice(0, 10)}\n${item.content.slice(0, 1200)}`
    ).join("\n\n") || "لا توجد سجلات معرفية مؤسسية مطابقة.",
  };
}
