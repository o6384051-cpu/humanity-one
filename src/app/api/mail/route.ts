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

async function sendReceiptEmail(input: {
  senderName: string;
  senderEmail: string;
  subject: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.senderEmail],
      subject: "تم استلام رسالتك إلى HUMANITY ONE",
      text: [
        `مرحبًا ${input.senderName}،`,
        "",
        "تؤكد HUMANITY ONE استلام رسالتك بنجاح عبر مركز المراسلات.",
        `عنوان رسالتك: ${input.subject}`,
        "",
        "هذه رسالة تأكيد آلية، ولا تعني أن طلبك قد تمت معالجته بعد.",
        "HUMANITY ONE",
      ].join("\n"),
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    // Do not log credentials or provider response bodies.
    console.error("HUMANITY ONE receipt email failed; Resend status:", response.status);
    return false;
  }
  return true;
}

export async function POST(req: NextRequest) {
  const limit = await rateLimit(req, "mail-contact", 5, 60 * 60 * 1000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter, limit.unavailable);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "راجع البيانات؛ الرسالة يجب أن تكون واضحة ومكتملة." },
      { status: 400 },
    );
  }

  try {
    const user = await getBeneficiarySession();
    const message = await prisma.mailMessage.create({
      data: {
        ...parsed.data,
        senderEmail: parsed.data.senderEmail || null,
        senderUserId: user?.id ?? null,
      },
    });

    const emailSent = parsed.data.senderEmail
      ? await sendReceiptEmail({
          senderName: parsed.data.senderName,
          senderEmail: parsed.data.senderEmail,
          subject: parsed.data.subject,
        }).catch(() => false)
      : false;

    return NextResponse.json(
      {
        ok: true,
        id: message.id,
        emailSent,
        message: emailSent
          ? "وصلت رسالتك وأُرسل تأكيد الاستلام إلى بريدك الإلكتروني."
          : "وصلت رسالتك إلى المنصة، لكن لم يتم إرسال تأكيد خارجي.",
      },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "تعذر حفظ الرسالة الآن. حاول مرة أخرى لاحقًا." },
      { status: 503 },
    );
  }
}
