import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export const ORGANIZATION_COOKIE = "humanity_organization_session";
export type OrganizationSession = {
  id: string; name: string; email: string; status: string;
  organizationId: string; actorType: "OWNER" | "MEMBER"; memberId: string | null;
  memberRole: string; permissions: string[];
};

export async function getOrganizationSession(): Promise<OrganizationSession | null> {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  const token = cookies().get(ORGANIZATION_COOKIE)?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, secret) as { sub?: string; type?: string; memberId?: string };
    if (!payload.sub) return null;
    if (payload.type === "organization-member") {
      if (!payload.memberId) return null;
      const member = await prisma.organizationMember.findUnique({
        where: { id: payload.memberId },
        include: { organization: { select: { id: true, name: true, email: true, status: true } } },
      });
      if (!member || member.organizationId !== payload.sub || member.status !== "ACTIVE" || member.organization.status !== "ACTIVE") return null;
      return { ...member.organization, organizationId: member.organizationId, actorType: "MEMBER", memberId: member.id, memberRole: member.role, permissions: member.permissions };
    }
    if (payload.type !== "organization") return null;
    const organization = await prisma.organization.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, status: true },
    });
    if (!organization || organization.status !== "ACTIVE") return null;
    return { ...organization, organizationId: organization.id, actorType: "OWNER", memberId: null, memberRole: "OWNER", permissions: ["*"] };
  } catch { return null; }
}

export function createOrganizationToken(organizationId: string, memberId?: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return jwt.sign(memberId ? { type: "organization-member", memberId } : { type: "organization" }, secret, { subject: organizationId, expiresIn: "12h" });
}
