import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { getOrganizationSession } from "@/lib/organization-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: { id: string } }) {
  const admin = await getAdminSession();
  const isAdmin = Boolean(admin && (admin.role === "SUPER_ADMIN" || admin.role === "ADMIN"));
  const organization = isAdmin ? null : await getOrganizationSession();
  if (!isAdmin && !organization) return NextResponse.json({ error: "يلزم تسجيل الدخول" }, { status: 401, headers: { "Cache-Control": "no-store" } });

  const record = await prisma.humanitarianRecord.findUnique({
    where: { id: context.params.id },
    select: { id: true, organizationId: true },
  });
  if (!record) return NextResponse.json({ error: "السجل غير موجود" }, { status: 404 });
  if (!isAdmin && record.organizationId !== organization!.id) {
    return NextResponse.json({ error: "سجل المراجعة متاح للإدارة والجهة المالكة فقط" }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }

  const events = await prisma.radarAuditEvent.findMany({
    where: { recordId: record.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true, action: true, details: true, createdAt: true,
      actorUser: { select: { id: true, name: true, email: isAdmin } },
      actorOrganization: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json({ events }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
}
