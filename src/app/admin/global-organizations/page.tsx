"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Globe2, ExternalLink, Copy, ShieldCheck, Mail } from "lucide-react";

const sources = [
  { name: "قاعدة الأمم المتحدة للمجتمع المدني iCSO", scope: "عالمي", detail: "قاعدة أممية للمنظمات والمجتمع المدني، مع فلاتر حسب الدولة ومجال النشاط واللغة والنطاق الجغرافي.", url: "https://esango.un.org/civilsociety/displayAdvancedSearch.do?method=search&sessionCheck=false", level: "رسمي أممي" },
  { name: "قائمة المنظمات المعتمدة لدى مكتب الأمم المتحدة في جنيف", scope: "عالمي", detail: "قائمة منشورة للمنظمات المعتمدة، تتضمن بيانات تعريف واتصال منشورة.", url: "https://www.ungeneva.org/en/engage/civil-society/ngo-list", level: "رسمي أممي" },
  { name: "Worldwide NGO Directory – WANGO", scope: "عالمي", detail: "دليل دولي يتيح التصفح حسب المناطق والبحث بالكلمات المفتاحية.", url: "https://www.wango.org/resources.aspx?section=ngodir", level: "دليل دولي" },
  { name: "Global Register of Nonprofit Data Sources – GRNDS", scope: "عالمي", detail: "فهرس لمصادر السجلات الحكومية الرسمية للمنظمات غير الربحية حسب الدول.", url: "https://www.grnds.org/", level: "مصادر سجلات وطنية" },
  { name: "Socially United – Organization Directory", scope: "عالمي", detail: "دليل قابل للبحث حسب المنطقة والدولة والقطاع؛ معظم السجلات عامة وليست كلها متحققًا منها.", url: "https://sociallyunited.org/directory/", level: "دليل عام – يحتاج تحقق" },
  { name: "UN Civil Society Organizations", scope: "عالمي", detail: "المنظمات المرتبطة بإدارة التواصل العالمي للأمم المتحدة.", url: "https://www.un.org/en/civil-society/list-csos-associated-department-global-communications", level: "رسمي أممي" },
];

const focusAreas = ["المساعدات والإغاثة", "مكافحة الفقر والتنمية", "التعليم والتدريب", "الصحة المجتمعية", "العمل وسبل العيش", "حقوق الإنسان", "الطفولة والأسرة", "ذوو الإعاقة", "البيئة والاستدامة", "التطوع والتنمية المحلية"];

