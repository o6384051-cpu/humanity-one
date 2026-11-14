import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { timingSafeEqual } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const privateHeaders = { "Cache-Control": "no-store, private" };
const bootstrapSchema = z.object({
  setupSecret: z.string().min(1).max(512),
  email: z.string().trim().email().max(254),
  password: z.string().min(12).max(200),
  name: z.string().trim().min(2).max(80).optional(),
});

// One-time founder setup. The database lock makes the check-and-create operation atomic.
export async function POST(req: NextRequest) {
  const limit = await rateLimit(req, "founder-bootstrap", 5, 60 * 60_000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter, limit.unavailable);

  const setupSecret = process.env.FOUNDER_SETUP_SECRET;
  if (!setupSecret || !process.env.JWT_SECRET) {
    return NextResponse.json({ error: "إعداد تأسيس حساب المؤسس غير مكتمل في الاستضافة." }, { status: 503, headers: privateHeaders });
  }

  const parsed = bootstrapSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "أدخل رمز التأسيس والبريد الصحيح وكلمة مرور لا تقل عن 12 حرفًا." }, { status: 400, headers: privateHeaders });
  }

  const suppliedBuffer = Buffer.from(parsed.data.setupSecret);
  const expectedBuffer = Buffer.from(setupSecret);
  if (suppliedBuffer.length !== expectedBuffer.length || !timingSafeEqual(suppliedBuffer, expectedBuffer)) {
    return NextResponse.json({ error: "رمز التأسيس غير صحيح." }, { status: 401, headers: privateHeaders });
  }

  try {
    const email = parsed.data.email.toLowerCase();
    const name = parsed.data.name || "مؤسس HUMANITY ONE";
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    const user = await prisma.$transaction(async (tx) => {
      // Serialize all bootstrap attempts, including attempts using different email addresses.
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(74120261114)`;

      const existingFounder = await tx.user.findFirst({
        where: { role: "SUPER_ADMIN" },
        select: { id: true },
      });
      if (existingFounder) return { error: "founder_exists" as const };

      // Never silently elevate an already registered ordinary account.
      const existingAccount = await tx.user.findUnique({
        where: { email },
        select: { id: true },
      });
      if (existingAccount) return { error: "email_exists" as const };

      const created = await tx.user.create({
        data: { email, passwordHash, name, role: "SUPER_ADMIN" },
        select: { id: true, email: true, name: true, role: true },
      });
      return { user: created };
    });

    if ("error" in user) {
      if (user.error === "founder_exists") {
        return NextResponse.json({ error: "تم تأسيس حساب المؤسس بالفعل. لا يمكن إعادة التأسيس." }, { status: 409, headers: privateHeaders });
      }
      return NextResponse.json({ error: "هذا البريد مسجل بالفعل. استخدم بريدًا غير مرتبط بحساب آخر." }, { status: 409, headers: privateHeaders });
    }

    return NextResponse.json({ ok: true, user: user.user }, { status: 201, headers: privateHeaders });
  } catch {
    return NextResponse.json({ error: "تعذر إنشاء حساب المؤسس. تحقق من إعداد قاعدة البيانات." }, { status: 503, headers: privateHeaders });
  }
}
