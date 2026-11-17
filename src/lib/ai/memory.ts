import { prisma } from "@/lib/prisma";

export type InstitutionalMemory = {
  id: string;
  title: string;
  content: string;
  source: string | null;
  category: string;
  createdAt: Date;
};

/** Read-only retrieval of dated institutional records from the existing database table. */
export async function retrieveInstitutionalMemory(query: string): Promise<InstitutionalMemory[]> {
  // Avoid Unicode property escapes so this also compiles under older TS targets.
  const terms = Array.from(new Set(
    query.toLowerCase()
      .split(/\s+/)
      .map((term) => term.replace(/^[.,!?;:()[\]{}"'،؛؟]+|[.,!?;:()[\]{}"'،؛؟]+$/g, ""))
      .filter((term) => term.length >= 3)
      .slice(0, 8),
  ));
  try {
    return await prisma.knowledgeDocument.findMany({
      where: {
        category: { in: ["institutional", "decision", "project", "policy"] },
        ...(terms.length ? { OR: terms.flatMap((term) => [
          { title: { contains: term, mode: "insensitive" as const } },
          { content: { contains: term, mode: "insensitive" as const } },
        ]) } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, title: true, content: true, source: true, category: true, createdAt: true },
    });
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error
      ? String((error as { code?: unknown }).code ?? "UNKNOWN") : "UNKNOWN";
    console.error("[ai-memory] retrieval_unavailable", { code });
    return [];
  }
}

export function formatInstitutionalMemory(items: InstitutionalMemory[]): string {
  if (!items.length) return "لا توجد سجلات معرفية مؤسسية مطابقة في قاعدة المعرفة حاليًا. لا تدّع تذكّر قرار غير موجود.";
  return items.map((item) => [
    `[${item.category}] ${item.title}`,
    `المصدر: ${item.source || "غير محدد"}`,
    `التاريخ: ${item.createdAt.toISOString().slice(0, 10)}`,
    item.content.slice(0, 1800),
  ].join("\n")).join("\n\n---\n\n");
}
