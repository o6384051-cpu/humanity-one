import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const roles = ["SUPER_ADMIN", "ADMIN", "MODERATOR"];
const statusValues = ["DISCOVERED", "CONTACTED", "RESPONDED", "INTERESTED", "APPLICATION", "VERIFIED", "DECLINED", "NO_RESPONSE", "DO_NOT_CONTACT"] as const;
async function authorized() {
  const admin = await getAdminSession();
  return admin && roles.includes(admin.role) ? admin : null;
}
const createSchema = z.object({
  organizationName: z.string().trim().min(2).max(180),
  country: z.string().trim().min(2).max(100),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  focusArea: z.string().trim().min(2).max(120),
  website: z.string().trim().url().max(500).optional().or(z.literal("")),
  contactName: z.string().trim().max(120).optional().or(z.literal("")),
  contactEmail: z.string().trim().email().max(254).optional().or(z.literal("")),
  sourceUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  notes: z.string().trim().max(4000).optional().or(z.literal("")),
});
export async function GET() {
  if (!(await authorized())) return NextResponse.json({ error: "غير مصرح." }, { status: 403 });
  try {
    const leads = await prisma.organizationLead.findMany({ orderBy: [{ updatedAt: "desc" }], take: 500 });
    return NextResponse.json({ leads }, { headers: { "Cache-Control": "no-store, private" } });
  } catch (error) {
    const e = error as { code?: string };
    console.error("[global-outreach] list failed", { code: e?.code || "UNKNOWN" });
    return NextResponse.json({ error: "تعذر تحميل سجل الاستقطاب." }, { status: 503 });
  }
}
export async function POST(req: NextRequest) {
  if (!(await authorized())) return NextResponse.json({ error: "غير مصرح." }, { status: 403 });
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "راجع بيانات المنظمة وروابطها." }, { status: 400 });
  try {
    const lead = await prisma.organizationLead.create({ data: parsed.data });
    return NextResponse.json({ ok: true, lead }, { status: 201, headers: { "Cache-Control": "no-store, private" } });
  } catch (error) {
    const e = error as { code?: string };
    console.error("[global-outreach] create failed", { code: e?.code || "UNKNOWN" });
    return NextResponse.json({ error: "تعذر حفظ المنظمة." }, { status: 503 });
  }
}
export async function PATCH(req: NextRequest) {
  if (!(await authorized())) return NextResponse.json({ error: "غير مصرح." }, { status: 403 });
  const parsed = z.object({
    id: z.string().min(1),
    status: z.enum(statusValues).optional(),
    notes: z.string().trim().max(4000).optional(),
    contactName: z.string().trim().max(120).optional(),
    contactEmail: z.string().trim().email().max(254).nullable().optional(),
    lastContactAt: z.string().datetime().nullable().optional(),
  }).refine((v) => Object.keys(v).some(k => k !== "id"), { message: "لا توجد تغييرات." }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "بيانات التحديث غير صالحة." }, { status: 400 });
  const { id, lastContactAt, ...fields } = parsed.data;
  try {
    const lead = await prisma.organizationLead.update({
      where: { id },
      data: { ...fields, ...(lastContactAt !== undefined ? { lastContactAt: lastContactAt ? new Date(lastContactAt) : null } : {}) },
    });
    return NextResponse.json({ ok: true, lead }, { headers: { "Cache-Control": "no-store, private" } });
  } catch (error) {
    const e = error as { code?: string };
    if (e?.code === "P2025") return NextResponse.json({ error: "السجل غير موجود." }, { status: 404 });
    console.error("[global-outreach] update failed", { code: e?.code || "UNKNOWN" });
    return NextResponse.json({ error: "تعذر تحديث السجل." }, { status: 503 });
  }
}
