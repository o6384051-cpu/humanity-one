import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// One-time founder setup. Requires a private Vercel environment secret and refuses to run after setup.
export async function POST(req: NextRequest) {
  const setupSecret = process.env.FOUNDER_SETUP_SECRET;
  if (!setupSecret || !process.env.JWT_SECRET) return NextResponse.json({ error: "إعداد تأسيس حساب المؤسس غير مكتمل في الاستضافة." }, { status: 503 });
  try {
    const body = await req.json();
    const supplied = typeof body.setupSecret === "string" ? body.setupSecret : "";
    const suppliedBuffer = Buffer.from(supplied);
    const expectedBuffer = Buffer.from(setupSecret);
    if (suppliedBuffer.length !== expectedBuffer.length || !timingSafeEqual(suppliedBuffer, expectedBuffer)) {
      return NextResponse.json({ error: "رمز التأسيس غير صحيح." }, { status: 401 });
    }
    const existingFounder = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" }, select: { id: true } });
    if (existingFounder) return NextResponse.json({ error: "تم تأسيس حساب المؤسس بالفعل. لا يمكن إعادة التأسيس." }, { status: 409 });
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "مؤسس HUMANITY ONE";
    if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 12) return NextResponse.json({ error: "أدخل بريدًا صحيحًا وكلمة مرور لا تقل عن 12 حرفًا." }, { status: 400 });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash, name, role: "SUPER_ADMIN" },
      create: { email, passwordHash, name, role: "SUPER_ADMIN" },
      select: { id: true, email: true, name: true, role: true },
    });
    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "تعذر إنشاء حساب المؤسس. تحقق من قاعدة البيانات." }, { status: 500 });
  }
}
