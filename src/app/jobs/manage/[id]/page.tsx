"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, LockKeyhole, RefreshCw, Users } from "lucide-react";

type Application = {
  id: string;
  applicantName: string;
  phone: string;
  experience: string | null;
  message: string | null;
  createdAt: string;
};
type Job = {
  id: string;
  jobTitle: string;
  businessName: string;
  city: string;
  status: string;
  applications: Application[];
};

const panel: React.CSSProperties = { background: "rgba(17,38,52,.94)", border: "1px solid rgba(132,177,190,.2)", borderRadius: 14, padding: 17 };
const button: React.CSSProperties = { border: 0, borderRadius: 9, padding: "10px 13px", background: "#17645b", color: "white", font: "inherit", cursor: "pointer" };

export default function EmployerApplicationsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [token, setToken] = useState("");
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load(accessToken: string) {
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/jobs/${encodeURIComponent(id)}/applications`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذر تحميل الطلبات.");
      setJob(data.job);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    const storageKey = `humanity-one-employer-${id}`;
    const fromLink = window.location.hash.slice(1);
    const saved = fromLink || window.sessionStorage.getItem(storageKey) || "";
    if (fromLink) {
      window.sessionStorage.setItem(storageKey, fromLink);
      window.history.replaceState(null, "", window.location.pathname);
    }
    if (!saved) {
      setError("لم نعثر على رمز الدخول الخاص بهذا الإعلان. افتح رابط المتابعة الأصلي الذي ظهر بعد نشر الوظيفة.");
      setLoading(false);
      return;
    }
    setToken(saved);
    void load(saved);
  }, [id]);

  return <main dir="rtl" style={{ minHeight: "100vh", padding: "clamp(18px,4vw,44px)", color: "#e8f1f5", background: "linear-gradient(145deg,#07131d,#0b1d2b 58%,#102a34)" }}>
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <Link href="/jobs" style={{ color: "#8bded2", display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 22 }}><ArrowRight size={17}/> سوق العمل</Link>
      <div style={{ display: "flex", gap: 9, alignItems: "center", color: "#82d9cd" }}><LockKeyhole size={18}/> مساحة خاصة بصاحب الإعلان</div>
      <h1 style={{ fontSize: "clamp(27px,4vw,38px)", margin: "9px 0" }}>متابعة المتقدمين للوظيفة</h1>
      <p style={{ color: "#a9bdc8", lineHeight: 1.9 }}>هذه الصفحة لا تظهر للعامة. الدخول يتم برابط سري أُنشئ عند نشر الإعلان، ولا نعرض بيانات المتقدمين إلا لصاحب الرابط.</p>
      {loading && <section style={panel}>جارٍ تحميل طلبات التقديم...</section>}
      {error && <section role="alert" style={{ ...panel, color: "#ffb4a8", lineHeight: 1.9 }}>{error}<p style={{ color: "#a9bdc8", fontSize: 13 }}>إذا فقدت الرابط السري، لأمان بيانات العمال لن نعرض الطلبات دون إثبات ملكية الإعلان.</p></section>}
      {job && <>
        <section style={{ ...panel, marginBottom: 14 }}>
          <div style={{ color: "#82d9cd", fontSize: 13 }}>{job.businessName} · {job.city}</div>
          <h2 style={{ margin: "7px 0" }}>{job.jobTitle}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#b5c7cf" }}><Users size={17}/> {job.applications.length} طلب تقديم معروض (بحد أقصى 100)</div>
        </section>
        <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}><button type="button" onClick={() => void load(token)} style={{ ...button, display: "inline-flex", alignItems: "center", gap: 7 }}><RefreshCw size={16}/> تحديث الطلبات</button></div>
        {job.applications.length === 0 ? <section style={panel}>لم يصل أي طلب تقديم بعد. سنعرض الطلبات الجديدة هنا عند تحديث الصفحة.</section> :
          <section style={{ display: "grid", gap: 12 }}>
            {job.applications.map((application, index) => <article key={application.id} style={panel}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                <strong style={{ color: "#f3fbfc" }}>{index + 1}. {application.applicantName}</strong>
                <span style={{ color: "#91aab6", fontSize: 12 }}>{new Date(application.createdAt).toLocaleString("ar-EG")}</span>
              </div>
              <p style={{ margin: "10px 0", color: "#bfe9e3" }}>الهاتف: <a href={`tel:${application.phone}`} style={{ color: "#8bded2" }}>{application.phone}</a></p>
              {application.experience && <p style={{ color: "#c5d6dd", whiteSpace: "pre-wrap", lineHeight: 1.8 }}>الخبرة والمهارات: {application.experience}</p>}
              {application.message && <p style={{ color: "#c5d6dd", whiteSpace: "pre-wrap", lineHeight: 1.8 }}>رسالة المتقدم: {application.message}</p>}
            </article>)}
          </section>}
      </>}
      <footer style={{ ...panel, marginTop: 18, color: "#91aab6", fontSize: 12, lineHeight: 1.9 }}>احفظ رابط المتابعة في مكان آمن، ولا ترسله في مجموعات عامة. بيانات العمال أمانة: استخدمها فقط للتواصل بشأن هذه الوظيفة، ولا تطلب رسومًا من المتقدمين.</footer>
    </div>
  </main>;
}
