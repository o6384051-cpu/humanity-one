"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Download, Printer, ShieldCheck, FileText } from "lucide-react";

type Resume = {
  fullName: string;
  role: string;
  phone: string;
  email: string;
  city: string;
  summary: string;
  skills: string;
  experience: string;
  education: string;
  courses: string;
};

const empty: Resume = {
  fullName: "", role: "", phone: "", email: "", city: "",
  summary: "", skills: "", experience: "", education: "", courses: "",
};

export default function ResumeBuilderPage() {
  const [data, setData] = useState<Resume>(empty);
  const update = (key: keyof Resume, value: string) => setData((old) => ({ ...old, [key]: value }));
  const lines = (value: string) => value.split("\n").map((v) => v.trim()).filter(Boolean);
  const resumeText = useMemo(() => [
    data.fullName.trim(),
    data.role.trim(),
    [data.city, data.phone, data.email].filter(Boolean).join(" | "),
    "",
    "نبذة مهنية",
    data.summary.trim(),
    "",
    "المهارات",
    ...lines(data.skills).map((v) => "• " + v),
    "",
    "الخبرات العملية",
    ...lines(data.experience),
    "",
    "التعليم",
    ...lines(data.education),
    "",
    "الدورات والشهادات",
    ...lines(data.courses),
  ].join("\n"), [data]);
  const field: React.CSSProperties = {
    width: "100%", boxSizing: "border-box", border: "1px solid #294454",
    borderRadius: 10, padding: 12, background: "#0a1b27", color: "#eef7f8",
    font: "inherit", minWidth: 0,
  };
  const panel: React.CSSProperties = {
    background: "rgba(17,38,52,.9)", border: "1px solid rgba(132,177,190,.18)",
    borderRadius: 16, padding: 18,
  };
  const labelStyle: React.CSSProperties = { display: "grid", gap: 7, color: "#c5d6dd", fontSize: 13 };
  const save = () => {
    const blob = new Blob(["\uFEFF" + resumeText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "humanity-one-cv.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const hasContent = Boolean(data.fullName.trim() || data.role.trim() || data.summary.trim());

  return (
    <main dir="rtl" style={{ minHeight: "100vh", padding: "clamp(18px,4vw,48px)", color: "#e8f1f5", background: "linear-gradient(145deg,#07131d,#0b1d2b 58%,#102a34)" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <Link href="/personal-plan" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#8bded2", textDecoration: "none", marginBottom: 24 }}>
          <ArrowRight size={17} /> العودة إلى خطتي الشخصية
        </Link>
        <header style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, color: "#83d9ce", fontSize: 13 }}><FileText size={18} /> أداة مجانية دون تسجيل</div>
          <h1 style={{ fontSize: "clamp(27px,4vw,39px)", margin: "9px 0" }}>أنشئ سيرتك الذاتية</h1>
          <p style={{ color: "#a9bdc8", lineHeight: 1.9, maxWidth: 780, margin: 0 }}>
            اكتب معلوماتك المهنية فقط، وشاهد معاينة مباشرة، ثم نزّل نسخة نصية يمكنك تعديلها أو تنسيقها. إذا لم تكن لديك خبرة، ركّز على مهاراتك ومشروعاتك وتدريبك.
          </p>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))", gap: 16, alignItems: "start" }}>
          <form onSubmit={(e) => { e.preventDefault(); save(); }} style={{ ...panel, display: "grid", gap: 13 }}>
            <h2 style={{ margin: 0, fontSize: 19 }}>بيانات السيرة الذاتية</h2>
            <label style={labelStyle}>الاسم الذي تريد إظهاره<input required maxLength={100} value={data.fullName} onChange={(e) => update("fullName", e.target.value)} style={field} placeholder="الاسم الكامل" /></label>
            <label style={labelStyle}>المسمى أو الوظيفة المستهدفة<input maxLength={120} value={data.role} onChange={(e) => update("role", e.target.value)} style={field} placeholder="مثال: خدمة عملاء، فني صيانة، مساعد إداري" /></label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10 }}>
              <label style={labelStyle}>الهاتف (اختياري)<input maxLength={40} value={data.phone} onChange={(e) => update("phone", e.target.value)} style={field} /></label>
              <label style={labelStyle}>البريد الإلكتروني<input type="email" maxLength={120} value={data.email} onChange={(e) => update("email", e.target.value)} style={field} /></label>
            </div>
            <label style={labelStyle}>المدينة أو المحافظة (اختياري)<input maxLength={100} value={data.city} onChange={(e) => update("city", e.target.value)} style={field} /></label>
            <label style={labelStyle}>نبذة مهنية قصيرة<textarea maxLength={700} rows={4} value={data.summary} onChange={(e) => update("summary", e.target.value)} style={field} placeholder="اكتب ما تجيده ونوع العمل الذي تبحث عنه." /></label>
            <label style={labelStyle}>المهارات (مهارة في كل سطر)<textarea maxLength={1200} rows={4} value={data.skills} onChange={(e) => update("skills", e.target.value)} style={field} placeholder={"التواصل مع العملاء\nالعمل ضمن فريق\nاستخدام الحاسب"} /></label>
            <label style={labelStyle}>الخبرات أو الأعمال السابقة (كل خبرة في سطر)<textarea maxLength={1800} rows={5} value={data.experience} onChange={(e) => update("experience", e.target.value)} style={field} placeholder="المسمى – جهة العمل – الفترة – أهم المهام. يمكنك كتابة الأعمال الحرة أو التطوعية." /></label>
            <label style={labelStyle}>التعليم (كل مؤهل في سطر)<textarea maxLength={1000} rows={3} value={data.education} onChange={(e) => update("education", e.target.value)} style={field} placeholder="المؤهل – المؤسسة – سنة التخرج" /></label>
            <label style={labelStyle}>الدورات والشهادات (اختياري)<textarea maxLength={1000} rows={3} value={data.courses} onChange={(e) => update("courses", e.target.value)} style={field} placeholder="اسم الدورة – الجهة – السنة" /></label>
            <button type="submit" disabled={!data.fullName.trim()} style={{ border: 0, borderRadius: 10, padding: 13, background: data.fullName.trim() ? "#17635b" : "#355365", color: "white", font: "inherit", cursor: data.fullName.trim() ? "pointer" : "not-allowed", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Download size={17} /> تنزيل السيرة الذاتية
            </button>
          </form>

          <section style={{ ...panel, position: "sticky", top: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: 19 }}>معاينة مباشرة</h2>
              <button type="button" onClick={() => window.print()} style={{ border: "1px solid #426273", borderRadius: 9, padding: "8px 10px", background: "transparent", color: "#d8e7eb", font: "inherit", display: "inline-flex", alignItems: "center", gap: 6 }}><Printer size={15} /> طباعة</button>
            </div>
            <article style={{ background: "#fff", color: "#1b2930", borderRadius: 8, padding: "clamp(16px,3vw,28px)", minHeight: 420, lineHeight: 1.8, overflowWrap: "anywhere" }}>
              <h2 style={{ color: "#14564f", fontSize: 25, margin: "0 0 2px" }}>{data.fullName || "اسمك الكامل"}</h2>
              <strong style={{ color: "#52656d" }}>{data.role || "المسمى الوظيفي المستهدف"}</strong>
              <p style={{ color: "#52656d", fontSize: 12, borderBottom: "1px solid #dce4e7", paddingBottom: 10 }}>{[data.city, data.phone, data.email].filter(Boolean).join(" · ") || "بيانات التواصل الاختيارية"}</p>
              {([
                ["نبذة مهنية", data.summary],
                ["المهارات", data.skills],
                ["الخبرات العملية", data.experience],
                ["التعليم", data.education],
                ["الدورات والشهادات", data.courses],
              ] as const).map(([heading, value]) => value.trim() ? <section key={heading} style={{ marginTop: 15 }}><h3 style={{ color: "#14564f", fontSize: 15, borderBottom: "1px solid #dce4e7", margin: "0 0 6px" }}>{heading}</h3><p style={{ whiteSpace: "pre-wrap", margin: 0, fontSize: 13 }}>{value}</p></section> : null)}
              {!hasContent && <p style={{ color: "#71838a" }}>ابدأ بملء النموذج لتظهر سيرتك الذاتية هنا.</p>}
            </article>
            <p style={{ color: "#91aab6", fontSize: 12, lineHeight: 1.8, marginBottom: 0 }}>المعاينة قابلة للطباعة. التنزيل الحالي بصيغة نصية UTF-8 لتتمكن من فتحها وتنسيقها في محرر مستندات.</p>
          </section>
        </div>

        <footer style={{ ...panel, marginTop: 16, color: "#91aab6", fontSize: 12, lineHeight: 1.9 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#bfe9e3", marginBottom: 5 }}><ShieldCheck size={16} /> الخصوصية</div>
          لا يتم إرسال البيانات إلى خادم أو حفظها في حساب. تجنب إدخال رقمك القومي أو بياناتك البنكية أو معلومات لا تحتاجها جهة التوظيف. راجع بيانات التواصل قبل مشاركة السيرة الذاتية.
        </footer>
      </div>
    </main>
  );
}
