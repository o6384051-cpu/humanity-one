"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BriefcaseBusiness, Search, ShieldCheck } from "lucide-react";

type Job = {
  id: string; businessType: string; businessName: string; city: string; area: string | null;
  jobTitle: string; description: string; skills: string | null; experienceLevel: string;
  educationRequirement: string; salaryMin: number | null; salaryMax: number | null;
  salaryPeriod: string; employmentType: string; shift: string | null; openings: number;
  createdAt: string;
};

const field: React.CSSProperties = { width: "100%", boxSizing: "border-box", background: "#0a1b27", border: "1px solid #355365", borderRadius: 10, padding: 12, color: "#eef7f8", font: "inherit" };
const button: React.CSSProperties = { border: 0, borderRadius: 10, padding: "11px 16px", background: "#17645b", color: "white", cursor: "pointer", font: "inherit", fontWeight: 700 };

function ApplicationForm({ job, onClose }: { job: Job; onClose: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setResult("");
    try {
      const response = await fetch("/api/jobs/apply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId: job.id, applicantName: name, phone, experience, message, website: "" }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذر إرسال الطلب.");
      setResult(data.message || "تم إرسال طلبك بنجاح.");
      setName(""); setPhone(""); setExperience(""); setMessage("");
    } catch (error) { setResult(error instanceof Error ? error.message : "حدث خطأ غير متوقع."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} style={{ display: "grid", gap: 10, marginTop: 14, padding: 14, background: "#071722", borderRadius: 12 }}>
    <strong>التقديم على: {job.jobTitle}</strong>
    <input required minLength={2} maxLength={100} value={name} onChange={e => setName(e.target.value)} placeholder="اسمك" style={field} />
    <input required value={phone} onChange={e => setPhone(e.target.value)} placeholder="رقم هاتف للتواصل" style={field} />
    <textarea maxLength={1200} value={experience} onChange={e => setExperience(e.target.value)} placeholder="خبرتك العملية أو الحرفة التي تتقنها (اختياري)" rows={3} style={field} />
    <textarea maxLength={1200} value={message} onChange={e => setMessage(e.target.value)} placeholder="رسالة لصاحب العمل (اختياري)" rows={3} style={field} />
    <p style={{ margin: 0, color: "#9fb6c2", fontSize: 12, lineHeight: 1.7 }}>لن تظهر بياناتك الشخصية للعامة. تُحفظ بيانات التقديم داخل قاعدة المنصة ولا تُعرض إلا للمخولين. لا ترسل رقمك القومي أو بياناتك البنكية أو أي معلومات حساسة.</p>
    {result && <p role="status" style={{ color: "#9ce4d6", margin: 0 }}>{result}</p>}
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><button disabled={busy} style={button}>{busy ? "جارٍ الإرسال..." : "إرسال طلب التقديم"}</button><button type="button" onClick={onClose} style={{ ...button, background: "#294454" }}>إغلاق</button></div>
  </form>;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/jobs").then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذر تحميل الوظائف.");
      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
    }).catch(err => setError(err instanceof Error ? err.message : "تعذر تحميل الوظائف.")).finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => jobs.filter(job => {
    const text = [job.jobTitle, job.businessName, job.businessType, job.description, job.skills || "", job.city, job.area || ""].join(" ").toLocaleLowerCase("ar");
    return text.includes(query.trim().toLocaleLowerCase("ar")) && (!city || job.city.includes(city.trim()));
  }), [jobs, query, city]);

  return <main dir="rtl" style={{ minHeight: "100vh", padding: "clamp(18px,4vw,48px)", color: "#e8f1f5", background: "linear-gradient(145deg,#07131d,#0b1d2b 58%,#102a34)" }}>
    <div style={{ maxWidth: 1050, margin: "0 auto" }}>
      <Link href="/opportunities" style={{ color: "#8bded2", display: "inline-flex", gap: 8, alignItems: "center", textDecoration: "none", marginBottom: 22 }}><ArrowRight size={17} /> مركز الفرص</Link>
      <header style={{ marginBottom: 22 }}>
        <div style={{ color: "#82d9cd", display: "flex", gap: 8, alignItems: "center" }}><BriefcaseBusiness size={18} /> سوق العمل المباشر</div>
        <h1 style={{ color: "#f3fbfc", fontSize: "clamp(28px,4vw,40px)", margin: "10px 0" }}>وظائف من المصانع والورش وأصحاب الأعمال</h1>
        <p style={{ color: "#a9bdc8", lineHeight: 1.9 }}>فرص للعمال والحرفيين والفنيين وغيرهم. لا يشترط مؤهل جامعي إلا إذا كانت طبيعة الوظيفة تتطلب ذلك. نشر الوظائف والتقديم مجانيان.</p>
        <Link href="/jobs/post" style={{ ...button, display: "inline-block", textDecoration: "none" }}>أنا صاحب عمل — أضف وظيفة</Link>
      </header>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10, marginBottom: 18 }}>
        <label><span style={{ display: "block", marginBottom: 6, color: "#a9bdc8", fontSize: 13 }}>ابحث عن وظيفة أو حرفة أو منشأة</span><div style={{ position: "relative" }}><Search size={17} style={{ position: "absolute", right: 12, top: 14, color: "#91aab6" }} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="عامل إنتاج، كهربائي، نقاش..." style={{ ...field, paddingRight: 38 }} /></div></label>
        <label><span style={{ display: "block", marginBottom: 6, color: "#a9bdc8", fontSize: 13 }}>المحافظة / المدينة</span><input value={city} onChange={e => setCity(e.target.value)} placeholder="مثال: القاهرة، الجيزة..." style={field} /></label>
      </section>
      {loading && <p>جارٍ تحميل الوظائف...</p>}
      {error && <p role="alert" style={{ color: "#ffb4a8" }}>{error}</p>}
      {!loading && !error && visible.length === 0 && <section style={{ padding: 24, background: "#112634", borderRadius: 14, color: "#b5c7cf", lineHeight: 1.9 }}>لا توجد إعلانات منشورة تطابق البحث حاليًا. يمكنك العودة لاحقًا أو دعوة صاحب عمل لنشر فرصة حقيقية.</section>}
      <section style={{ display: "grid", gap: 14 }}>
        {visible.map(job => <article key={job.id} style={{ padding: 18, borderRadius: 15, background: "rgba(17,38,52,.92)", border: "1px solid rgba(132,177,190,.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}><span style={{ color: "#82d9cd", fontSize: 13 }}>{job.businessType} · {job.businessName}</span><span style={{ color: "#91aab6", fontSize: 12 }}>{new Date(job.createdAt).toLocaleDateString("ar-EG")}</span></div>
          <h2 style={{ color: "#f3fbfc", margin: "9px 0", fontSize: 21 }}>{job.jobTitle}</h2>
          <p style={{ color: "#b5c7cf", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{job.description}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "12px 0", color: "#c6d8de", fontSize: 12 }}>
            <span>الموقع: {job.city}{job.area ? " - " + job.area : ""}</span><span>• {job.employmentType}</span><span>• {job.experienceLevel}</span><span>• {job.educationRequirement}</span><span>• عدد المطلوب: {job.openings}</span>
          </div>
          <div style={{ color: "#9ce4d6", fontSize: 14, marginBottom: 12 }}>الأجر: {job.salaryMin != null || job.salaryMax != null ? [job.salaryMin, job.salaryMax].filter(v => v != null).join(" - ") + " جنيه " + job.salaryPeriod : "لم يحدد صاحب العمل الأجر"}</div>
          {job.shift && <p style={{ color: "#b5c7cf", fontSize: 13 }}>الوردية: {job.shift}</p>}
          {job.skills && <p style={{ color: "#b5c7cf", fontSize: 13 }}>المهارات المطلوبة: {job.skills}</p>}
          <button type="button" onClick={() => setSelected(selected === job.id ? null : job.id)} style={button}>{selected === job.id ? "إخفاء نموذج التقديم" : "قدّم على الوظيفة مجانًا"}</button>
          {selected === job.id && <ApplicationForm job={job} onClose={() => setSelected(null)} />}
        </article>)}
      </section>
      <footer style={{ marginTop: 22, padding: 15, borderRadius: 12, background: "#0a1b27", color: "#91aab6", fontSize: 12, lineHeight: 1.9 }}><ShieldCheck size={16} style={{ verticalAlign: "middle", marginLeft: 6 }} /> تُراجع الإعلانات قبل نشرها، لكن المراجعة لا تعني ضمان التوظيف. بيانات التقديم محفوظة داخل المنصة ولا تظهر للعامة. لا تدفع رسومًا للحصول على وظيفة أو مقابلة، ولا ترسل بياناتك البنكية أو رقمك القومي.</footer>
    </div>
  </main>;
}
