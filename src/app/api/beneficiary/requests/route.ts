import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getBeneficiarySession } from "@/lib/beneficiary-auth";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  category: z.enum(["FOOD", "HOUSING", "HEALTH", "EDUCATION", "EMPLOYMENT", "DEBT", "OTHER"]),
  urgency: z.enum(["NORMAL", "URGENT"]).default("NORMAL"),
  description: z.string().trim().min(30).max(2500),
  city: z.string().trim().min(2).max(80),
  consent: z.literal(true),
});

export async function GET() {
  const user = await getBeneficiarySession();
  if (!user) return NextResponse.json({ error: "سجّل الدخول أولًا." }, { status: 401 });

  try {
    const requests = await prisma.assistanceRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true, category: true, urgency: true, description: true, city: true, status: true,
        adminNote: true, reviewedAt: true, createdAt: true,
        reviewEvents: {
          select: { id: true, fromStatus: true, toStatus: true, createdAt: true },
          orderBy: { createdAt: "asc" },
        },
        files: {
          select: { id: true, originalName: true, mimeType: true, size: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    return NextResponse.json({ requests }, { headers: { "Cache-Control": "no-store, private" } });
  } catch {
    return NextResponse.json({ error: "تعذر تحميل الطلبات." }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getBeneficiarySession();
  if (!user) return NextResponse.json({ error: "سجّل الدخول أولًا." }, { status: 401 });

  const limit = await rateLimit(req, "beneficiary-request:" + user.id, 4, 86400000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({
        error: "أكمل نوع المساعدة والمدينة ووصفًا لا يقل عن 30 حرفًا ووافق على معالجة البيانات.",
      }, { status: 400 });
    }

    const { consent: _consent, ...data } = parsed.data;
    const request = await prisma.$transaction(async (tx) => {
      const created = await tx.assistanceRequest.create({
        data: { userId: user.id, ...data },
        select: { id: true, category: true, urgency: true, city: true, status: true, createdAt: true },
      });
      await tx.assistanceReviewEvent.create({
        data: { requestId: created.id, toStatus: created.status, note: "تم استلام الطلب." },
      });
      await tx.beneficiaryNotification.create({
        data: {
          userId: user.id,
          requestId: created.id,
          type: "REQUEST_RECEIVED",
          title: "تم استلام طلبك",
          message: "وصل طلبك بنجاح إلى HUMANITY ONE، وسيظهر أي تحديث جديد هنا داخل حسابك.",
        },
      });
      return created;
    });

    return NextResponse.json({
      request,
      message: "استلمنا طلبك. الاستلام لا يعني الموافقة أو ضمان توافر المساعدة.",
    }, { status: 201, headers: { "Cache-Control": "no-store, private" } });
  } catch {
    return NextResponse.json({ error: "تعذر إرسال الطلب." }, { status: 503 });
  }
}
