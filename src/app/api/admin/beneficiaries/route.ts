import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin || !["SUPER_ADMIN", "ADMIN", "MODERATOR"].includes(admin.role)) {
    return NextResponse.json({ error: "غير مصرح." }, { status: 403 });
  }
  const q = (req.nextUrl.searchParams.get("q") || "").trim().slice(0, 100);
  try {
    const users = await prisma.user.findMany({
      where: {
        role: "USER",
        ...(q ? { OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { beneficiaryProfile: { is: { phone: { contains: q } } } },
          { beneficiaryProfile: { is: { city: { contains: q, mode: "insensitive" } } } },
        ] } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true, name: true, email: true, createdAt: true,
        beneficiaryProfile: { select: { phone: true, city: true, area: true, employmentStatus: true, educationLevel: true } },
        _count: { select: { assistanceRequests: true } },
      },
    });
    return NextResponse.json({ users }, { headers: { "Cache-Control": "no-store, private" } });
  } catch {
    return NextResponse.json({ error: "تعذر تحميل حسابات المستفيدين." }, { status: 503 });
  }
}
