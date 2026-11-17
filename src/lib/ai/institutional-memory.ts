import { prisma } from "@/lib/prisma";

/**
 * Institutional long-term memory backed by the existing KnowledgeDocument table.
 * Each entry carries a category, source and creation timestamp. This module is
 * read-only by design: corrections and publication require a separately
 * authorized management workflow.
 */
export type InstitutionalMemoryEntry = {
  title: string;
  content: string;
  category: string;
  source: string | null;
  createdAt: Date;
};

export async function retrieveInstitutionalMemory(query: string): Promise<InstitutionalMemoryEntry[]> {
  const terms = query.trim().split(/\s+/).filter((term) => term.length >= 3).slice(0, 6);
  if (!terms.length) return [];
  try {
    const entries = await prisma.knowledgeDocument.findMany({
      where: {
        OR: terms.flatMap((term) => [
          { title: { contains: term, mode: "insensitive" as const } },
          { content: { contains: term, mode: "insensitive" as const } },
          { category: { contains: term, mode: "insensitive" as const } },
        ]),
      },
      select: { title: true, content: true, category: true, source: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    return entries;
  } catch (error) {
    const name = error instanceof Error ? error.name : "UnknownError";
    console.error("[ai-memory] retrieval_unavailable", { name });
    return [];
  }
}

export function formatInstitutionalMemory(entries: InstitutionalMemoryEntry[]): string {
  if (!entries.length) return "لا توجد حاليًا سجلات مؤسسية مطابقة في قاعدة المعرفة؛ لا تخترع معلومات لسد النقص.";
  return [
    "سجلات الذاكرة المؤسسية المسترجعة (تعامل معها كمراجع داخلية، وانتبه للمصدر والتاريخ):",
    ...entries.map((entry, index) =>
      `${index + 1}. ${entry.title} | التصنيف: ${entry.category} | المصدر: ${entry.source || "غير محدد"} | التاريخ: ${entry.createdAt.toISOString()}\n${entry.content.slice(0, 1800)}`
    ),
    "إذا تعارضت السجلات أو غاب مصدر موثوق، وضّح ذلك ولا تفترض أن الأحدث صحيح تلقائيًا.",
  ].join("\n\n");
}
