import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getBeneficiarySession } from "@/lib/beneficiary-auth";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  phone: z.string().trim().max(22).optional().nullable(),
  city: z.string().trim().max(80).optional().nullable(),
  area: z.string().trim().max(100).optional().nullable(),
  employmentStatus: z.string().trim().max(80).optional().nullable(),
  educationLevel: z.string().trim().max(100).optional().nullable(),
  skills: z.string().trim().max(2000).optional().nullable(),
  householdSize: z.number().int().min(1).max(30).optional().nullable(),
  monthlyIncome: z.number().int().min(0).max(100000000).optional().nullable(),
  goals: z.string().trim().max(2000).optional().nullable(),
});

export async function GET() {
  const user = await getBeneficiarySession();
  if (!user) return NextResponse.json({ error: "سجّل الدخول أولًا." }, { status: 401 });

  try {
    const [profile, account] = await Promise.all([
      prisma.beneficiaryProfile.findUnique({ where: { userId: user.id } }),
      prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, name: true, email: true },
      }),
    ]);
    return NextResponse.json(
      { profile, account },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return NextResponse.json({ error: "تعذر تحميل ملفك." }, { status: 503 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await getBeneficiarySession();
  if (!user) return NextResponse.json({ error: "سجّل الدخول أولًا." }, { status: 401 });

  const limit = await rateLimit(req, "beneficiary-profile:" + user.id, 20, 3600000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter, limit.unavailable);

  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "راجع البيانات المدخلة." }, { status: 400 });
    }

    const data = Object.fromEntries(
      Object.entries(parsed.data).map(([key, value]) => [key, value === "" ? null : value]),
    );
    const profile = await prisma.beneficiaryProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...data },
      update: data,
    });

    return NextResponse.json(
      { profile },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return NextResponse.json({ error: "تعذر حفظ الملف." }, { status: 503 });
  }
}
