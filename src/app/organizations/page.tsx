"use client";

import Link from "next/link";
import { useState } from "react";
import { Building2, ShieldCheck, Handshake, GraduationCap, BriefcaseBusiness, HeartHandshake, Globe2, ArrowLeft, Send, CheckCircle2 } from "lucide-react";

const tracks = [
  { icon: HeartHandshake, title: "الإغاثة والمساندة الإنسانية", text: "الجمعيات والمؤسسات التي تقدم دعمًا غذائيًا أو اجتماعيًا أو إغاثيًا للأسر." },
  { icon: GraduationCap, title: "التعليم والتدريب", text: "المؤسسات التعليمية ومبادرات محو الأمية والمنح والتدريب المهني." },
  { icon: BriefcaseBusiness, title: "العمل والتمكين الاقتصادي", text: "جهات التدريب والتوظيف ودعم المشروعات الصغيرة وريادة الأعمال." },
  { icon: Globe2, title: "الصحة والتعافي المجتمعي", text: "الجهات الصحية والتأهيلية المرخصة وبرامج الدعم المجتمعي المتخصصة." },
];
const steps = [
  ["استلام الطلب", "تُحفظ بيانات المنظمة داخل المنصة برقم طلب وتاريخ استلام."],
  ["مراجعة وتحقق", "يراجع فريق HUMANITY ONE الهوية والصفة القانونية ومصادر المعلومات."],
  ["اتفاق وموافقة", "تُحدد الخدمات ونطاق التعاون وآلية الإحالات ومشاركة البيانات كتابةً."],
  ["تفعيل التعاون", "لا يبدأ التعاون إلا بعد الموافقة والتحقق واستكمال الاتفاق."],
];
const field: React.CSSProperties = { width: "100%", padding: 13, borderRadius: 10, border: "1px solid #38515c", background: "#071923", color: "#f0f7f8", outline: "none" };
const label: React.CSSProperties = { display: "grid", gap: 7, color: "#c7d6dc", fontSize: 14 };

