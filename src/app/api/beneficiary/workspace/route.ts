import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getBeneficiarySession } from "@/lib/beneficiary-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const dataSchema = z.object({
  "humanity-one-initiatives-v1": z.string().max(500_000).nullable(),
  "humanity-one-tasks-v1": z.string().max(500_000).nullable(),
  "humanity-one-approved-memory-v1": z.string().max(200_000).nullable(),
  "humanity-one-approved-memory-v1:enabled": z.string().max(20).nullable(),
  "humanity-one-chat-v2": z.string().max(500_000).nullable(),
}).strict();

const updateSchema = z.object({
  data: dataSchema.optional(),
  language: z.enum(["ar", "en"]).optional(),
  theme: z.enum(["dark", "light", "system"]).optional(),
}).strict().refine((value) => value.data !== undefined || value.language !== undefined || value.theme !== undefined);

export async function GET() {
  const user = await getBeneficiarySession();
  if (!user) return NextResponse.json({ error: "سجّل الدخول بحساب المستفيد للوصول إلى المزامنة." }, { status: 401 });
  try {
    const workspace = await prisma.userWorkspace.findUnique({
      where: { userId: user.id },
      select: { data: true, language: true, theme: true, updatedAt: true },
    });
    return NextResponse.json({ user: { name: user.name, email: user.email }, workspace }, {
      headers: { "Cache-Control": "no-store, private" },
    });
  } catch {
    return NextResponse.json({ error: "خدمة المزامنة غير متاحة حاليًا." }, { status: 503 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await getBeneficiarySession();
  if (!user) return NextResponse.json({ error: "سجّل الدخول بحساب المستفيد أولًا." }, { status: 401 });

  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "بيانات المزامنة غير صالحة." }, { status: 400 });

  if (parsed.data.data) {
    const size = Buffer.byteLength(JSON.stringify(parsed.data.data), "utf8");
    if (size > 1_000_000) return NextResponse.json({ error: "حجم النسخة أكبر من الحد المسموح (1 ميجابايت)." }, { status: 413 });
  }

  try {
    const saved = await prisma.userWorkspace.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        data: parsed.data.data ?? {},
        language: parsed.data.language ?? "ar",
        theme: parsed.data.theme ?? "dark",
      },
      update: {
        ...(parsed.data.data !== undefined ? { data: parsed.data.data } : {}),
        ...(parsed.data.language !== undefined ? { language: parsed.data.language } : {}),
        ...(parsed.data.theme !== undefined ? { theme: parsed.data.theme } : {}),
      },
      select: { data: true, language: true, theme: true, updatedAt: true },
    });
    return NextResponse.json({ ok: true, workspace: saved }, { headers: { "Cache-Control": "no-store, private" } });
  } catch {
    return NextResponse.json({ error: "تعذر حفظ بيانات المزامنة." }, { status: 503 });
  }
}
