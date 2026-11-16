"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Send, ShieldCheck } from "lucide-react";

const fieldStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 13px",
  borderRadius: 10,
  border: "1px solid #38515c",
  background: "#071923",
  color: "#f0f7f8",
  font: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "grid",
  gap: 7,
  color: "#c5d6dd",
  fontSize: 14,
};

export default function OrganizationInquiryForm() {
  const [organization, setOrganization] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("جمعية أو مؤسسة أهلية");
  const [website, setWebsite] = useState("");
  const [activities, setActivities] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [tracking, setTracking] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent || busy) return;
    setBusy(true);
    setError("");
    setTracking("");

    const body = [
      "طلب انضمام أولي إلى شبكة HUMANITY ONE",
      "",
      "اسم المنظمة: " + organization.trim(),
      "اسم مسؤول التواصل: " + contact.trim(),
      "نوع الجهة: " + category,
      "المدينة / الدولة: " + city.trim(),
      "الموقع أو الصفحة الرسمية: " + (website.trim() || "لم يُذكر"),
      "",
      "مجالات العمل والخدمات:",
      activities.trim(),
      "",
      "أقرّ بأن هذه بيانات تواصل أولية، وأوافق على استخدامها لمراجعة طلب التواصل والرد عليه. لا يتضمن الطلب بيانات مستفيدين أو مستندات شخصية.",
    ].join("\n");

    try {
      const response = await fetch("/api/mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: contact.trim(),
          senderEmail: email.trim(),
          department: "partners",
          subject: "طلب انضمام منظمة: " + organization.trim(),
          body,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "تعذر إرسال الطلب الآن.");
      setTracking(typeof result.id === "string" ? result.id.slice(0, 10).toUpperCase() : "تم الاستلام");
      setOrganization("");
      setContact("");
      setEmail("");
      setCity("");
      setWebsite("");
      setActivities("");
      setConsent(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع. حاول لاحقًا.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="application-form" style={{ marginTop: 42, padding: "clamp(20px,4vw,32px)", borderRadius: 18, background: "#0b1c26", border: "1px solid #34515c" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <ShieldCheck size={25} color="#83d9ce" />
        <h2 style={{ fontSize: 24, margin: 0 }}>نموذج التواصل الأولي للمنظمات</h2>
      </div>
      <p style={{ color: "#b8cbd2", lineHeight: 1.9, marginTop: 10 }}>
        أرسل بيانات الجهة الأساسية ليتمكن فريقنا من مراجعة طلب التواصل والرد عليك عبر البريد. إرسال النموذج لا يعني اعتماد المنظمة أو ضمان الشراكة.
      </p>

      {tracking ? (
        <div role="status" style={{ marginTop: 18, padding: 18, borderRadius: 12, background: "#10352f", border: "1px solid #34786d" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, color: "#9be8d9", fontWeight: 800 }}>
            <CheckCircle2 size={22} /> تم استلام طلب التواصل
          </div>
          <p style={{ color: "#d2e8e5", marginBottom: 6 }}>رقم المتابعة: <b dir="ltr">{tracking}</b></p>
          <p style={{ color: "#b8d1cc", margin: 0, lineHeight: 1.8 }}>سيظهر الطلب في صندوق مراسلات الشراكات لدى فريق الإدارة. لا يعني الاستلام الموافقة على الانضمام.</p>
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: "grid", gap: 14, marginTop: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,230px),1fr))", gap: 12 }}>
            <label style={labelStyle}>اسم المنظمة أو المؤسسة
              <input required minLength={2} maxLength={150} value={organization} onChange={(e) => setOrganization(e.target.value)} style={fieldStyle} />
            </label>
            <label style={labelStyle}>اسم مسؤول التواصل
              <input required minLength={2} maxLength={100} value={contact} onChange={(e) => setContact(e.target.value)} style={fieldStyle} />
            </label>
            <label style={labelStyle}>البريد الرسمي للتواصل
              <input required type="email" maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} style={fieldStyle} />
            </label>
            <label style={labelStyle}>المدينة والدولة
              <input required maxLength={120} value={city} onChange={(e) => setCity(e.target.value)} style={fieldStyle} placeholder="مثال: القاهرة، مصر" />
            </label>
            <label style={labelStyle}>نوع الجهة
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={fieldStyle}>
                <option>جمعية أو مؤسسة أهلية</option>
                <option>مؤسسة تعليمية أو تدريبية</option>
                <option>جهة توظيف أو تمكين اقتصادي</option>
                <option>مؤسسة صحية أو تأهيلية مرخصة</option>
                <option>مبادرة مجتمعية أو جهة أخرى</option>
              </select>
            </label>
            <label style={labelStyle}>الموقع أو الصفحة الرسمية (اختياري)
              <input type="url" maxLength={300} value={website} onChange={(e) => setWebsite(e.target.value)} style={fieldStyle} placeholder="https://" />
            </label>
          </div>
          <label style={labelStyle}>مجالات العمل والخدمات التي تقدمها الجهة
            <textarea required minLength={10} maxLength={2500} rows={5} value={activities} onChange={(e) => setActivities(e.target.value)} style={{ ...fieldStyle, resize: "vertical" }} placeholder="اكتب نبذة مختصرة عن أنشطة الجهة والفئات التي تخدمها..." />
          </label>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, color: "#b8cbd2", lineHeight: 1.8, fontSize: 13 }}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required style={{ marginTop: 5 }} />
            أوافق على استخدام بيانات التواصل الواردة في هذا النموذج لمراجعة طلب المنظمة والرد عليه. لن أرسل بيانات مستفيدين أو مستندات شخصية عبر النموذج.
          </label>
          {error && <p role="alert" style={{ color: "#ffaaaa", margin: 0 }}>{error}</p>}
          <button type="submit" disabled={!consent || busy} style={{ justifySelf: "start", display: "inline-flex", alignItems: "center", gap: 9, border: 0, borderRadius: 10, padding: "12px 18px", background: busy ? "#42636a" : "#54c8ba", color: "#062027", fontWeight: 900, font: "inherit", cursor: busy ? "wait" : "pointer" }}>
            <Send size={17} /> {busy ? "جارٍ إرسال الطلب..." : "إرسال طلب التواصل"}
          </button>
        </form>
      )}

      <p style={{ color: "#8fa8b2", fontSize: 12, lineHeight: 1.8, marginBottom: 0, marginTop: 18 }}>
        لا تُرفق مستندات أو بيانات مستفيدين في هذه المرحلة. يمكن التواصل أيضًا عبر البريد المعتمد: humanityone.contact@gmail.com.
      </p>
    </section>
  );
}
