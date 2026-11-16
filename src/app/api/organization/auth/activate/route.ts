import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createHash } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
const schema = z.object({ token: z.string().min(32).max(256), password: z.string().min(12).max(200) });
export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "الرابط أو كلمة المرور غير صالحين. استخدم كلمة مرور من 12 حرفًا على الأقل." }, { status: 400 });
  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
  const organization = await prisma.organization.findFirst({
    where: { activationTokenHash: tokenHash, activationExpiresAt: { gt: new Date() }, status: "ACTIVE" },
    select: { id: true },
  });
  if (!organization) return NextResponse.json({ error: "رابط التفعيل غير صالح أو انتهت صلاحيته." }, { status: 400 });
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.organization.update({
    where: { id: organization.id },
    data: { passwordHash, activationTokenHash: null, activationExpiresAt: null },
  });
  return NextResponse.json({ ok: true, message: "تم تفعيل حساب المنظمة. يمكنك تسجيل الدخول الآن." });
}
