"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const field: React.CSSProperties = { width: "100%", padding: 12, border: "1px solid #30495a", borderRadius: 9, background: "#0b1b29", color: "#eff8ff" };
  const button: React.CSSProperties = { padding: "11px 18px", border: 0, borderRadius: 9, background: "#38b9a8", color: "#06201d", fontWeight: 800, cursor: "pointer" };

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/beneficiary/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذر إرسال الطلب.");
      setMessage(data.message);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "تعذر إرسال الطلب.");
    } finally {
      setBusy(false);
    }
  }

  return <main dir="rtl" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 18, background: "radial-gradient(circle at 85% 0%,#16384a 0,transparent 38%),#08131f", color: "#e8f1f5", fontFamily: "Cairo,system-ui,sans-serif" }}>
    <section style={{ width: "100%", maxWidth: 460, padding: 24, border: "1px solid #294454", borderRadius: 16, background: "#102333" }}>
      <Link href="/beneficiary" style={{ color: "#83d9ce" }}>← العودة لتسجيل الدخول</Link>
      <h1 style={{ fontSize: 25, margin: "18px 0 8px" }}>نسيت كلمة المرور؟</h1>
      <p style={{ color: "#a9bdc9", lineHeight: 1.8 }}>أدخل البريد الإلكتروني المسجل في حسابك، وسنرسل رابطًا آمنًا لإعادة تعيين كلمة المرور إذا كان الحساب موجودًا.</p>
      <form onSubmit={submit} style={{ display: "grid", gap: 13, marginTop: 18 }}>
        <label style={{ display: "grid", gap: 7, fontSize: 13 }}>البريد الإلكتروني
          <input required type="email" maxLength={160} autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} style={field} />
        </label>
        <button disabled={busy} style={{ ...button, opacity: busy ? 0.65 : 1 }}>{busy ? "جارٍ الإرسال…" : "إرسال رابط الاستعادة"}</button>
      </form>
      {message && <p role="status" style={{ marginTop: 16, padding: 12, border: "1px solid #287d69", borderRadius: 9, color: "#b9f3df", lineHeight: 1.8 }}>{message}</p>}
      {error && <p role="alert" style={{ marginTop: 16, color: "#ffc5c5" }}>{error}</p>}
      <p style={{ marginTop: 18, color: "#91a6b5", fontSize: 12, lineHeight: 1.8 }}>لأمان حسابك، لا نكشف ما إذا كان البريد مسجلًا لدينا. الرابط صالح لمدة 30 دقيقة ويُستخدم مرة واحدة.</p>
    </section>
  </main>;
}