export default function OrganizationsPage() {
  const [form, setForm] = useState({ organizationName: "", contactName: "", email: "", country: "", city: "", category: "الإغاثة والمساندة الإنسانية", website: "", areas: "", description: "", consent: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ id: string; message: string } | null>(null);
  function update(key: keyof typeof form, value: string | boolean) { setForm(old => ({ ...old, [key]: value })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(""); setSuccess(null);
    try {
      const response = await fetch("/api/organizations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "تعذر إرسال الطلب.");
      setSuccess({ id: result.application.id, message: result.message });
      setForm({ organizationName: "", contactName: "", email: "", country: "", city: "", category: "الإغاثة والمساندة الإنسانية", website: "", areas: "", description: "", consent: false });
    } catch (e) { setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع."); }
    finally { setBusy(false); }
  }

  return <main dir="rtl" lang="ar" style={{ minHeight: "100vh", background: "#07131d", color: "#e8f2f5", fontFamily: "Cairo,system-ui,sans-serif", padding: "28px 16px 64px" }}>
    <div style={{ maxWidth: 1080, margin: "0 auto" }}>
      <Link href="/" style={{ color: "#83d9ce", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}><ArrowLeft size={17}/> العودة إلى HUMANITY ONE</Link>
      <section style={{ marginTop: 24, padding: "clamp(24px,5vw,52px)", border: "1px solid #294653", borderRadius: 24, background: "radial-gradient(circle at 10% 0%,#17404a 0,transparent 42%),#0c202b" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#8ce0d5", fontWeight: 800, fontSize: 13 }}><Handshake size={18}/> شبكة التعاون الإنساني</div>
        <h1 style={{ fontSize: "clamp(30px,5vw,48px)", lineHeight: 1.25, margin: "18px 0 14px" }}>منظمات مستقلة، وجهد إنساني متصل</h1>
        <p style={{ fontSize: 18, lineHeight: 1.9, color: "#c1d2d9", maxWidth: 760, margin: 0 }}>تسعى HUMANITY ONE إلى بناء شبكة تربط المؤسسات والجمعيات الموثوقة بالفرص والاحتياجات الإنسانية، مع احترام استقلال كل منظمة وخصوصية كل مستفيد.</p>
        <a href="#application" style={{ marginTop: 24, background: "#54c8ba", color: "#062027", padding: "13px 20px", borderRadius: 11, fontWeight: 900, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 9 }}><Send size={18}/> تقديم طلب انضمام عبر الموقع</a>
        <p style={{ fontSize: 12, color: "#9fb6bf", marginTop: 16 }}>إرسال الطلب لا يعني قبول المنظمة أو اعتمادها شريكًا.</p>
      </section>
      <section style={{ marginTop: 42 }}>
        <h2 style={{ fontSize: 26, marginBottom: 8 }}>من يمكنه الانضمام؟</h2>
        <p style={{ color: "#a9bec7", lineHeight: 1.8, marginTop: 0 }}>نرحب بالجهات ذات الصفة الواضحة والأنشطة القابلة للتحقق، في المجالات التالية:</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,230px),1fr))", gap: 14, marginTop: 18 }}>
          {tracks.map(({ icon: Icon, title, text }) => <article key={title} style={{ background: "#0d202b", border: "1px solid #29414d", borderRadius: 16, padding: 20 }}><Icon size={25} color="#83d9ce"/><h3 style={{ fontSize: 18, margin: "14px 0 8px" }}>{title}</h3><p style={{ color: "#a9bec7", lineHeight: 1.8, margin: 0, fontSize: 14 }}>{text}</p></article>)}
        </div>
      </section>
      <section id="application" style={{ marginTop: 42, padding: 24, border: "1px solid #34515c", borderRadius: 18, background: "#0b1c26" }}>
        <h2 style={{ fontSize: 25, marginTop: 0 }}>نموذج طلب انضمام منظمة</h2>
        <p style={{ color: "#a9bec7", lineHeight: 1.8 }}>املأ البيانات التالية. سيُحفظ الطلب في قاعدة بيانات المنصة ويظهر لفريق الإدارة للمراجعة.</p>
        {success && <div role="status" style={{ padding: 16, borderRadius: 12, background: "#10382f", border: "1px solid #397d6b", color: "#b8f2df", marginBottom: 16 }}><CheckCircle2 size={20} style={{ verticalAlign: "middle", marginLeft: 7 }}/><b>تم استلام طلبك بنجاح.</b><p style={{ marginBottom: 0 }}>{success.message}</p><small>رقم الطلب: {success.id}</small></div>}
        {error && <p role="alert" style={{ color: "#ffaaaa", padding: 12, background: "#351d25", borderRadius: 9 }}>{error}</p>}
        <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 14 }}>
          <label style={label}>الاسم القانوني للمنظمة *<input required minLength={3} maxLength={160} value={form.organizationName} onChange={e => update("organizationName", e.target.value)} style={field} placeholder="اسم المنظمة كما هو في مستنداتها"/></label>
          <label style={label}>اسم مسؤول التواصل *<input required minLength={2} maxLength={100} value={form.contactName} onChange={e => update("contactName", e.target.value)} style={field}/></label>
          <label style={label}>البريد الإلكتروني الرسمي *<input required type="email" maxLength={254} value={form.email} onChange={e => update("email", e.target.value)} style={field} placeholder="name@organization.org"/></label>
          <label style={label}>البلد *<input required minLength={2} maxLength={80} value={form.country} onChange={e => update("country", e.target.value)} style={field}/></label>
          <label style={label}>المدينة *<input required minLength={2} maxLength={80} value={form.city} onChange={e => update("city", e.target.value)} style={field}/></label>
          <label style={label}>مجال المنظمة *<select value={form.category} onChange={e => update("category", e.target.value)} style={field}>{tracks.map(t => <option key={t.title}>{t.title}</option>)}</select></label>
          <label style={label}>الموقع الرسمي أو صفحة موثوقة (اختياري)<input type="url" maxLength={300} value={form.website} onChange={e => update("website", e.target.value)} style={field} placeholder="https://"/></label>
          <label style={{ ...label, gridColumn: "1 / -1" }}>مجالات العمل والخدمات *<input required minLength={5} maxLength={500} value={form.areas} onChange={e => update("areas", e.target.value)} style={field} placeholder="مثال: التوظيف، التدريب، المساعدات الغذائية"/></label>
          <label style={{ ...label, gridColumn: "1 / -1" }}>نبذة عن المنظمة ونطاق خدماتها *<textarea required minLength={20} maxLength={2500} rows={5} value={form.description} onChange={e => update("description", e.target.value)} style={{ ...field, resize: "vertical" }}/></label>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, gridColumn: "1 / -1", color: "#c7d6dc", lineHeight: 1.8 }}><input type="checkbox" required checked={form.consent} onChange={e => update("consent", e.target.checked)} style={{ marginTop: 6 }}/> أوافق على استخدام بيانات التواصل الواردة في هذا الطلب لمراجعته والتواصل معي بشأن إجراءات التحقق والانضمام.</label>
          <button type="submit" disabled={busy} style={{ gridColumn: "1 / -1", padding: 14, border: 0, borderRadius: 10, background: busy ? "#476c6a" : "#54c8ba", color: "#062027", fontWeight: 900, fontSize: 16, cursor: busy ? "wait" : "pointer" }}>{busy ? "جارٍ إرسال الطلب..." : "إرسال طلب الانضمام"}</button>
        </form>
      </section>
      <section id="verification" style={{ marginTop: 42, padding: 24, border: "1px solid #34515c", borderRadius: 18, background: "#0b1c26" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}><ShieldCheck color="#83d9ce" size={24}/><h2 style={{ fontSize: 24, margin: 0 }}>الثقة والتحقق قبل الشراكة</h2></div>
        <p style={{ color: "#b8cbd2", lineHeight: 1.9 }}>لن تظهر أي جهة على أنها «منظمة شريكة معتمدة» لمجرد إرسال طلب. يلزم التحقق من الاسم القانوني والتسجيل أو الترخيص حيث ينطبق، وموقع الجهة ووسائل اتصالها الرسمية، ومراجعة نطاق خدماتها وموافقتها المكتوبة على التعاون.</p>
        <ul style={{ color: "#c7d6dc", lineHeight: 2, paddingRight: 22 }}><li>لا ننشر فرصًا أو مساعدات غير مؤكدة.</li><li>لا نشارك بيانات المستفيدين مع جهة دون موافقتهم الصريحة.</li><li>لا نضمن قبول أي طلب مساعدة أو توفير تمويل.</li><li>تظل كل منظمة مستقلة ومسؤولة عن خدماتها وقراراتها.</li></ul>
      </section>
      <section style={{ marginTop: 42 }}>
        <h2 style={{ fontSize: 26, marginBottom: 18 }}>رحلة الانضمام والتعاون</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: 12 }}>
          {steps.map(([title, text], i) => <article key={title} style={{ padding: 18, borderRadius: 14, background: "#0d202b", border: "1px solid #29414d" }}><div style={{ color: "#83d9ce", fontWeight: 900, fontSize: 13 }}>المرحلة {i + 1}</div><h3 style={{ margin: "8px 0", fontSize: 18 }}>{title}</h3><p style={{ margin: 0, color: "#a9bec7", fontSize: 14, lineHeight: 1.8 }}>{text}</p></article>)}
        </div>
      </section>
      <footer style={{ marginTop: 32, textAlign: "center", fontSize: 12, color: "#78929d" }}>HUMANITY ONE · شبكة تعاون إنساني قيد التأسيس</footer>
    </div>
  </main>;
}
