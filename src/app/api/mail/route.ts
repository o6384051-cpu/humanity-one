import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getBeneficiarySession } from "@/lib/beneficiary-auth";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const schema = z.object({
  senderName: z.string().trim().min(2).max(100),
  senderEmail: z.string().trim().email().max(254).optional().or(z.literal("")),
  department: z.enum(["support", "beneficiaries", "partners", "administration"]),
  subject: z.string().trim().min(3).max(160),
  body: z.string().trim().min(10).max(5000),
});

export async function POST(req: NextRequest) {
  const limit = await rateLimit(req, "mail-contact", 5, 60 * 60 * 1000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter, limit.unavailable);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "راجع البيانات؛ الرسالة يجب أن تكون واضحة ومكتملة." }, { status: 400 });
  try {
    const user = await getBeneficiarySession();
    const message = await prisma.mailMessage.create({ data: { ...parsed.data, senderEmail: parsed.data.senderEmail || null, senderUserId: user?.id ?? null } });
    return NextResponse.json({ ok: true, id: message.id, message: "وصلت رسالتك إلى فريق HUMANITY ONE." }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "تعذر حفظ الرسالة الآن. حاول مرة أخرى لاحقًا." }, { status: 503 });
  }
}
