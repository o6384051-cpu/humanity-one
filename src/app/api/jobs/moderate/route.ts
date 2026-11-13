import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const actor = await getAdminSession();
  if (!actor || !["SUPER_ADMIN", "ADMIN", "MODERATOR"].includes(actor.role)) return NextResponse.json({ error: "غير مصرح." }, { status: 403 });
  try {
    const jobs = await prisma.jobListing.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      take: 100,
    });
    return NextResponse.json({ jobs });
  } catch {
    return NextResponse.json({ error: "تعذر تحميل الإعلانات." }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "غير مصرح." }, { status: 401 });
  try {
    const body = await req.json();
    if (typeof body.id !== "string" || !["APPROVED", "REJECTED"].includes(body.status)) {
      return NextResponse.json({ error: "طلب مراجعة غير صالح." }, { status: 400 });
    }
    const result = await prisma.jobListing.updateMany({
      where: { id: body.id, status: "PENDING" },
      data: { status: body.status },
    });
    if (!result.count) return NextResponse.json({ error: "الإعلان غير موجود أو تمت مراجعته." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "تعذر تحديث حالة الإعلان." }, { status: 503 });
  }
}
