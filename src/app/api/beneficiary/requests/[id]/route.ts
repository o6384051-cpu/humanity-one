import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBeneficiarySession } from "@/lib/beneficiary-auth";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } },
) {
  const user = await getBeneficiarySession();
  if (!user) return NextResponse.json({ error: "سجّل الدخول أولًا." }, { status: 401 });

  const limit = await rateLimit(req, "beneficiary-request-cancel:" + user.id, 5, 15 * 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter, limit.unavailable);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.assistanceRequest.findFirst({
        where: { id: context.params.id, userId: user.id },
        select: { id: true, status: true },
      });
      if (!current) return "NOT_FOUND";
      if (current.status !== "PENDING" && current.status !== "IN_REVIEW") return "NOT_CANCELLABLE";

      // Conditional update prevents overwriting a status changed concurrently by a reviewer.
      const updated = await tx.assistanceRequest.updateMany({
        where: { id: current.id, userId: user.id, status: current.status },
        data: { status: "CLOSED", reviewedAt: new Date() },
      });
      if (updated.count !== 1) return "CHANGED";

      await tx.assistanceReviewEvent.create({
        data: {
          requestId: current.id,
          fromStatus: current.status,
          toStatus: "CLOSED",
          note: "تم إلغاء الطلب بواسطة صاحبه.",
        },
      });
      return "OK";
    });

    if (result === "NOT_FOUND") {
      return NextResponse.json({ error: "الطلب غير موجود ضمن حسابك." }, { status: 404 });
    }
    if (result === "NOT_CANCELLABLE") {
      return NextResponse.json({ error: "لا يمكن إلغاء الطلب بعد بدء قرار المراجعة النهائي." }, { status: 409 });
    }
    if (result === "CHANGED") {
      return NextResponse.json({ error: "تغيرت حالة الطلب أثناء العملية. حدّث الصفحة وحاول مجددًا." }, { status: 409 });
    }
    return NextResponse.json({ ok: true, message: "تم إلغاء الطلب وتسجيل ذلك في سجل المتابعة." }, {
      headers: { "Cache-Control": "no-store, private" },
    });
  } catch {
    return NextResponse.json({ error: "تعذر إلغاء الطلب حاليًا." }, { status: 503 });
  }
}
