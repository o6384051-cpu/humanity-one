import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getBeneficiarySession } from "@/lib/beneficiary-auth";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const privateHeaders = { "Cache-Control": "no-store, private" };

export async function GET() {
  const user = await getBeneficiarySession();
  if (!user) return NextResponse.json({ error: "سجّل الدخول أولًا." }, { status: 401, headers: privateHeaders });
  try {
    const [notifications, unreadCount] = await Promise.all([
      prisma.beneficiaryNotification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { id: true, requestId: true, type: true, title: true, message: true, readAt: true, createdAt: true },
      }),
      prisma.beneficiaryNotification.count({ where: { userId: user.id, readAt: null } }),
    ]);
    return NextResponse.json({ notifications, unreadCount }, { headers: privateHeaders });
  } catch {
    return NextResponse.json({ error: "تعذر تحميل الإشعارات." }, { status: 503, headers: privateHeaders });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getBeneficiarySession();
  if (!user) return NextResponse.json({ error: "سجّل الدخول أولًا." }, { status: 401, headers: privateHeaders });

  const limit = await rateLimit(req, "beneficiary-notifications-read:" + user.id, 60, 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter, limit.unavailable);

  const parsed = z.object({
    id: z.string().min(1).max(128).optional(),
    all: z.boolean().optional(),
  }).refine((value) => Boolean(value.id) !== Boolean(value.all), "حدد إشعارًا واحدًا أو الكل")
    .safeParse(await req.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "طلب غير صالح." }, { status: 400, headers: privateHeaders });
  }

  try {
    const where = parsed.data.all
      ? { userId: user.id, readAt: null }
      : { id: parsed.data.id!, userId: user.id, readAt: null };
    const result = await prisma.beneficiaryNotification.updateMany({
      where,
      data: { readAt: new Date() },
    });
    return NextResponse.json({ ok: true, updated: result.count }, { headers: privateHeaders });
  } catch {
    return NextResponse.json({ error: "تعذر تحديث الإشعار." }, { status: 503, headers: privateHeaders });
  }
}
