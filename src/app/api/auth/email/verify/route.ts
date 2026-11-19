import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { consumeEmailVerificationCode } from "@/lib/email-verification";
import { ADMIN_COOKIE, createAdminToken } from "@/lib/admin-auth";
import { BENEFICIARY_COOKIE, createBeneficiaryToken } from "@/lib/beneficiary-auth";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const limit = await rateLimit(req, "email-verification-confirm", 8, 15 * 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter, limit.unavailable);
  const parsed = z.object({ email: z.string().trim().email().max(160), code: z.string().regex(/^\d{6}$/) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success || !process.env.JWT_SECRET) return NextResponse.json({ error: "أدخل البريد ورمز التأكيد المكوّن من 6 أرقام." }, { status: 400 });
  try {
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
    if (!user || !(await consumeEmailVerificationCode(user.id, parsed.data.code))) {
      return NextResponse.json({ error: "رمز التأكيد غير صحيح أو منتهي الصلاحية." }, { status: 400 });
    }
    const response = NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } }, { headers: { "Cache-Control": "no-store" } });
    if (["SUPER_ADMIN", "ADMIN", "MODERATOR"].includes(user.role)) {
      response.cookies.set(ADMIN_COOKIE, createAdminToken(user.id, user.role as "SUPER_ADMIN" | "ADMIN" | "MODERATOR"), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 });
    } else {
      response.cookies.set(BENEFICIARY_COOKIE, createBeneficiaryToken(user.id), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 1209600 });
    }
    return response;
  } catch {
    return NextResponse.json({ error: "تعذر تأكيد البريد الآن." }, { status: 503 });
  }
}
