"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Target, GraduationCap, BriefcaseBusiness, Lightbulb, Clock3, Download, RefreshCw, CheckCircle2, Circle, ShieldCheck } from "lucide-react";

type Profile = { skills: string; education: string; goal: string; hours: string; interest: string; internet: string; location: string };
type Step = { id: string; week: number; title: string; detail: string; done: boolean };
type SavedPlan = { profile: Profile; steps: Step[]; createdAt: string };
const KEY = "humanity-one-personal-plan-v1";
const blank: Profile = { skills: "", education: "ثانوي أو ما يعادله", goal: "الحصول على عمل أو دخل", hours: "5", interest: "أي فرصة مناسبة", internet: "متاح", location: "" };

function makeSteps(p: Profile): Step[] {
  const skill = p.skills.trim() || "مهاراتك الحالية";
  const focus = p.interest === "مشروع صغير" ? "مشروع صغير بتكلفة منخفضة" : p.interest === "عمل رقمي" ? "العمل الرقمي" : p.interest === "حرفة أو عمل يدوي" ? "حرفة أو عمل يدوي" : "فرص العمل المناسبة";
  const internet = p.internet === "غير متاح بانتظام" ? "ابحث عن مركز شباب أو مكتبة عامة أو مكان يتيح اتصالًا مجانيًا" : "استخدم هاتفك أو جهازك للبحث والتعلم";
  const hours = Math.max(2, Math.min(20, Number(p.hours) || 5));
  return [
    { id: "w1a", week: 1, title: "جرد المهارات والإمكانات", detail: `اكتب 5 أشياء تستطيع القيام بها، ومنها: ${skill}. حدّد الأدوات المتاحة والوقت الذي يمكنك الالتزام به.`, done: false },
    { id: "w1b", week: 1, title: "اختيار مسار واحد", detail: `ابدأ بمسار واضح: ${focus}. لا تدفع مقابل تدريب أو توظيف قبل التحقق من الجهة والشروط.`, done: false },
    { id: "w2a", week: 2, title: "تعلم مهارة صغيرة قابلة للتطبيق", detail: `خصص نحو ${hours} ساعات أسبوعيًا لتعلم مهارة مرتبطة بهدفك: ${p.goal}. اختر درسًا مجانيًا وطبّق ما تتعلمه.`, done: false },
    { id: "w2b", week: 2, title: "إنشاء نموذج عمل", detail: "أنجز مثالًا عمليًا واحدًا يثبت مهارتك: تصميم، كتابة، إصلاح، منتج تجريبي أو خدمة بسيطة.", done: false },
    { id: "w3a", week: 3, title: "تجهيز ملف التقديم", detail: "اكتب سيرة ذاتية قصيرة أو صفحة تعرض مهاراتك ونموذج عملك ووسيلة تواصل آمنة.", done: false },
    { id: "w3b", week: 3, title: "التواصل مع جهات موثوقة", detail: `${internet}. راجع مركز الفرص في HUMANITY ONE وقدّم فقط عبر القنوات الرسمية.`, done: false },
    { id: "w4a", week: 4, title: "تنفيذ محاولات واقعية", detail: "قدّم على فرص مناسبة أو اعرض خدمتك على نطاق صغير. سجّل الردود وما تعلمته دون دفع أموال لوسطاء.", done: false },
    { id: "w4b", week: 4, title: "مراجعة النتائج وتعديل المسار", detail: "راجع ما أنجزته، وحدد العقبة الأكبر، ثم اختر خطوة واحدة للأسبوع التالي. عدم الحصول على رد ليس فشلًا؛ عدّل الطريقة واستمر.", done: false },
  ];
}

