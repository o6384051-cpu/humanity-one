import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedRoles = ["SUPER_ADMIN", "ADMIN", "MODERATOR"];

export async function GET() {
  const admin = await getAdminSession();
  if (!admin || !allowedRoles.includes(admin.role)) {
    return NextResponse.json({ error: "غير مصرح." }, { status: 403 });
  }

  try {
    const requests = await prisma.assistanceRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true, category: true, urgency: true, description: true, city: true,
        status: true, adminNote: true, createdAt: true,
        files: {
          select: { id: true, originalName: true, mimeType: true, size: true, createdAt: true },
          orderBy: { createdAt: "asc" },
        },
        reviewEvents: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true, fromStatus: true, toStatus: true, note: true, createdAt: true,
            admin: { select: { name: true } },
          },
        },
        user: {
          select: {
            name: true, email: true,
            beneficiaryProfile: { select: { phone: true, area: true } },
          },
        },
      },
    });
    return NextResponse.json({ requests }, { headers: { "Cache-Control": "no-store, private" } });
  } catch {
    return NextResponse.json({ error: "تعذر تحميل الطلبات." }, { status: 503 });
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin || !allowedRoles.includes(admin.role)) {
    return NextResponse.json({ error: "غير مصرح." }, { status: 403 });
  }

  try {
    const parsed = z.object({
      id: z.string().min(1),
      status: z.enum(["IN_REVIEW", "APPROVED", "REJECTED", "CLOSED"]),
      adminNote: z.string().trim().max(1500).optional(),
    }).safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json({ error: "بيانات غير صالحة." }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.assistanceRequest.findUnique({
        where: { id: parsed.data.id },
        select: { status: true, adminNote: true },
      });
      if (!current) return false;

      const nextNote = parsed.data.adminNote === undefined
        ? current.adminNote
        : parsed.data.adminNote || null;

      await tx.assistanceRequest.update({
        where: { id: parsed.data.id },
        data: { status: parsed.data.status, adminNote: nextNote, reviewedAt: new Date() },
      });

      await tx.assistanceReviewEvent.create({
        data: {
          requestId: parsed.data.id,
          adminUserId: admin.id,
          fromStatus: current.status,
          toStatus: parsed.data.status,
          note: nextNote,
        },
      });

      const statusChanged = current.status !== parsed.data.status;
      const noteChanged = current.adminNote !== nextNote && Boolean(nextNote);
      if (statusChanged || noteChanged) {
        const statusLabels: Record<string, string> = {
          PENDING: "قيد المراجعة", IN_REVIEW: "تحت الدراسة",
          APPROVED: "تمت الموافقة", REJECTED: "لم تتم الموافقة", CLOSED: "مغلق",
        };
        await tx.beneficiaryNotification.create({
          data: {
            userId: (await tx.assistanceRequest.findUniqueOrThrow({ where: { id: parsed.data.id }, select: { userId: true } })).userId,
            requestId: parsed.data.id,
            type: statusChanged ? "STATUS_CHANGED" : "ADMIN_REPLY",
            title: statusChanged ? "تم تحديث حالة طلبك" : "لديك رد جديد من فريق المراجعة",
            message: statusChanged
              ? `حالة طلبك الآن: ${statusLabels[parsed.data.status] || parsed.data.status}.`
              : "أضاف فريق المراجعة ردًا على طلبك. افتح طلبك للاطلاع على التفاصيل.",
          },
        });
      }
      return true;
    });

    if (!result) return NextResponse.json({ error: "الطلب غير موجود." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "تعذر تحديث الطلب أو تسجيل المراجعة." }, { status: 503 });
  }
}
