import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authorized() {
  const actor = await getAdminSession();
  return actor && ["SUPER_ADMIN", "ADMIN"].includes(actor.role) ? actor : null;
}

/** Read and maintain the institutional knowledge base. Admin-only. */
export async function GET() {
  const actor = await authorized();
  if (!actor) return NextResponse.json({ error: "غير مصرح. يلزم حساب إداري." }, { status: 403 });
  const entries = await prisma.knowledgeDocument.findMany({
    select: { id: true, title: true, content: true, category: true, source: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ entries }, { headers: { "Cache-Control": "no-store, private" } });
}

export async function POST(req: NextRequest) {
  const actor = await authorized();
  if (!actor) return NextResponse.json({ error: "غير مصرح. يلزم حساب إداري." }, { status: 403 });
  const limit = await rateLimit(req, "admin-ai-memory-write", 20, 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter, limit.unavailable);

  try {
    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 180) : "";
    const content = typeof body.content === "string" ? body.content.trim().slice(0, 12000) : "";
    const category = typeof body.category === "string" ? body.category.trim().slice(0, 80) : "";
    const source = typeof body.source === "string" ? body.source.trim().slice(0, 500) : "";
    const correctionOf = typeof body.correctionOf === "string" ? body.correctionOf.trim() : "";

    if (!title || !content || !category || !source) {
      return NextResponse.json({ error: "العنوان والمحتوى والتصنيف والمصدر حقول مطلوبة." }, { status: 400 });
    }

    let finalTitle = title;
    let finalSource = source;
    if (correctionOf) {
      const previous = await prisma.knowledgeDocument.findUnique({
        where: { id: correctionOf },
        select: { id: true, title: true },
      });
      if (!previous) return NextResponse.json({ error: "السجل المراد تصحيحه غير موجود." }, { status: 404 });
      finalTitle = previous.title;
      finalSource = `تصحيح إداري معتمد للسجل ${previous.id}. المصدر: ${source}`;
    }

    // Corrections are appended as new dated records; the original is never overwritten.
    const entry = await prisma.knowledgeDocument.create({
      data: { title: finalTitle, content, category, source: finalSource },
      select: { id: true, title: true, content: true, category: true, source: true, createdAt: true },
    });
    return NextResponse.json({ ok: true, entry }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "تعذر حفظ سجل المعرفة. تحقق من اتصال قاعدة البيانات." }, { status: 503 });
  }
}
