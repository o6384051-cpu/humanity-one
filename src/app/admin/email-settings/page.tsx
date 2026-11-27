"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage, translateText } from "../../../components/LanguageProvider";

type Status = { provider: string; apiKeyConfigured: boolean; senderConfigured: boolean; senderEmail: string | null; ready: boolean };
const panel: React.CSSProperties = { background: "#10232e", border: "1px solid #29414d", borderRadius: 14, padding: 18 };
const field: React.CSSProperties = { width: "100%", padding: 12, borderRadius: 9, border: "1px solid #38515d", background: "#071923", color: "#e8f2f5" };
const button: React.CSSProperties = { padding: "12px 16px", borderRadius: 9, border: "1px solid #39716b", background: "#12343a", color: "#e8f2f5", cursor: "pointer", fontWeight: 700 };

export default function AdminEmailSettingsPage() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const tx = (value: string) => translateText(value, language);
  const [status, setStatus] = useState<Status | null>(null);
  const [recipient, setRecipient] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/admin/email-settings", { cache: "no-store", credentials: "same-origin" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "تعذر تحميل إعدادات البريد.");
      setStatus(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع.");
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  async function test(e: React.FormEvent) {
    e.preventDefault(); setSending(true); setError(""); setNotice("");
    try {
      const r = await fetch("/api/admin/email-settings", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient, confirm: true }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "فشل اختبار إرسال البريد.");
      setNotice(d.message || "تم قبول رسالة الاختبار للإرسال.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع.");
    } finally { setSending(false); }
  }

  return <main lang={language} dir={isArabic ? "rtl" : "ltr"} style={{ minHeight: "100vh", background: "#07131d", color: "#e8f2f5", padding: 20, fontFamily: "Cairo, Arial, system-ui, sans-serif" }}>
    <div style={{ maxWidth: 850, margin: "0 auto", display: "grid", gap: 16 }}>
      <Link href="/admin" style={{ color: "#83d9ce", textDecoration: "none" }}>{tx("العودة إلى لوحة الإدارة ←")}</Link>
      <header>
        <h1 style={{ fontSize: 27, margin: "8px 0" }}>{tx("إعداد واختبار خدمة البريد الإلكتروني")}</h1>
        <p style={{ color: "#a9bec7", lineHeight: 1.8 }}>{tx("إعداد خدمة Resend بأمان وإرسال رسالة اختبار واحدة إلى عنوان البريد الذي تختاره. هذه الصفحة لا ترسل دعوات للمنظمات.")}</p>
        <p style={{ color: "#a9bec7", lineHeight: 1.8 }}>{tx("هذه الإعدادات متاحة لحساب المؤسس فقط.")}</p>
      </header>

      {error && <p role="alert" style={{ background: "#3a2028", color: "#ffb9b9", padding: 12, borderRadius: 9 }}>{error}</p>}
      {notice && <p role="status" style={{ background: "#12372e", color: "#a8f0d0", padding: 12, borderRadius: 9 }}>{notice}</p>}

      <section style={{ ...panel, display: "grid", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <h2 style={{ margin: 0 }}>{tx("حالة الإعداد الحالية")}</h2>
          <button type="button" onClick={() => void load()} style={button}>{tx("تحديث الحالة")}</button>
        </div>
        {loading ? <p>{tx("جارٍ فحص الإعدادات...")}</p> : status && <>
          <p>{tx("خدمة البريد:")} <b>Resend</b></p>
          <p>RESEND_API_KEY: <b style={{ color: status.apiKeyConfigured ? "#8fe3cb" : "#f2c879" }}>{status.apiKeyConfigured ? tx("تم الإعداد — القيمة مخفية") : tx("غير مُعد")}</b></p>
          <p>RESEND_FROM_EMAIL: <b style={{ color: status.senderConfigured ? "#8fe3cb" : "#f2c879" }}>{status.senderEmail || tx("غير مُعد")}</b></p>
          <p style={{ color: status.ready ? "#8fe3cb" : "#f2c879" }}>{status.ready ? tx("الخدمة جاهزة للاختبار.") : tx("يجب استكمال إعدادات الخادم قبل الإرسال.")}</p>
        </>}
      </section>

      <section style={{ ...panel, display: "grid", gap: 10 }}>
        <h2 style={{ margin: 0 }}>{tx("استكمال إعداد الخدمة")}</h2>
        <ol style={{ paddingRight: isArabic ? 22 : 0, paddingLeft: isArabic ? 0 : 22, lineHeight: 2, color: "#c3d2d9", margin: 0 }}>
          <li>{tx("افتح إعدادات مشروع HUMANITY ONE في Vercel.")}</li>
          <li>{tx("أضف RESEND_API_KEY باستخدام مفتاح API السري من حساب Resend.")}</li>
          <li>{tx("أضف RESEND_FROM_EMAIL باستخدام عنوان مرسل موثّق لدى Resend.")}</li>
          <li>{tx("احفظ المتغيرين في بيئة الاختبار ثم أعد نشر تلك البيئة.")}</li>
          <li>{tx("ارجع إلى هذه الصفحة واضغط «تحديث الحالة».")}</li>
        </ol>
        <p style={{ color: "#f2c879", fontSize: 13, lineHeight: 1.8, margin: 0 }}>{tx("الأمان: لا تُدخل مفتاح Resend السري هنا أو تشاركه في المحادثة. احفظه كمتغير سري في Vercel؛ لن يظهر في المتصفح.")}</p>
      </section>

      <section style={{ ...panel, display: "grid", gap: 12 }}>
        <h2 style={{ margin: 0 }}>{tx("إرسال رسالة اختبار")}</h2>
        <form onSubmit={test} style={{ display: "grid", gap: 10 }}>
          <label style={{ display: "grid", gap: 6 }}>{tx("عنوان البريد الإلكتروني للمستلم")}
            <input type="email" required maxLength={254} value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="example@email.com" style={field} dir="ltr" />
          </label>
          <p style={{ color: "#a9bec7", fontSize: 13, lineHeight: 1.8, margin: 0 }}>{tx("سيتم إرسال رسالة اختبار واحدة فقط إلى هذا العنوان. لن تُرسل دعوات للمنظمات ولن تتغير أي بيانات خاصة بها.")}</p>
          <button type="submit" disabled={sending || !recipient.trim()} aria-label={isArabic ? "إرسال رسالة اختبار" : "Send a Test Email"} style={{ ...button, minHeight: 48, minWidth: 190, opacity: sending || !recipient.trim() ? 0.55 : 1, display: "inline-flex", alignItems: "center", justifyContent: "center", appearance: "none", WebkitAppearance: "none" }}>
            {sending ? tx("جارٍ إرسال رسالة الاختبار...") : tx("إرسال رسالة اختبار")}
          </button>
        </form>
      </section>
      <p style={{ color: "#9fb6bf", fontSize: 12, lineHeight: 1.8 }}>{tx("نجاح الاختبار يعني أن Resend قبلت الرسالة. افحص صندوق الوارد وسجلات مزود الخدمة لتأكيد التسليم. تظل دعوات المنظمات إجراءً منفصلًا يتطلب تأكيدًا صريحًا.")}</p>
    </div>
  </main>;
}
