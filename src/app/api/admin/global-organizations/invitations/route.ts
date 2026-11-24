import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const schema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(100),
  subject: z.string().trim().min(3).max(180),
  body: z.string().trim().min(30).max(10000),
  confirm: z.literal(true),
});
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c] || c));

export async function GET() {
  const admin = await getAdminSession();
  if (!admin || admin.role !== "SUPER_ADMIN") return NextResponse.json({ error: "هذه الوظيفة متاحة لحساب المؤسس فقط." }, { status: 403 });
  try {
    const leads = await prisma.organizationLead.findMany({
      orderBy: [{ country: "asc" }, { organizationName: "asc" }],
      take: 1000,
      select: { id: true, organizationName: true, country: true, focusArea: true, contactName: true, contactEmail: true, website: true, status: true },
    });
    return NextResponse.json({ leads }, { headers: { "Cache-Control": "no-store, private" } });
  } catch {
    return NextResponse.json({ error: "تعذر تحميل سجل المنظمات." }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin || admin.role !== "SUPER_ADMIN") return NextResponse.json({ error: "الإرسال الجماعي من صلاحية حساب المؤسس فقط." }, { status: 403 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "بيانات الحملة غير صالحة." }, { status: 400 });
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return NextResponse.json({ error: "لم يتم إعداد خدمة البريد بعد. أضف RESEND_API_KEY و RESEND_FROM_EMAIL بعد توثيق عنوان الإرسال، ثم أعد المحاولة. لم تُرسل أي رسالة." }, { status: 503 });

  try {
    const uniqueIds = Array.from(new Set(parsed.data.ids));
    const leads = await prisma.organizationLead.findMany({ where: { id: { in: uniqueIds } }, select: { id: true, organizationName: true, contactEmail: true, contactName: true, country: true, status: true } });
    const byId = new Map(leads.map((lead) => [lead.id, lead]));
    const candidates = uniqueIds.map((id) => byId.get(id)).filter((lead): lead is NonNullable<typeof lead> => !!lead);
    const results = { sent: 0, skipped: uniqueIds.length - candidates.length, failed: 0 };
    const payload = [] as Array<{ from: string; to: string[]; subject: string; text: string; html: string; reply_to: string }>;
    const recipients: Array<{ id: string; email: string; name: string }> = [];
    for (const lead of candidates) {
      const email = lead.contactEmail?.trim().toLowerCase();
      if (!email || lead.status === "DO_NOT_CONTACT") { results.skipped++; continue; }
      const previous = await prisma.mailMessage.findFirst({
        where: { department: "outreach", direction: "OUTBOUND", senderEmail: email, status: "SENT" },
        select: { id: true },
      });
      if (previous) { results.skipped++; continue; }
      const personalized = parsed.data.body.replace(/\{\{organizationName\}\}/g, lead.organizationName);
      const greeting = lead.contactName ? "السيد/ة " + lead.contactName + "،\n\n" : "";
      const text = personalized.replace("السادة مسؤولي " + lead.organizationName + " المحترمين،\n\n", greeting || "السادة مسؤولي " + lead.organizationName + " المحترمين،\n\n");
      payload.push({ from, to: [email], subject: parsed.data.subject, text, html: "<div dir=\"rtl\" style=\"font-family:Arial,sans-serif;white-space:pre-wrap;line-height:1.8\">" + escapeHtml(text) + "</div>", reply_to: "humanityone.contact@gmail.com" });
      recipients.push({ id: lead.id, email, name: lead.organizationName });
    }
    if (!payload.length) return NextResponse.json({ ...results, message: "لا توجد عناوين مؤهلة جديدة للإرسال." });
    const response = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const provider = await response.json().catch(() => ({}));
    if (!response.ok) {
      await Promise.all(recipients.map((recipient) => prisma.mailMessage.create({ data: {
        senderName: "HUMANITY ONE", senderEmail: recipient.email, department: "outreach",
        subject: parsed.data.subject, body: "فشل الإرسال: " + String(provider?.message || "خطأ مزود البريد"),
        status: "FAILED", direction: "OUTBOUND",
      }})));
      return NextResponse.json({ error: "رفض مزود البريد الحملة؛ لم يتم تأكيد التسليم. تحقق من إعدادات المرسل والحساب.", details: String(provider?.message || "") }, { status: 502 });
    }
    const messageIds: string[] = Array.isArray(provider?.data) ? provider.data.map((x: { id?: string }) => String(x?.id || "")) : [];
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i];
        await tx.mailMessage.create({ data: {
          senderName: "HUMANITY ONE", senderEmail: recipient.email, department: "outreach",
          subject: parsed.data.subject, body: "تم قبول الرسالة لدى مزود البريد. معرف المزود: " + (messageIds[i] || "غير متاح"),
          status: "SENT", direction: "OUTBOUND",
        }});
        await tx.organizationLead.update({ where: { id: recipient.id }, data: { status: "CONTACTED", lastContactAt: new Date() } });
      }
    });
    results.sent = recipients.length;
    return NextResponse.json({ ...results, message: "قُبلت الرسائل لدى مزود البريد. راقب تقارير المزود للتأكد من التسليم النهائي." }, { headers: { "Cache-Control": "no-store, private" } });
  } catch (error) {
    const e = error as { code?: string };
    console.error("[organization-invitations] send failed", { code: e?.code || "UNKNOWN" });
    return NextResponse.json({ error: "حدث خطأ أثناء تجهيز الحملة أو تسجيل نتائجها." }, { status: 503 });
  }
}
