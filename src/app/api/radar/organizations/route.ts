import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { getOrganizationSession } from "@/lib/organization-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const admin = await getAdminSession();
  const isAdmin = Boolean(admin && (admin.role === "SUPER_ADMIN" || admin.role === "ADMIN"));
  const organization = isAdmin ? null : await getOrganizationSession();

  if (!isAdmin && !organization) {
    return NextResponse.json({ error: "يلزم تسجيل الدخول" }, { status: 401, headers: { "Cache-Control": "private, no-store, max-age=0" } });
  }
  if (organization && !organization.permissions.includes("*") && !organization.permissions.includes("VIEW_DATA")) return NextResponse.json({ error: "لا تملك صلاحية عرض دليل المنظمات." }, { status: 403 });

  const organizations = await prisma.organization.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
    take: 500,
  });

  return NextResponse.json(
    { organizations },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } }
  );
}
