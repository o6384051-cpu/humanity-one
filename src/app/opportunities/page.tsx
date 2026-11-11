"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, BriefcaseBusiness, GraduationCap, Lightbulb, Search, ExternalLink, ShieldCheck, HeartHandshake } from "lucide-react";

type Category = "all" | "work" | "learning" | "business" | "support";
type Resource = {
  title: string;
  description: string;
  category: Exclude<Category, "all">;
  provider: string;
  url: string;
  note: string;
};

const resources: Resource[] = [
  {
    title: "منصة العمل المصرية",
    description: "بوابة وزارة العمل لفرص العمل داخل مصر وخارجها، والتدريب المهني والخدمات الإلكترونية.",
    category: "work",
    provider: "وزارة العمل المصرية",
    url: "https://egywork.labour.gov.eg/",
    note: "تحقق من توافر الفرص وشروط كل إعلان قبل التقديم.",
  },
  {
    title: "بوابة الوظائف الحكومية",
    description: "الإعلانات الرسمية لوظائف الجهات الحكومية ومتابعة إجراءات التقديم.",
    category: "work",
    provider: "الجهاز المركزي للتنظيم والإدارة",
    url: "https://jobs.caoa.gov.eg/",
    note: "راجع مواعيد التقديم والمستندات المطلوبة في الإعلان الرسمي.",
  },
  {
    title: "مهارة-تك",
    description: "تعلم مهارات تكنولوجيا المعلومات بالعربية والإنجليزية، مع محتوى يراعي إتاحة التعلم.",
    category: "learning",
    provider: "معهد تكنولوجيا المعلومات ITI",
    url: "https://maharatech.gov.eg/",
    note: "راجع صفحة الدورة لمعرفة الرسوم والشروط والشهادة.",
  },
  {
    title: "إدراك",
    description: "دورات تعليمية مفتوحة عبر الإنترنت في مجالات متنوعة، ويمكن دراسة الدورات مجانًا.",
    category: "learning",
    provider: "منصة إدراك",
    url: "https://www.edraak.org/",
    note: "تحقق من متطلبات كل دورة وشروط الحصول على الشهادة.",
  },
  {
    title: "منصة المشروعات الصغيرة",
    description: "خدمات تدريب وتأسيس وتمويل وتسويق ودعم وتطوير المشروعات الصغيرة والمتوسطة.",
    category: "business",
    provider: "جهاز تنمية المشروعات",
    url: "https://www.msme.eg/",
    note: "التمويل ليس مضمونًا؛ راجع الشروط والتكلفة ومقدم الخدمة مباشرة.",
  },
  {
    title: "خدمات التدريب المهني",
    description: "تابع برامج التدريب المهني والمبادرات التي تعلنها وزارة العمل.",
    category: "learning",
    provider: "وزارة العمل المصرية",
    url: "https://www.labour.gov.eg/",
    note: "تختلف الدورات ومواعيدها حسب الإعلان والمحافظة.",
  },
];

const filters: { value: Category; label: string }[] = [
  { value: "all", label: "كل الفرص" },
  { value: "work", label: "العمل" },
  { value: "learning", label: "التعليم والتدريب" },
  { value: "business", label: "المشروعات الصغيرة" },
  { value: "support", label: "الدعم الإنساني" },
];

const categoryLabel: Record<Resource["category"], string> = {
  work: "العمل والدخل",
  learning: "التعليم والتدريب",
  business: "المشروعات الصغيرة",
  support: "الدعم الإنساني",
};

