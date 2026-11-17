import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export const ORGANIZATION_COOKIE = "humanity_organization_session";

export async function getOrganizationSession() {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  const cookieStore = await cookies();
  const token = cookieStore.get(ORGANIZATION_COOKIE)?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, secret) as { sub?: string };
    if (!payload.sub) return null;
    const organization = await prisma.organization.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, status: true },
    });
    if (!organization || organization.status !== "ACTIVE") return null;
    return organization;
  } catch {
    return null;
  }
}

export function createOrganizationToken(organizationId: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return jwt.sign({ type: "organization" }, secret, { subject: organizationId, expiresIn: "12h" });
}
