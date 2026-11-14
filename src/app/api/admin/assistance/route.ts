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
        select: { status: true, adminNote: true, userId: true },
      });
      if (!current) return "missing" as const;

      const nextNote = parsed.data.adminNote === undefined
        ? current.adminNote
        : parsed.data.adminNote || null;
      const statusChanged = current.status !== parsed.data.status;
      const noteChanged = current.adminNote !== nextNote;

      // Repeated clicks with identical values must not create duplicate audit entries.
      if (!statusChanged && !noteChanged) return "unchanged" as const;

      // Compare-and-set prevents two reviewers from silently overwriting each other.
      const updated = await tx.assistanceRequest.updateMany({
        where: {
          id: parsed.data.id,
          status: current.status,
          adminNote: current.adminNote,
        },
        data: {
          status: parsed.data.status,
          adminNote: nextNote,
          reviewedAt: new Date(),
        },
      });
      if (updated.count !== 1) return "conflict" as const;

      await tx.assistanceReviewEvent.create({
        data: {
          requestId: parsed.data.id,
          adminUserId: admin.id,
          fromStatus: current.status,
          toStatus: parsed.data.status,
          note: noteChanged ? nextNote : null,
        },
      });

      const statusLabels: Record<string, string> = {
        PENDING: "قيد المراجعة", IN_REVIEW: "تحت الدراسة",
        APPROVED: "تمت الموافقة", REJECTED: "لم تتم الموافقة", CLOSED: "مغلق",
      };
      const messageParts: string[] = [];
      if (statusChanged) {
        messageParts.push(`حالة طلبك الآن: ${statusLabels[parsed.data.status] || parsed.data.status}.`);
      }
      if (noteChanged) {
        messageParts.push(nextNote
          ? "أضاف فريق المراجعة ملاحظة جديدة على طلبك."
          : "حدّث فريق المراجعة الملاحظة المرتبطة بطلبك.");
      }

      await tx.beneficiaryNotification.create({
        data: {
          userId: current.userId,
          requestId: parsed.data.id,
          type: statusChanged ? "STATUS_CHANGED" : "ADMIN_REPLY",
          title: statusChanged ? "تم تحديث حالة طلبك" : "تم تحديث ملاحظة طلبك",
          message: messageParts.join(" "),
        },
      });

      return "updated" as const;
    });

    if (result === "missing") {
      return NextResponse.json({ error: "الطلب غير موجود." }, { status: 404 });
    }
    if (result === "conflict") {
      return NextResponse.json({ error: "تم تحديث الطلب بواسطة مراجع آخر. حدّث القائمة ثم أعد المحاولة." }, { status: 409 });
    }
    return NextResponse.json({ ok: true, unchanged: result === "unchanged" });
  } catch {
    return NextResponse.json({ error: "تعذر تحديث الطلب أو تسجيل المراجعة." }, { status: 503 });
  }
}