export default function OpportunitiesPage() {
  const [category, setCategory] = useState<Category>("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => resources.filter((item) => {
    const matchesCategory = category === "all" || item.category === category;
    const text = [item.title, item.description, item.provider, categoryLabel[item.category]].join(" ").toLowerCase();
    return matchesCategory && text.includes(query.trim().toLowerCase());
  }), [category, query]);

  return (
    <main dir="rtl" style={{ minHeight: "100vh", padding: "clamp(18px, 4vw, 48px)", color: "#e8f1f5", background: "linear-gradient(145deg,#07131d,#0b1d2b 58%,#102a34)" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#8bded2", textDecoration: "none", marginBottom: 24 }}>
          <ArrowRight size={17} /> العودة إلى HUMANITY ONE
        </Link>

        <header style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#80d8ca", fontSize: 13, marginBottom: 9 }}>
            <HeartHandshake size={18} /> فرص حقيقية من مصادرها
          </div>
          <h1 style={{ fontSize: "clamp(27px,4vw,40px)", margin: 0, color: "#f3fbfc" }}>مركز الفرص الإنسانية</h1>
          <p style={{ color: "#a9bdc8", lineHeight: 1.9, maxWidth: 760, margin: "10px 0 0" }}>
            ابدأ من بوابات رسمية ومصادر معروفة للعمل والتعلم وبناء مشروع صغير. نعرض هنا روابط الجهات نفسها، لا إعلانات وظائف غير متحقق منها.
          </p>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12, marginBottom: 22 }}>
          <div style={{ background: "rgba(17,38,52,.88)", border: "1px solid rgba(132,177,190,.18)", borderRadius: 16, padding: 16 }}>
            <BriefcaseBusiness color="#82d9cd" size={22} /><h2 style={{ fontSize: 16, margin: "10px 0 4px" }}>العمل والدخل</h2><p style={{ color: "#a9bdc8", fontSize: 13, margin: 0 }}>بوابات توظيف رسمية</p>
          </div>
          <div style={{ background: "rgba(17,38,52,.88)", border: "1px solid rgba(132,177,190,.18)", borderRadius: 16, padding: 16 }}>
            <GraduationCap color="#82d9cd" size={22} /><h2 style={{ fontSize: 16, margin: "10px 0 4px" }}>التعليم المجاني</h2><p style={{ color: "#a9bdc8", fontSize: 13, margin: 0 }}>تعلم مهارات مطلوبة</p>
          </div>
          <div style={{ background: "rgba(17,38,52,.88)", border: "1px solid rgba(132,177,190,.18)", borderRadius: 16, padding: 16 }}>
            <Lightbulb color="#82d9cd" size={22} /><h2 style={{ fontSize: 16, margin: "10px 0 4px" }}>مشروعك الصغير</h2><p style={{ color: "#a9bdc8", fontSize: 13, margin: 0 }}>تدريب وإرشاد وخدمات دعم</p>
          </div>
        </section>

        <section style={{ background: "rgba(17,38,52,.88)", border: "1px solid rgba(132,177,190,.18)", borderRadius: 16, padding: 16, marginBottom: 18, display: "grid", gap: 12 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 9, color: "#a9bdc8" }}>
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن جهة أو مجال..." aria-label="ابحث عن فرصة" style={{ width: "100%", background: "#0a1b27", border: "1px solid #294454", borderRadius: 10, padding: 12, color: "#eef7f8", outline: "none" }} />
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {filters.map((filter) => <button key={filter.value} type="button" onClick={() => setCategory(filter.value)} aria-pressed={category === filter.value} style={{ border: "1px solid " + (category === filter.value ? "#4a9d91" : "#355365"), background: category === filter.value ? "#174c49" : "transparent", color: "#d8e7eb", borderRadius: 9, padding: "8px 12px", cursor: "pointer", font: "inherit", fontSize: 12 }}>{filter.label}</button>)}
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: 14 }}>
          {visible.map((item) => <article key={item.title} style={{ background: "rgba(17,38,52,.88)", border: "1px solid rgba(132,177,190,.18)", borderRadius: 16, padding: 19, display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={{ color: "#82d9cd", fontSize: 12 }}>{categoryLabel[item.category]}</span>
            <h2 style={{ margin: 0, fontSize: 19, color: "#f3fbfc" }}>{item.title}</h2>
            <p style={{ color: "#b5c7cf", lineHeight: 1.8, margin: 0, fontSize: 14 }}>{item.description}</p>
            <div style={{ color: "#91aab6", fontSize: 12 }}>المصدر: {item.provider}</div>
            <div style={{ color: "#c5d6dd", fontSize: 12, lineHeight: 1.7, padding: 10, background: "#0a1b27", borderRadius: 9 }}>{item.note}</div>
            <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: "auto", padding: "10px 13px", borderRadius: 9, background: "#174c49", color: "#eafff9", textDecoration: "none", fontSize: 13 }}>
              زيارة المصدر الرسمي <ExternalLink size={15} />
            </a>
          </article>)}
        </section>

        {visible.length === 0 && <p style={{ textAlign: "center", color: "#a9bdc8", padding: 30 }}>لا توجد مصادر تطابق البحث. جرّب كلمة أخرى.</p>}

        <footer style={{ marginTop: 24, padding: 15, borderRadius: 12, background: "rgba(10,27,39,.75)", color: "#91aab6", fontSize: 12, lineHeight: 1.9 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#bfe9e3", marginBottom: 6 }}><ShieldCheck size={16} /> الأمان والشفافية</div>
          هذه روابط لجهات ومصادر خارجية وليست ضمانًا بوجود وظيفة أو تمويل متاح الآن. لا تدفع رسومًا لشخص مقابل وعد بوظيفة، ولا تشارك رقمك القومي أو بياناتك البنكية إلا عبر بوابة رسمية موثوقة وبعد التأكد من سبب طلبها. آخر مراجعة للروابط: 11 نوفمبر 2026.
        </footer>
      </div>
    </main>
  );
}
