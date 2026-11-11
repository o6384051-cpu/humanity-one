"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";

const input: React.CSSProperties = { width: "100%", boxSizing: "border-box", background: "#0a1b27", border: "1px solid #355365", borderRadius: 10, padding: 12, color: "#eef7f8", font: "inherit" };
const label: React.CSSProperties = { display: "grid", gap: 6, color: "#c5d6dd", fontSize: 13 };
const businessTypes = ["مصنع","ورشة","مطعم","شركة","محل تجاري","مقاول","مزرعة","أخرى"];
const experienceLevels = ["لا يشترط خبرة","حديث الخبرة","خبرة سنة إلى 3 سنوات","خبرة أكثر من 3 سنوات"];
const educationLevels = ["لا يشترط مؤهل","إعدادية أو أقل","دبلوم فني","مؤهل متوسط","مؤهل عالٍ","حسب متطلبات المهنة"];
const salaryPeriods = ["يومي","أسبوعي","شهري","حسب الاتفاق"];
const employmentTypes = ["دوام كامل","دوام جزئي","عمل يومي","مؤقت","بالقطعة"];

export default function PostJobPage() {
  const [values, setValues] = useState<Record<string,string>>({
    employerName:"", businessType:"مصنع", businessName:"", city:"", area:"", contactPhone:"", contactEmail:"",
    jobTitle:"", description:"", skills:"", experienceLevel:"لا يشترط خبرة", educationRequirement:"لا يشترط مؤهل",
    salaryMin:"", salaryMax:"", salaryPeriod:"شهري", employmentType:"دوام كامل", shift:"", openings:"1", website:""
  });
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState("");
  const [success,setSuccess] = useState(false);
  function change(key:string,value:string) { setValues(old => ({...old,[key]:value})); }
  async function submit(event:React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage(""); setSuccess(false);
    const numeric = (value:string) => value.trim() === "" ? null : Number(value);
    try {
      const response = await fetch("/api/jobs", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({
        ...values, salaryMin:numeric(values.salaryMin), salaryMax:numeric(values.salaryMax), openings:Number(values.openings)
      })});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذر إرسال الإعلان.");
      setSuccess(true); setMessage(data.message || "تم استلام إعلانك للمراجعة.");
    } catch(error) { setMessage(error instanceof Error ? error.message : "حدث خطأ غير متوقع."); }
    finally { setBusy(false); }
  }
  const select = (key:string, options:string[]) => <select value={values[key]} onChange={e=>change(key,e.target.value)} style={input}>{options.map(item=><option key={item}>{item}</option>)}</select>;
  return <main dir="rtl" style={{ minHeight:"100vh", padding:"clamp(18px,4vw,48px)", color:"#e8f1f5", background:"linear-gradient(145deg,#07131d,#0b1d2b 58%,#102a34)" }}>
    <div style={{ maxWidth:850, margin:"0 auto" }}>
      <Link href="/jobs" style={{ color:"#8bded2", display:"inline-flex", gap:8, alignItems:"center", textDecoration:"none", marginBottom:22 }}><ArrowRight size={17}/> العودة إلى الوظائف</Link>
      <h1 style={{ color:"#f3fbfc", fontSize:"clamp(27px,4vw,38px)" }}>أضف فرصة عمل حقيقية</h1>
      <p style={{ color:"#a9bdc8", lineHeight:1.9 }}>أعلن عن احتياج مصنعك أو ورشتك أو نشاطك مجانًا. كل إعلان يُراجع قبل ظهوره للباحثين عن عمل. لا توجد نقاط أو رسوم نشر.</p>
      {success ? <section role="status" style={{ padding:22, background:"#112f31", borderRadius:14, lineHeight:1.9 }}><strong style={{ color:"#9ce4d6" }}>{message}</strong><p>سيظهر الإعلان في سوق العمل بعد مراجعته. شكرًا لمساعدتك في إتاحة فرصة عمل حقيقية.</p><Link href="/jobs" style={{ color:"#8bded2" }}>العودة إلى الوظائف ←</Link></section> :
      <form onSubmit={submit} style={{ display:"grid", gap:15, padding:18, background:"rgba(17,38,52,.92)", border:"1px solid rgba(132,177,190,.2)", borderRadius:16 }}>
        <h2 style={{ margin:0, color:"#82d9cd" }}>بيانات صاحب العمل والمنشأة</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:12 }}>
          <label style={label}>اسم المسؤول عن الإعلان<input required minLength={2} maxLength={100} value={values.employerName} onChange={e=>change("employerName",e.target.value)} style={input}/></label>
          <label style={label}>نوع النشاط{select("businessType",businessTypes)}</label>
          <label style={label}>اسم المنشأة<input required minLength={2} maxLength={120} value={values.businessName} onChange={e=>change("businessName",e.target.value)} style={input}/></label>
          <label style={label}>المحافظة / المدينة<input required minLength={2} maxLength={80} value={values.city} onChange={e=>change("city",e.target.value)} style={input}/></label>
          <label style={label}>المنطقة / العنوان المختصر<input maxLength={100} value={values.area} onChange={e=>change("area",e.target.value)} style={input}/></label>
          <label style={label}>هاتف التواصل<input required value={values.contactPhone} onChange={e=>change("contactPhone",e.target.value)} style={input}/></label>
          <label style={label}>البريد الإلكتروني (اختياري)<input type="email" value={values.contactEmail} onChange={e=>change("contactEmail",e.target.value)} style={input}/></label>
        </div>
        <h2 style={{ margin:"8px 0 0", color:"#82d9cd" }}>تفاصيل الوظيفة</h2>
        <label style={label}>المسمى الوظيفي<input required minLength={2} maxLength={120} value={values.jobTitle} onChange={e=>change("jobTitle",e.target.value)} placeholder="مثال: عامل إنتاج، كهربائي، عامل مطعم" style={input}/></label>
        <label style={label}>وصف العمل والمهام<textarea required minLength={20} maxLength={2500} rows={5} value={values.description} onChange={e=>change("description",e.target.value)} style={input}/></label>
        <label style={label}>المهارات المطلوبة (اختياري)<input maxLength={500} value={values.skills} onChange={e=>change("skills",e.target.value)} style={input}/></label>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:12 }}>
          <label style={label}>الخبرة{select("experienceLevel",experienceLevels)}</label>
          <label style={label}>المؤهل المطلوب{select("educationRequirement",educationLevels)}</label>
          <label style={label}>نوع العمل{select("employmentType",employmentTypes)}</label>
          <label style={label}>الوردية / المواعيد<input maxLength={100} value={values.shift} onChange={e=>change("shift",e.target.value)} placeholder="مثال: صباحي، 8 ساعات" style={input}/></label>
          <label style={label}>الحد الأدنى للأجر (جنيه)<input type="number" min="0" max="10000000" value={values.salaryMin} onChange={e=>change("salaryMin",e.target.value)} style={input}/></label>
          <label style={label}>الحد الأعلى للأجر (جنيه)<input type="number" min="0" max="10000000" value={values.salaryMax} onChange={e=>change("salaryMax",e.target.value)} style={input}/></label>
          <label style={label}>فترة الأجر{select("salaryPeriod",salaryPeriods)}</label>
          <label style={label}>عدد العمال المطلوبين<input required type="number" min="1" max="500" value={values.openings} onChange={e=>change("openings",e.target.value)} style={input}/></label>
        </div>
        <label style={{ display:"flex", alignItems:"flex-start", gap:9, color:"#c5d6dd", fontSize:13, lineHeight:1.8 }}><input required type="checkbox" style={{ marginTop:5 }}/> أقر بأن بيانات المنشأة والوظيفة صحيحة، وأنه لا توجد رسوم على العامل مقابل التقديم أو الحصول على الوظيفة.</label>
        <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={values.website} onChange={e=>change("website",e.target.value)} style={{ position:"absolute", opacity:0, pointerEvents:"none", height:0, width:0 }}/>
        {message && <p role="alert" style={{ color:"#ffb4a8", margin:0 }}>{message}</p>}
        <button disabled={busy} style={{ border:0,borderRadius:10,padding:13,background:"#17645b",color:"white",font:"inherit",fontWeight:700,cursor:"pointer" }}>{busy ? "جارٍ إرسال الإعلان..." : "إرسال الإعلان للمراجعة مجانًا"}</button>
      </form>}
      <footer style={{ marginTop:18, padding:15, background:"#0a1b27", borderRadius:12, color:"#91aab6", fontSize:12, lineHeight:1.9 }}><ShieldCheck size={16} style={{ verticalAlign:"middle", marginLeft:6 }}/> لا تظهر بيانات الهاتف أو البريد للعامة. لا ننشر الإعلان قبل المراجعة، لكن المراجعة لا تعني ضمان الوظيفة أو التحقق القانوني الكامل من المنشأة.</footer>
    </div>
  </main>;
}
