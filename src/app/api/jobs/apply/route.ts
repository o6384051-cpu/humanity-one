import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const applicationSchema = z.object({
  jobId: z.string().min(1).max(100),
  applicantName: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^[+0-9٠-٩\\s()-]{8,22}$/),
  experience: z.string().trim().max(1200).optional().default(""),
  message: z.string().trim().max(1200).optional().default(""),
  website: z.string().optional().default(""),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = applicationSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "راجع البيانات المدخلة." }, { status: 400 });
    }
    const data = parsed.data;
    if (data.website) return NextResponse.json({ ok: true }, { status: 202 });

    const job = await prisma.jobListing.findFirst({
      where: {
        id: data.jobId,
        status: "APPROVED",
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: { id: true },
    });
    if (!job) return NextResponse.json({ error: "هذه الوظيفة غير متاحة للتقديم حاليًا." }, { status: 404 });

    await prisma.jobApplication.create({
      data: {
        jobId: job.id,
        applicantName: data.applicantName,
        phone: data.phone,
        experience: data.experience || null,
        message: data.message || null,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, message: "تم استلام طلبك. لن تُعرض بياناتك الشخصية للعامة." }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "تعذر إرسال طلب التقديم. حاول مرة أخرى لاحقًا." }, { status: 503 });
  }
}
