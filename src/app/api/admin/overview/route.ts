import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const actor = await getAdminSession();
  if (!actor || !["SUPER_ADMIN", "ADMIN", "MODERATOR"].includes(actor.role)) {
    return NextResponse.json({ error: "غير مصرح. سجّل الدخول بحساب إداري." }, { status: 403 });
  }

  try {
    const [
      users, administrators, projects, tasks, agents,
      pendingJobs, approvedJobs, rejectedJobs, applications,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: { in: ["SUPER_ADMIN", "ADMIN", "MODERATOR"] } } }),
      prisma.project.count(),
      prisma.task.count(),
      prisma.agent.count(),
      prisma.jobListing.count({ where: { status: "PENDING" } }),
      prisma.jobListing.count({ where: { status: "APPROVED" } }),
      prisma.jobListing.count({ where: { status: "REJECTED" } }),
      prisma.jobApplication.count(),
    ]);

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      actor: { name: actor.name, email: actor.email, role: actor.role },
      stats: {
        users, administrators, projects, tasks, agents,
        jobs: { pending: pendingJobs, approved: approvedJobs, rejected: rejectedJobs },
        applications,
      },
      capabilities: {
        database: "connected",
        aiConfigured: Boolean(process.env.AI_API_KEY || process.env.OPENAI_API_KEY),
        aiModel: process.env.AI_MODEL || (process.env.OPENAI_API_KEY ? "gpt-4o-mini" : null),
        beneficiaryRequests: { available: false, reason: "لا يوجد نموذج أو مسار API معتمد لطلبات المستفيدين في قاعدة البيانات الحالية." },
        auditLog: { available: false, reason: "لا يوجد سجل تدقيق دائم للعمليات في المخطط الحالي." },
      },
    }, { headers: { "Cache-Control": "no-store, private" } });
  } catch {
    return NextResponse.json({ error: "تعذر قراءة مؤشرات قاعدة البيانات. تحقق من اتصال DATABASE_URL وتطبيق migrations." }, { status: 503 });
  }
}
