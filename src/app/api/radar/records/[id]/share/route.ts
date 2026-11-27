import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { getOrganizationSession } from "@/lib/organization-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  sharingMode: z.enum(["PRIVATE", "SHARED", "NETWORK"]),
  organizationIds: z.array(z.string().min(1).max(100)).max(100).default([]),
});

const noStore = { "Cache-Control": "private, no-store, max-age=0" };

export async function POST(request: NextRequest, context: { params: { id: string } }) {
  const admin = await getAdminSession();
  const isAdmin = Boolean(admin && (admin.role === "SUPER_ADMIN" || admin.role === "ADMIN"));
  const organization = isAdmin ? null : await getOrganizationSession();
  if (!isAdmin && !organization) return NextResponse.json({ error: "يلزم تسجيل الدخول" }, { status: 401, headers: noStore });
  if (organization && !organization.permissions.includes("*") && !organization.permissions.includes("MANAGE_RECORDS")) return NextResponse.json({ error: "تعديل مشاركة السجلات يتطلب صلاحية إدارة السجلات." }, { status: 403, headers: noStore });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "إعدادات المشاركة غير صحيحة" }, { status: 400, headers: noStore });
  const { sharingMode, organizationIds } = parsed.data;

  if (sharingMode === "NETWORK" && !isAdmin) {
    return NextResponse.json({ error: "نشر السجل لجميع المنظمات يتطلب اعتماد الإدارة المركزية" }, { status: 403, headers: noStore });
  }
  if (sharingMode === "SHARED" && organizationIds.length === 0) {
    return NextResponse.json({ error: "حدد منظمة واحدة على الأقل للمشاركة المحددة" }, { status: 400, headers: noStore });
  }
  if (organization && organizationIds.includes(organization.id)) {
    return NextResponse.json({ error: "لا حاجة لمشاركة السجل مع المنظمة المالكة" }, { status: 400, headers: noStore });
  }

  const record = await prisma.humanitarianRecord.findUnique({ where: { id: context.params.id }, select: { id: true, organizationId: true, verificationStatus: true } });
  if (!record) return NextResponse.json({ error: "السجل غير موجود" }, { status: 404, headers: noStore });
  if (!isAdmin && record.organizationId !== organization!.id) return NextResponse.json({ error: "لا تملك صلاحية إدارة مشاركة هذا السجل" }, { status: 403, headers: noStore });
  if (sharingMode !== "PRIVATE" && record.verificationStatus !== "VERIFIED") {
    return NextResponse.json({ error: "لا يمكن مشاركة سجل قبل التحقق من مصدره واعتماده" }, { status: 409, headers: noStore });
  }

  if (sharingMode === "SHARED") {
    const activeOrganizations = await prisma.organization.findMany({
      where: { id: { in: organizationIds }, status: "ACTIVE" },
      select: { id: true },
    });
    if (activeOrganizations.length !== new Set(organizationIds).size) {
      return NextResponse.json({ error: "توجد منظمة غير نشطة أو غير معروفة ضمن القائمة" }, { status: 400, headers: noStore });
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.radarRecordShare.deleteMany({ where: { recordId: record.id } });
    if (sharingMode === "SHARED") {
      await tx.radarRecordShare.createMany({
        data: organizationIds.map((organizationId) => ({
          recordId: record.id,
          organizationId,
          createdByOrganizationId: record.organizationId,
          permission: "VIEW",
        })),
      });
    }
    await tx.humanitarianRecord.update({ where: { id: record.id }, data: { sharingMode } });
    await tx.radarAuditEvent.create({
      data: {
        recordId: record.id,
        action: "SHARING_UPDATED",
        actorUserId: admin?.id ?? null,
        actorOrganizationId: organization?.id ?? null,
        details: { sharingMode, organizationIds: sharingMode === "SHARED" ? organizationIds : [] },
      },
    });
  });

  return NextResponse.json({ success: true, sharingMode, sharedWithCount: sharingMode === "SHARED" ? organizationIds.length : 0 }, { headers: noStore });
}
