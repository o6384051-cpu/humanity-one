import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getOrganizationSession } from "@/lib/organization-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const admin = await getAdminSession();

  if (admin && (admin.role === "SUPER_ADMIN" || admin.role === "ADMIN")) {
    return NextResponse.json(
      { authenticated: true, view: "central-admin", role: admin.role, organizationId: null, records: [], dataConnected: false },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } }
    );
  }

  if (admin?.role === "MODERATOR") {
    return NextResponse.json(
      { authenticated: true, view: "schematic", role: "MODERATOR", organizationId: null, records: [], dataConnected: false },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } }
    );
  }

  const organization = await getOrganizationSession();
  if (organization) {
    return NextResponse.json(
      { authenticated: true, view: "organization", role: "ORGANIZATION", organizationId: organization.id, records: [], dataConnected: false },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } }
    );
  }

  return NextResponse.json(
    { authenticated: false, view: "schematic", role: "GUEST", organizationId: null, records: [], dataConnected: false },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } }
  );
}
