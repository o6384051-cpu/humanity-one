"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useLanguage, translateText } from "../../../components/LanguageProvider";

export default function ResetPasswordPage() {
  const { language } = useLanguage();
  const tx = (value: string) => translateText(value, language);
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") || "");
  }, []);

  const field: React.CSSProperties = { width: "100%", padding: 12, border: "1px solid #30495a", borderRadius: 9, background: "#0b1b29", color: "#eff8ff" };
  const button: React.CSSProperties = { padding: "11px 18px", border: 0, borderRadius: 9, background: "#38b9a8", color: "#06201d", fontWeight: 800, cursor: "pointer" };

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(""); setMessage("");
    if (password !== confirmation) { setError("كلمتا المرور غير متطابقتين."); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/beneficiary/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذر تغيير كلمة المرور.");
      setMessage(data.message);
      setPassword(""); setConfirmation(""); setToken("");
      window.history.replaceState({}, "", "/beneficiary/reset-password");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "تعذر تغيير كلمة المرور.");
    } finally {
      setBusy(false);
    }
  }

  return <main dir="rtl" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 18, background: "radial-gradient(circle at 85% 0%,#16384a 0,transparent 38%),#08131f", color: "#e8f1f5", fontFamily: "Cairo,system-ui,sans-serif" }}>
    <section style={{ width: "100%", maxWidth: 460, padding: 24, border: "1px solid #294454", borderRadius: 16, background: "#102333" }}>
      <Link href="/beneficiary" style={{ color: "#83d9ce" }}>{tx("← العودة لتسجيل الدخول")}</Link>
      <h1 style={{ fontSize: 25, margin: "18px 0 8px" }}>{tx("تعيين كلمة مرور جديدة")}</h1>
      {!token && !message ? <p style={{ color: "#ffc5c5" }}>{tx("رابط الاستعادة غير موجود أو غير صالح. اطلب رابطًا جديدًا.")}</p> : null}
      <form onSubmit={submit} style={{ display: "grid", gap: 13, marginTop: 18 }}>
        <label style={{ display: "grid", gap: 7, fontSize: 13 }}>{tx("كلمة المرور الجديدة")}
          <input required type="password" minLength={10} maxLength={128} autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} style={field} disabled={!token || busy} />
        </label>
        <label style={{ display: "grid", gap: 7, fontSize: 13 }}>{tx("تأكيد كلمة المرور")}
          <input required type="password" minLength={10} maxLength={128} autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} style={field} disabled={!token || busy} />
        </label>
        <small style={{ color: "#91a6b5" }}>{tx("استخدم 10 أحرف على الأقل.")}</small>
        <button disabled={!token || busy} style={{ ...button, opacity: !token || busy ? 0.55 : 1 }}>{busy ? "جارٍ الحفظ…" : "حفظ كلمة المرور الجديدة"}</button>
      </form>
      {message && <p role="status" style={{ marginTop: 16, padding: 12, border: "1px solid #287d69", borderRadius: 9, color: "#b9f3df", lineHeight: 1.8 }}>{message} <Link href="/beneficiary" style={{ textDecoration: "underline" }}>{tx("تسجيل الدخول")}</Link></p>}
      {error && <p role="alert" style={{ marginTop: 16, color: "#ffc5c5" }}>{error}</p>}
      <p style={{ marginTop: 18, color: "#91a6b5", fontSize: 12, lineHeight: 1.8 }}>{tx("الرابط صالح لمدة 30 دقيقة ويُستخدم مرة واحدة فقط. لا تشارك الرابط مع أي شخص.")}</p>
    </section>
  </main>;
}
