'use client';

import { useState } from "react";
import Link from "next/link";
import { Mail, Send, ShieldCheck, Users, LifeBuoy, Handshake } from "lucide-react";
import { useLanguage } from "../../components/LanguageProvider";

const departments = [
  { value: "support", ar: "الدعم الفني", en: "Technical Support", address: "support@humanityone.org", icon: LifeBuoy },
  { value: "beneficiaries", ar: "مساعدة المستفيدين", en: "Beneficiary Assistance", address: "help@humanityone.org", icon: Users },
  { value: "partners", ar: "المنظمات والشركاء", en: "Organizations & Partners", address: "partners@humanityone.org", icon: Handshake },
  { value: "administration", ar: "الإدارة", en: "Administration", address: "admin@humanityone.org", icon: ShieldCheck },
];

const copy = {
  back: ["العودة إلى HUMANITY ONE", "Back to HUMANITY ONE"],
  title: ["مركز المراسلات الداخلي", "Internal Message Center"],
  subtitle: ["تواصل مع فريق HUMANITY ONE من مكان واحد", "Contact the HUMANITY ONE team in one place"],
  newMessage: ["إنشاء رسالة جديدة", "Create a New Message"],
  name: ["الاسم", "Name"],
  email: ["البريد الإلكتروني (اختياري)", "Email address (optional)"],
  section: ["القسم", "Department"],
  subject: ["عنوان الرسالة", "Subject"],
  body: ["نص الرسالة", "Message"],
  send: ["إرسال الرسالة إلى المنصة", "Send Message"],
  sending: ["جارٍ الإرسال...", "Sending..."],
  success: ["تم استلام رسالتك بنجاح. رقم المتابعة:", "Your message was received. Tracking number:"],
  sendError: ["تعذر إرسال الرسالة", "Could not send the message"],
  genericError: ["حدث خطأ", "An error occurred"],
  savedNotice: ["هذه مراسلات داخل المنصة تُحفظ في قاعدة بياناتها. عناوين @humanityone.org أقسام تنظيمية وليست صناديق بريد خارجية مفعّلة بعد.", "These messages are handled and stored inside the platform. The @humanityone.org addresses are department labels, not active external email inboxes."],
  namePlaceholder: ["اكتب اسمك", "Enter your name"],
  subjectPlaceholder: ["اكتب عنوان الرسالة", "Enter a subject"],
  bodyPlaceholder: ["اكتب رسالتك هنا...", "Write your message here..."],
} as const;

export default function MailCenterPage() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const t = (key: keyof typeof copy) => copy[key][isArabic ? 0 : 1];
  const [form, setForm] = useState({ senderName: "", senderEmail: "", department: "support", subject: "", body: "" });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNotice("");
    setError("");
    try {
      const r = await fetch("/api/mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || t("sendError"));
      setNotice(`${t("success")} ${d.id}`);
      setForm(v => ({ ...v, senderName: "", senderEmail: "", subject: "", body: "" }));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("genericError"));
    } finally {
      setBusy(false);
    }
  }

  const field: React.CSSProperties = {
    display: "block", width: "100%", boxSizing: "border-box", marginTop: 7,
    padding: 12, borderRadius: 9, border: "1px solid #38515c",
    background: "#071923", color: "#f0f7f8", textAlign: isArabic ? "right" : "left",
  };

  return (
    <main dir={isArabic ? "rtl" : "ltr"} lang={language} style={{ minHeight: "100vh", background: "#07131d", color: "#e8f2f5", padding: "28px 16px 60px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#8bded4", textDecoration: "none" }}>
          {isArabic ? "← " : "← "}{t("back")}
        </Link>
        <header style={{ margin: "28px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Mail size={34} color="#70d8cd" />
            <div>
              <h1 style={{ fontSize: 30, margin: 0 }}>{t("title")}</h1>
              <p style={{ color: "#a9bec7", marginTop: 8 }}>{t("subtitle")}</p>
            </div>
          </div>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12, marginBottom: 24 }}>
          {departments.map(d => (
            <button key={d.value} type="button" onClick={() => setForm(v => ({ ...v, department: d.value }))}
              aria-pressed={form.department === d.value}
              style={{ textAlign: isArabic ? "right" : "left", padding: 16, borderRadius: 14,
                border: form.department === d.value ? "1px solid #65d4c8" : "1px solid #29414d",
                background: form.department === d.value ? "#12323a" : "#0d202b", color: "#e8f2f5", cursor: "pointer" }}>
              <d.icon size={22} />
              <b style={{ display: "block", margin: "9px 0 5px" }}>{isArabic ? d.ar : d.en}</b>
              <small style={{ color: "#9fb6bf", direction: "ltr", display: "block", textAlign: isArabic ? "right" : "left" }}>{d.address}</small>
            </button>
          ))}
        </section>

        <section style={{ background: "#0d202b", border: "1px solid #29414d", borderRadius: 18, padding: 22 }}>
          <h2 style={{ marginTop: 0 }}>{t("newMessage")}</h2>
          <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
            <label>{t("name")}<input required minLength={2} maxLength={100} value={form.senderName}
              onChange={e => setForm(v => ({ ...v, senderName: e.target.value }))} placeholder={t("namePlaceholder")} style={field} /></label>
            <label>{t("email")}<input type="email" maxLength={254} value={form.senderEmail}
              onChange={e => setForm(v => ({ ...v, senderEmail: e.target.value }))} placeholder="name@example.com" style={{ ...field, direction: "ltr" }} /></label>
            <label>{t("section")}<select value={form.department} onChange={e => setForm(v => ({ ...v, department: e.target.value }))} style={field}>
              {departments.map(d => <option key={d.value} value={d.value}>{isArabic ? d.ar : d.en}</option>)}
            </select></label>
            <label>{t("subject")}<input required minLength={3} maxLength={160} value={form.subject}
              onChange={e => setForm(v => ({ ...v, subject: e.target.value }))} placeholder={t("subjectPlaceholder")} style={field} /></label>
            <label>{t("body")}<textarea required minLength={10} maxLength={5000} rows={6} value={form.body}
              onChange={e => setForm(v => ({ ...v, body: e.target.value }))} placeholder={t("bodyPlaceholder")} style={{ ...field, resize: "vertical" }} /></label>
            {notice && <p role="status" style={{ color: "#7ee0b2" }}>{notice}</p>}
            {error && <p role="alert" style={{ color: "#ff9d9d" }}>{error}</p>}
            <button disabled={busy} style={{ border: 0, borderRadius: 10, padding: 14, background: "#47bfb4", color: "#062026", fontWeight: 800, cursor: "pointer" }}>
              <Send size={17} style={{ verticalAlign: "middle", marginInlineEnd: 8 }} />{busy ? t("sending") : t("send")}
            </button>
          </form>
        </section>
        <p style={{ color: "#91aab4", fontSize: 13, marginTop: 18, lineHeight: 1.8 }}>{t("savedNotice")}</p>
      </div>
    </main>
  );
}
