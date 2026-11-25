import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authorized() {
  const admin = await getAdminSession();
  return admin?.role === "SUPER_ADMIN" ? admin : null;
}

export async function GET() {
  const admin = await authorized();
  if (!admin) return NextResponse.json({ error: "هذه الإعدادات متاحة لحساب المؤسس فقط." }, { status: 403 });
  const apiKeyConfigured = Boolean(process.env.RESEND_API_KEY);
  const fromEmail = process.env.RESEND_FROM_EMAIL || "";
  return NextResponse.json({
    provider: "Resend",
    apiKeyConfigured,
    senderConfigured: Boolean(fromEmail),
    senderEmail: fromEmail || null,
    ready: apiKeyConfigured && Boolean(fromEmail),
  }, { headers: { "Cache-Control": "no-store, private" } });
}

export async function POST(req: NextRequest) {
  const admin = await authorized();
  if (!admin) return NextResponse.json({ error: "هذه الوظيفة متاحة لحساب المؤسس فقط." }, { status: 403 });

  const parsed = z.object({
    recipient: z.string().trim().email().max(254),
    confirm: z.literal(true),
  }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "أدخل بريدًا إلكترونيًا صحيحًا وأكد الاختبار." }, { status: 400 });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    return NextResponse.json({ error: "خدمة البريد غير مكتملة. اضبط RESEND_API_KEY و RESEND_FROM_EMAIL في Vercel Production بعد توثيق عنوان المرسل." }, { status: 503 });
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [parsed.data.recipient],
        subject: "اختبار خدمة البريد — HUMANITY ONE",
        text: "هذه رسالة اختبار من HUMANITY ONE للتأكد من أن خدمة البريد تقبل الإرسال. لم يتم إرسال أي دعوة لمنظمة.",
        html: "<div dir=\"rtl\" style=\"font-family:Arial,sans-serif;line-height:1.8\"><h2>اختبار خدمة البريد — HUMANITY ONE</h2><p>هذه رسالة اختبار للتأكد من أن خدمة البريد تقبل الإرسال.</p><p>لم يتم إرسال أي دعوة لمنظمة.</p></div>",
        reply_to: "humanityone.contact@gmail.com",
      }),
      cache: "no-store",
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json({ error: "رفض مزود البريد الاختبار. راجع توثيق عنوان المرسل وحالة مفتاح الخدمة في Resend.", providerMessage: String(result?.message || "") }, { status: 502 });
    }
    return NextResponse.json({
      ok: true,
      accepted: true,
      message: "قبل مزود البريد رسالة الاختبار. هذا لا يثبت وصولها إلى صندوق الوارد؛ تحقق من البريد وتقارير Resend.",
      providerId: typeof result?.id === "string" ? result.id : null,
    }, { headers: { "Cache-Control": "no-store, private" } });
  } catch {
    return NextResponse.json({ error: "تعذر الاتصال بمزود البريد. حاول لاحقًا." }, { status: 502 });
  }
}
