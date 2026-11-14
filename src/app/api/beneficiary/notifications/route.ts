import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getBeneficiarySession } from "@/lib/beneficiary-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getBeneficiarySession();
  if (!user) return NextResponse.json({ error: "سجّل الدخول أولًا." }, { status: 401 });
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
    return NextResponse.json({ notifications, unreadCount }, { headers: { "Cache-Control": "no-store, private" } });
  } catch {
    return NextResponse.json({ error: "تعذر تحميل الإشعارات." }, { status: 503 });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getBeneficiarySession();
  if (!user) return NextResponse.json({ error: "سجّل الدخول أولًا." }, { status: 401 });
  const parsed = z.object({ id: z.string().min(1).optional(), all: z.boolean().optional() }).refine(v => Boolean(v.id) !== Boolean(v.all), "حدد إشعارًا واحدًا أو الكل").safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "طلب غير صالح." }, { status: 400 });
  try {
    const where = parsed.data.all ? { userId: user.id, readAt: null } : { id: parsed.data.id!, userId: user.id };
    const result = await prisma.beneficiaryNotification.updateMany({ where, data: { readAt: new Date() } });
    return NextResponse.json({ ok: true, updated: result.count });
  } catch {
    return NextResponse.json({ error: "تعذر تحديث الإشعار." }, { status: 503 });
  }
}
