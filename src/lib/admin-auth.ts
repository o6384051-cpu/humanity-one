import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "MODERATOR";
type TokenPayload = { sub: string; role: AdminRole };

const COOKIE_NAME = "humanity_admin_session";

export async function getAdminSession() {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, secret) as TokenPayload;
    if (!payload.sub || !["SUPER_ADMIN", "ADMIN", "MODERATOR"].includes(payload.role)) return null;
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true },
    });
    if (!user || user.role !== payload.role) return null;
    return user;
  } catch {
    return null;
  }
}

export function createAdminToken(userId: string, role: AdminRole) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return jwt.sign({ role }, secret, { subject: userId, expiresIn: "8h" });
}

export const ADMIN_COOKIE = COOKIE_NAME;
