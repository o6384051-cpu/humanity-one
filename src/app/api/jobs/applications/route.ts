import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Applicant contact details are never returned by public job endpoints.
// This endpoint is restricted to the platform's moderation team.
export async function GET(req: NextRequest) {
  const actor = await getAdminSession();
  if (!actor || !["SUPER_ADMIN", "ADMIN", "MODERATOR"].includes(actor.role)) {
    return NextResponse.json({ error: "غير مصرح." }, { status: 401 },);
  }

  try {
    const jobId = req.nextUrl.searchParams.get("jobId");
    const applications = await prisma.jobApplication.findMany({
      where: jobId ? { jobId } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        jobId: true,
        applicantName: true,
        phone: true,
        experience: true,
        message: true,
        createdAt: true,
        job: {
          select: {
            jobTitle: true,
            businessName: true,
            city: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json(
      { applications },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return NextResponse.json({ error: "تعذر تحميل طلبات التقديم." }, { status: 503 });
  }
}