export default function GlobalOrganizationOutreachPage() {
  const [keyword, setKeyword] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("Worldwide");
  const [focus, setFocus] = useState("المساعدات والإغاثة");
  const [language, setLanguage] = useState("Any language");
  const [copied, setCopied] = useState(false);

  const query = useMemo(() => [keyword, focus, country, region !== "Worldwide" ? region : "", "nonprofit NGO charity organization official website contact"].filter(Boolean).join(" "), [keyword, focus, country, region]);
  const searchUrl = "https://www.google.com/search?q=" + encodeURIComponent(query);
  const emailDraft = `السادة مسؤولي المنظمة المحترمين،

تحية طيبة من فريق HUMANITY ONE.

ندعو منظمتكم للتعرف على منظومة إنسانية مستقلة تهدف إلى ربط المنظمات والأفراد والجهات المتعاونة لتوسيع فرص العمل والتدريب والمبادرات والمساندة الإنسانية.

يوفر الانضمام الأساسي مساحة مجانية للتعريف برسالتكم وأنشطتكم وعرض فرص التعاون. لا توجد رسوم على الخدمات الإنسانية الأساسية، ولا نعلن أي جهة كشريك إلا بعد موافقتها والتحقق من بياناتها.

للتعرف على المنظومة وتقديم طلب الانضمام:
https://humanity-one-wc35.vercel.app/organizations

للتواصل:
humanityone.contact@gmail.com

مع خالص التقدير،
فريق HUMANITY ONE
الإنسان أولًا، والتعاون يصنع الأثر.`;

  async function copyInvite() {
    try { await navigator.clipboard.writeText(emailDraft); setCopied(true); window.setTimeout(() => setCopied(false), 2200); }
    catch { setCopied(false); }
  }

  return <main dir="rtl" style={{ minHeight: "100vh", background: "#07131d", color: "#e8f2f5", padding: 20, fontFamily: "Cairo,system-ui,sans-serif" }}>
    <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gap: 18 }}>
      <Link href="/admin" style={{ color: "#83d9ce", textDecoration: "none" }}>← العودة إلى لوحة الإدارة</Link>
      <header>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Globe2 size={28} color="#83d9ce"/><h1 style={{ fontSize: 28, margin: 0 }}>مركز استقطاب المنظمات الدولي</h1></div>
        <p style={{ color: "#a9bec7", lineHeight: 1.9 }}>ابحث عن منظمات المجتمع المدني حول العالم، افتح مصادرها الأصلية، ثم تواصل معها بدعوة واضحة ومحترمة للانضمام.</p>
      </header>

      <section style={{ background: "#10232e", border: "1px solid #29414d", borderRadius: 16, padding: 18, display: "grid", gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>البحث العالمي</h2>
        <label style={{ display: "grid", gap: 6 }}>كلمات البحث أو اسم المنظمة
          <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="مثال: refugee support, youth employment, food bank..." style={field}/>
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 10 }}>
          <label style={{ display: "grid", gap: 6 }}>الدولة
            <input value={country} onChange={e => setCountry(e.target.value)} placeholder="اتركها فارغة للبحث العالمي" style={field}/>
          </label>
          <label style={{ display: "grid", gap: 6 }}>النطاق الجغرافي
            <select value={region} onChange={e => setRegion(e.target.value)} style={field}>
              {["Worldwide","Africa","Middle East and North Africa","Asia and Pacific","Europe","North America","Latin America and Caribbean"].map(x => <option key={x}>{x}</option>)}
            </select>
          </label>
          <label style={{ display: "grid", gap: 6 }}>مجال العمل
            <select value={focus} onChange={e => setFocus(e.target.value)} style={field}>{focusAreas.map(x => <option key={x}>{x}</option>)}</select>
          </label>
          <label style={{ display: "grid", gap: 6 }}>لغة التواصل المفضلة
            <select value={language} onChange={e => setLanguage(e.target.value)} style={field}><option>Any language</option><option>Arabic</option><option>English</option><option>French</option><option>Spanish</option></select>
          </label>
        </div>
        <a href={searchUrl} target="_blank" rel="noopener noreferrer" style={{ ...action, textAlign: "center" }}><Search size={17}/> فتح نتائج البحث العالمي</a>
        <p style={{ color: "#9fb6bf", fontSize: 12, margin: 0 }}>يفتح البحث الخارجي باستخدام معاييرك. لا يتم استيراد النتائج تلقائيًا ولا تُحفظ في قاعدة بيانات HUMANITY ONE في هذه المرحلة.</p>
      </section>

      <section style={{ display: "grid", gap: 10 }}>
        <h2 style={{ fontSize: 20, margin: "4px 0" }}>مصادر البحث الدولية</h2>
        {sources.map((s) => <article key={s.name} style={{ background: "#0d202b", border: "1px solid #29414d", borderRadius: 13, padding: 15, display: "grid", gap: 7 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}><b>{s.name}</b><span style={{ color: "#83d9ce", fontSize: 12 }}>{s.level}</span></div>
          <p style={{ color: "#a9bec7", margin: 0, lineHeight: 1.7 }}>{s.detail}</p>
          <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: "#83d9ce", textDecoration: "none", width: "fit-content" }}>فتح المصدر <ExternalLink size={14} style={{ verticalAlign: "middle" }}/></a>
        </article>)}
      </section>

      <section style={{ background: "#10232e", border: "1px solid #29414d", borderRadius: 16, padding: 18, display: "grid", gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>رسالة دعوة المنظمات</h2>
        <p style={{ color: "#a9bec7", margin: 0 }}>انسخ الرسالة وعدّل اسم المنظمة واسم مسؤول التواصل قبل الإرسال. لا ترسل رسائل جماعية غير مطلوبة.</p>
        <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontFamily: "inherit", lineHeight: 1.8, background: "#071923", borderRadius: 10, padding: 14, color: "#dce9ed" }}>{emailDraft}</pre>
        <button type="button" onClick={() => void copyInvite()} style={action}><Copy size={16}/>{copied ? "تم نسخ الرسالة" : "نسخ رسالة الدعوة"}</button>
        <a href="mailto:humanityone.contact@gmail.com" style={{ ...action, background: "#153b37", borderColor: "#376d60", textDecoration: "none", justifyContent: "center" }}><Mail size={16}/> فتح بريد التواصل</a>
      </section>

      <section style={{ background: "#2b2517", border: "1px solid #69552d", borderRadius: 13, padding: 15, color: "#f5dfac", lineHeight: 1.9 }}>
        <b><ShieldCheck size={17} style={{ verticalAlign: "middle", marginLeft: 6 }}/>ضوابط الثقة والتحقق</b>
        <ul style={{ margin: "8px 0 0", paddingRight: 20 }}>
          <li>ظهور المنظمة في دليل عام لا يعني اعتمادها من HUMANITY ONE.</li>
          <li>يجب مراجعة الموقع الرسمي والصفة القانونية ووسائل الاتصال قبل اعتماد أي شريك.</li>
          <li>لا نرسل رسائل متكررة لمن لا يرغب في التواصل، ولا نجمع بيانات شخصية غير منشورة.</li>
          <li>لا نعد المنظمات بتمويل أو فرص غير مؤكدة.</li>
        </ul>
      </section>
    </div>
  </main>;
}

const field: React.CSSProperties = { width: "100%", padding: "12px 13px", borderRadius: 9, border: "1px solid #3a5663", background: "#071923", color: "#e8f2f5", outline: "none" };
const action: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 15px", borderRadius: 9, border: "1px solid #3c716d", background: "#12343a", color: "#e8f2f5", cursor: "pointer", fontWeight: 700 };
