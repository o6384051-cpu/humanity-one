import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { getOrganizationSession } from "@/lib/organization-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const recordSchema = z.object({
  type: z.enum(["NEED", "RESOURCE", "INITIATIVE"]),
  title: z.string().trim().min(4).max(180),
  description: z.string().trim().min(10).max(4000),
  country: z.string().trim().min(2).max(100),
  city: z.string().trim().max(100).optional().nullable(),
  area: z.string().trim().max(120).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  locationPrecision: z.enum(["CITY", "REGION", "APPROXIMATE"]).default("APPROXIMATE"),
  sourceName: z.string().trim().min(2).max(180),
  sourceUrl: z.string().url().max(1000).refine((value) => {\n    try { const protocol = new URL(value).protocol; return protocol === "https:" || protocol === "http:"; } catch { return false; }\n  }, "يجب أن يبدأ رابط المصدر بـ http أو https").optional().nullable(),
  sourceReference: z.string().trim().max(240).optional().nullable(),
  observedAt: z.string().datetime(),
}).refine((v) => (v.latitude == null) === (v.longitude == null), {
  message: "يجب إدخال خط العرض والطول معًا",
  path: ["latitude"],
});

const noStore = { "Cache-Control": "private, no-store, max-age=0" };

export async function GET() {
  const admin = await getAdminSession();
  const isCentralAdmin = Boolean(admin && (admin.role === "SUPER_ADMIN" || admin.role === "ADMIN"));
  const organization = isCentralAdmin ? null : await getOrganizationSession();

  if (!isCentralAdmin && !organization) {
    return NextResponse.json({ error: "يلزم تسجيل الدخول" }, { status: 401, headers: noStore });
  }

  const where = isCentralAdmin
    ? { status: "ACTIVE" }
    : {
        status: "ACTIVE",
        OR: [
          { organizationId: organization!.id },
          { verificationStatus: "VERIFIED", sharingMode: "NETWORK" },
          { verificationStatus: "VERIFIED", sharingMode: "SHARED", shares: { some: { organizationId: organization!.id, permission: "VIEW" } } },
        ],
      };

  const records = await prisma.humanitarianRecord.findMany({
    where,
    orderBy: [{ observedAt: "desc" }, { createdAt: "desc" }],
    take: 250,
    select: {
      id: true, organizationId: true, type: true, title: true, description: true,
      country: true, city: true, area: true, latitude: isCentralAdmin, longitude: isCentralAdmin,
      locationPrecision: true, sourceName: true, sourceUrl: true, sourceReference: true,
      observedAt: true, verificationStatus: true, verifiedAt: true, verificationNote: true,
      sharingMode: true, createdAt: true, updatedAt: true,
      organization: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ records, count: records.length, access: isCentralAdmin ? "CENTRAL_ADMIN" : "ORGANIZATION" }, { headers: noStore });
}

export async function POST(request: NextRequest) {
  const organization = await getOrganizationSession();
  if (!organization) {
    return NextResponse.json({ error: "تسجيل دخول منظمة نشطة مطلوب لإضافة سجل" }, { status: 401, headers: noStore });
  }

  const body = recordSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "راجع الحقول المطلوبة ومصدر البيانات وتاريخ الرصد", details: body.error.flatten() }, { status: 400, headers: noStore });
  }

  const input = body.data;
  const record = await prisma.humanitarianRecord.create({
    data: {
      organizationId: organization.id,
      type: input.type,
      title: input.title,
      description: input.description,
      country: input.country,
      city: input.city || null,
      area: input.area || null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      locationPrecision: input.locationPrecision,
      sourceName: input.sourceName,
      sourceUrl: input.sourceUrl || null,
      sourceReference: input.sourceReference || null,
      observedAt: new Date(input.observedAt),
      verificationStatus: "PENDING",
      sharingMode: "PRIVATE",
      auditEvents: { create: {
        action: "RECORD_CREATED",
        actorOrganizationId: organization.id,
        details: { sourceName: input.sourceName, observedAt: input.observedAt, initialVerificationStatus: "PENDING" },
      } },
    },
    select: { id: true, title: true, type: true, verificationStatus: true, sharingMode: true, createdAt: true },
  });

  return NextResponse.json({ record, message: "تم حفظ السجل باسم منظمتكم، وهو خاص وبانتظار التحقق قبل مشاركته." }, { status: 201, headers: noStore });
}