export default function PersonalPlanPage() {
  const [profile, setProfile] = useState<Profile>(blank);
  const [plan, setPlan] = useState<SavedPlan | null>(null);
  const [ready, setReady] = useState(false);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedPlan;
        if (parsed && parsed.profile && Array.isArray(parsed.steps)) { setPlan(parsed); setProfile(parsed.profile); }
      }
    } catch { localStorage.removeItem(KEY); }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && plan) localStorage.setItem(KEY, JSON.stringify(plan));
    if (ready && !plan) localStorage.removeItem(KEY);
  }, [plan, ready]);

  const completed = useMemo(() => plan?.steps.filter(s => s.done).length ?? 0, [plan]);
  const field: React.CSSProperties = { width: "100%", minWidth: 0, boxSizing: "border-box", border: "1px solid #294454", borderRadius: 10, padding: "12px", background: "#0a1b27", color: "#eef7f8", font: "inherit" };
  const panel: React.CSSProperties = { background: "rgba(17,38,52,.9)", border: "1px solid rgba(132,177,190,.18)", borderRadius: 16, padding: 18 };
  const button: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, border: "1px solid #3b7f78", borderRadius: 10, padding: "11px 15px", background: "#174c49", color: "#eafff9", cursor: "pointer", font: "inherit" };

  function generate(e: React.FormEvent) {
    e.preventDefault();
    const next: SavedPlan = { profile, steps: makeSteps(profile), createdAt: new Date().toISOString() };
    setPlan(next); setGenerated(true);
  }
  function exportPlan() {
    if (!plan) return;
    const blob = new Blob([JSON.stringify(plan, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = "humanity-one-personal-plan.json"; a.click(); URL.revokeObjectURL(url);
  }

  return <main dir="rtl" style={{ minHeight: "100vh", padding: "clamp(18px,4vw,48px)", color: "#e8f1f5", background: "linear-gradient(145deg,#07131d,#0b1d2b 58%,#102a34)" }}>
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#8bded2", textDecoration: "none", marginBottom: 24 }}><ArrowRight size={17} /> العودة إلى HUMANITY ONE</Link>
      <header style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, color: "#83d9ce", fontSize: 13 }}><Target size={18} /> خطوات عملية تناسب ظروفك</div>
        <h1 style={{ fontSize: "clamp(27px,4vw,39px)", margin: "9px 0" }}>خطتي لتحسين حياتي</h1>
        <p style={{ color: "#a9bdc8", lineHeight: 1.9, maxWidth: 760, margin: 0 }}>أجب عن أسئلة بسيطة لتحصل على خطة أولية لمدة 4 أسابيع للتعلم والعمل أو بدء مشروع صغير. لا نطلب اسمك أو رقمك القومي أو بياناتك البنكية.</p>
      </header>

      {!plan && <form onSubmit={generate} style={{ ...panel, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,250px),1fr))", gap: 14 }}>
        <label style={{ display: "grid", gap: 7, color: "#c5d6dd", fontSize: 13 }}>ما المهارات التي تمتلكها حاليًا؟
          <textarea maxLength={500} rows={3} value={profile.skills} onChange={e => setProfile({ ...profile, skills: e.target.value })} placeholder="مثل: البيع، القيادة، الطبخ، الصيانة، الكمبيوتر..." style={{ ...field, resize: "vertical" }} />
        </label>
        <label style={{ display: "grid", gap: 7, color: "#c5d6dd", fontSize: 13 }}>مستوى التعليم
          <select value={profile.education} onChange={e => setProfile({ ...profile, education: e.target.value })} style={field}><option>بدون مؤهل رسمي</option><option>ابتدائي أو إعدادي</option><option>ثانوي أو ما يعادله</option><option>دبلوم فني</option><option>جامعي</option><option>دراسات عليا</option></select>
        </label>
        <label style={{ display: "grid", gap: 7, color: "#c5d6dd", fontSize: 13 }}>ما هدفك الأساسي؟
          <select value={profile.goal} onChange={e => setProfile({ ...profile, goal: e.target.value })} style={field}><option>الحصول على عمل أو دخل</option><option>تعلم مهارة جديدة</option><option>زيادة دخلي الحالي</option><option>بدء مشروع صغير</option><option>العودة إلى سوق العمل</option></select>
        </label>
        <label style={{ display: "grid", gap: 7, color: "#c5d6dd", fontSize: 13 }}>المجال الذي تفضله
          <select value={profile.interest} onChange={e => setProfile({ ...profile, interest: e.target.value })} style={field}><option>أي فرصة مناسبة</option><option>عمل رقمي</option><option>حرفة أو عمل يدوي</option><option>مشروع صغير</option></select>
        </label>
        <label style={{ display: "grid", gap: 7, color: "#c5d6dd", fontSize: 13 }}>الوقت المتاح أسبوعيًا (بالساعات)
          <select value={profile.hours} onChange={e => setProfile({ ...profile, hours: e.target.value })} style={field}><option value="2">ساعتان</option><option value="5">5 ساعات</option><option value="10">10 ساعات</option><option value="15">15 ساعة</option><option value="20">20 ساعة أو أكثر</option></select>
        </label>
        <label style={{ display: "grid", gap: 7, color: "#c5d6dd", fontSize: 13 }}>إمكانية الوصول إلى الإنترنت
          <select value={profile.internet} onChange={e => setProfile({ ...profile, internet: e.target.value })} style={field}><option>متاح</option><option>غير متاح بانتظام</option></select>
        </label>
        <label style={{ display: "grid", gap: 7, color: "#c5d6dd", fontSize: 13 }}>المحافظة أو المنطقة (اختياري)
          <input maxLength={100} value={profile.location} onChange={e => setProfile({ ...profile, location: e.target.value })} placeholder="اختياري لتسهيل البحث المحلي لاحقًا" style={field} />
        </label>
        <div style={{ gridColumn: "1 / -1", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
          <button type="submit" style={button}><Target size={17} /> أنشئ خطتي العملية</button>
          <span style={{ color: "#91aab6", fontSize: 12 }}>الخطة الأولية تُنشأ داخل جهازك دون إرسال إجاباتك إلى خادم.</span>
        </div>
      </form>}

      {plan && <section style={{ display: "grid", gap: 14 }}>
        <div style={{ ...panel, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div><div style={{ color: "#83d9ce", fontSize: 13 }}>خطة 4 أسابيع</div><h2 style={{ margin: "7px 0", fontSize: 21 }}>هدفك: {plan.profile.goal}</h2><p style={{ margin: 0, color: "#a9bdc8", fontSize: 13 }}>المجال: {plan.profile.interest} · الوقت المتاح: {plan.profile.hours} ساعات أسبوعيًا</p></div>
          <div style={{ minWidth: 125 }}><strong style={{ fontSize: 25, color: "#83d9ce" }}>{completed}/{plan.steps.length}</strong><div style={{ color: "#a9bdc8", fontSize: 12 }}>خطوات مكتملة</div><div style={{ height: 7, background: "#294454", borderRadius: 9, marginTop: 8, overflow: "hidden" }}><div style={{ width: (completed / plan.steps.length * 100) + "%", height: "100%", background: "#65c9b8" }} /></div></div>
        </div>
        {[1,2,3,4].map(week => <section key={week} style={panel}>
          <h3 style={{ margin: "0 0 13px", color: "#dff6f2", fontSize: 17 }}>الأسبوع {week}</h3>
          <div style={{ display: "grid", gap: 12 }}>{plan.steps.filter(s => s.week === week).map(step => <label key={step.id} style={{ display: "flex", alignItems: "start", gap: 10, cursor: "pointer" }}>
            <input type="checkbox" checked={step.done} onChange={e => setPlan(current => current ? { ...current, steps: current.steps.map(s => s.id === step.id ? { ...s, done: e.target.checked } : s) } : current)} style={{ marginTop: 4, accentColor: "#65c9b8", width: 17, height: 17 }} />
            <span style={{ flex: 1 }}><strong style={{ color: step.done ? "#83d9ce" : "#edf6f7", textDecoration: step.done ? "line-through" : "none" }}>{step.title}</strong><span style={{ display: "block", color: "#a9bdc8", fontSize: 13, lineHeight: 1.8, marginTop: 4 }}>{step.detail}</span></span>
            {step.done ? <CheckCircle2 size={18} color="#83d9ce" /> : <Circle size={18} color="#7893a1" />}
          </label>)}</div>
        </section>)}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
          <button type="button" onClick={exportPlan} style={button}><Download size={16} /> تصدير خطتي</button>
          <button type="button" onClick={() => { setPlan(null); setGenerated(false); }} style={{ ...button, background: "transparent", borderColor: "#355365" }}><RefreshCw size={16} /> تعديل الإجابات وإنشاء خطة جديدة</button>
        </div>
      </section>}

      <footer style={{ ...panel, marginTop: 18, color: "#91aab6", fontSize: 12, lineHeight: 1.9 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#bfe9e3", marginBottom: 5 }}><ShieldCheck size={16} /> الخصوصية والواقعية</div>
        هذه خطة إرشادية أولية وليست وعدًا بوظيفة أو دخل أو تمويل. لا تتطلب دفع رسوم. تحقق من أي جهة قبل مشاركة بياناتك أو قبول عرض. تُحفظ الخطة على هذا الجهاز والمتصفح فقط ويمكنك تصدير نسخة منها.
      </footer>
    </div>
  </main>;
}
