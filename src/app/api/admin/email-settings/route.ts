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
  if (!admin) return NextResponse.json({ error: "These settings are available to the founder account only." }, { status: 403 });
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
  if (!admin) return NextResponse.json({ error: "This feature is available to the founder account only." }, { status: 403 });

  const parsed = z.object({
    recipient: z.string().trim().email().max(254),
    confirm: z.literal(true),
  }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email address and confirm the test." }, { status: 400 });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    return NextResponse.json({ error: "Email service configuration is incomplete. Set RESEND_API_KEY and RESEND_FROM_EMAIL in the relevant Vercel environment after verifying the sender address." }, { status: 503 });
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [parsed.data.recipient],
        subject: "HUMANITY ONE Email Service Test",
        text: "This is a test email from HUMANITY ONE to confirm that the email service accepts messages. No organization invitation was sent.",
        html: "<div dir=\"rtl\" style=\"font-family:Arial,sans-serif;line-height:1.8\"><h2>HUMANITY ONE Email Service Test</h2><p>هذه رسالة اختبار للتأكد من أن خدمة البريد تقبل الإرسال.</p><p>لم يتم إرسال أي دعوة لمنظمة.</p></div>",
        reply_to: "humanityone.contact@gmail.com",
      }),
      cache: "no-store",
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json({ error: "The email provider rejected the test. Check the sender verification and API key status in Resend.", providerMessage: String(result?.message || "") }, { status: 502 });
    }
    return NextResponse.json({
      ok: true,
      accepted: true,
      message: "The email provider accepted the test message. This does not confirm inbox delivery; check the recipient’s mailbox and Resend logs.",
      providerId: typeof result?.id === "string" ? result.id : null,
    }, { headers: { "Cache-Control": "no-store, private" } });
  } catch {
    return NextResponse.json({ error: "Unable to connect to the email provider. Please try again later." }, { status: 502 });
  }
}
