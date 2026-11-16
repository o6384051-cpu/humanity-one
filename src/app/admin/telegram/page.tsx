"use client";

import { useState } from "react";

export default function TelegramSetupPage() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);

  async function connect() {
    setBusy(true); setMessage(""); setOk(false);
    try {
      const response = await fetch("/api/telegram/setup", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذر ربط البوت.");
      setOk(true); setMessage(data.message || "تم الربط.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "حدث خطأ غير متوقع.");
    } finally { setBusy(false); }
  }

  return <main dir="rtl" style={{ minHeight: "100vh", padding: 24, background: "#080d18", color: "#e8edf7", fontFamily: "Cairo, sans-serif" }}>
    <section style={{ maxWidth: 620, margin: "40px auto", padding: 24, background: "#101a2b", borderRadius: 16 }}>
      <a href="/admin" style={{ color: "#63d8d0" }}>← لوحة الإدارة</a>
      <h1 style={{ marginTop: 24 }}>ربط HUMANITY ONE بتليجرام</h1>
      <p style={{ color: "#9aabc0", lineHeight: 1.9 }}>تأكد أولًا من إضافة TELEGRAM_BOT_TOKEN و TELEGRAM_WEBHOOK_SECRET في متغيرات Vercel لبيئة Production ثم إعادة نشر الموقع.</p>
      <button onClick={connect} disabled={busy} style={{ padding: 13, border: 0, borderRadius: 9, background: "#55d3ca", color: "#08212a", fontWeight: 800, cursor: "pointer" }}>
        {busy ? "جارٍ ربط البوت..." : "ربط البوت الآن"}
      </button>
      {message && <p role="status" style={{ marginTop: 18, padding: 12, borderRadius: 9, background: ok ? "#12352d" : "#3a2525", border: "1px solid " + (ok ? "#28745d" : "#805050") }}>{message}</p>}
      {ok && <p style={{ color: "#9aabc0", lineHeight: 1.8 }}>افتح @HumanityOneConnectBot وأرسل /start. يجب أن يرد البوت برسالة ترحيب.</p>}
    </section>
  </main>;
}
