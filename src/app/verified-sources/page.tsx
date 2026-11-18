"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink, ShieldCheck, BriefcaseBusiness, GraduationCap, ChartNoAxesCombined, Lightbulb, Mail } from "lucide-react";
import { useLanguage } from "../../components/LanguageProvider";

type Source = {
  name: string;
  nameEn: string;
  authority: string;
  authorityEn: string;
  purpose: string;
  purposeEn: string;
  limitation: string;
  limitationEn: string;
  url: string;
  category: "work" | "career" | "learning" | "business";
  icon: typeof BriefcaseBusiness;
};

const checkedAt = "18 نوفمبر 2026";

const sources: Source[] = [
  {
    name: "منصة العمل المصرية",
    nameEn: "Egyptian Employment Platform",
    authority: "وزارة العمل المصرية",
    authorityEn: "Egyptian Ministry of Labour",
    purpose: "البحث عن فرص العمل داخل مصر وخارجها، والاطلاع على التدريب المهني والخدمات الإلكترونية التي تنشرها الوزارة.",
    purposeEn: "Find employment opportunities inside and outside Egypt, and view vocational training and electronic services published by the Ministry.",
    limitation: "الإعلانات تتغير باستمرار. افتح الإعلان الأصلي وتحقق من الموعد والمكان والأجر والشروط قبل إرسال بياناتك.",
    limitationEn: "Listings change frequently. Open the original listing and verify its deadline, location, pay, and requirements before sharing your information.",
    url: "https://egywork.labour.gov.eg/",
    category: "work",
    icon: BriefcaseBusiness,
  },
  {
    name: "بوابة الوظائف الحكومية",
    nameEn: "Government Jobs Portal",
    authority: "الجهاز المركزي للتنظيم والإدارة",
    authorityEn: "Central Agency for Organization and Administration",
    purpose: "الإعلانات الرسمية لوظائف الجهات الحكومية، وشروط التقديم ومتابعة إجراءات المسابقات.",
    purposeEn: "Official vacancy announcements from government entities, application requirements, and recruitment competition updates.",
    limitation: "مخصصة للوظائف الحكومية المعلنة؛ لا تمثل جميع وظائف القطاع الخاص. اعتمد على الإعلان الرسمي ومواعيده.",
    limitationEn: "This portal covers announced government vacancies, not all private-sector jobs. Follow the official announcement and its deadlines.",
    url: "https://jobs.caoa.gov.eg/",
    category: "work",
    icon: BriefcaseBusiness,
  },
  {
    name: "آفاق المهن والتوظيف في مصر",
    nameEn: "Egypt Occupational Outlook",
    authority: "وزارة التخطيط والتنمية الاقتصادية والتعاون الدولي بالتعاون مع وزارة العمل",
    authorityEn: "Ministry of Planning, Economic Development and International Cooperation, with the Ministry of Labour",
    purpose: "فهم طبيعة المهن والمهام والمهارات والمؤهلات والمؤشرات المهنية؛ يساعدك على اختيار مسار مهني واقعي.",
    purposeEn: "Understand occupations, tasks, skills, qualifications, and occupational indicators to help choose a realistic career path.",
    limitation: "هذا دليل معلومات وتحليل للمهن، وليس إعلانًا عن وظيفة شاغرة أو وعدًا براتب أو توظيف.",
    limitationEn: "This is an occupational information and analysis resource, not a vacancy listing or a promise of a salary or employment.",
    url: "https://occupational-outlook.mped.gov.eg/",
    category: "career",
    icon: ChartNoAxesCombined,
  },
  {
    name: "مهارة-تك",
    nameEn: "Mahara-Tech",
    authority: "معهد تكنولوجيا المعلومات (ITI)",
    authorityEn: "Information Technology Institute (ITI)",
    purpose: "منصة للتعلم الإلكتروني في مجالات تكنولوجيا المعلومات، وتعرض دورات بالعربية والإنجليزية ومحتوى يراعي إتاحة التعلم.",
    purposeEn: "An online learning platform for information technology, with Arabic and English courses and accessibility-oriented content.",
    limitation: "راجع صفحة كل دورة لمعرفة شروط الالتحاق والرسوم والمدة والشهادة؛ لا تفترض أن كل دورة مجانية أو متاحة دائمًا.",
    limitationEn: "Check each course page for eligibility, fees, duration, and certification. Do not assume every course is free or always available.",
    url: "https://maharatech.gov.eg/",
    category: "learning",
    icon: GraduationCap,
  },
  {
    name: "جهاز تنمية المشروعات المتوسطة والصغيرة ومتناهية الصغر",
    nameEn: "Micro, Small and Medium Enterprise Development Agency",
    authority: "جهاز تنمية المشروعات (MSMEDA)",
    authorityEn: "MSMEDA",
    purpose: "التعرف على خدمات الجهاز ومنصة المشروعات ودعم تأسيس وتطوير المشروعات الصغيرة والمتوسطة ومتناهية الصغر.",
    purposeEn: "Learn about agency services and the enterprise platform supporting the establishment and development of micro, small, and medium enterprises.",
    limitation: "عرض الخدمات لا يعني الموافقة على تمويل. تحقق مباشرة من الشروط والمستندات والتكاليف وأهلية مشروعك لدى الجهاز.",
    limitationEn: "The availability of services does not mean financing is approved. Verify requirements, documents, costs, and eligibility directly with the agency.",
    url: "https://www.msmeda.org.eg/pages/4023",
    category: "business",
    icon: Lightbulb,
  },
];

const labels = {
  work: ["وظائف", "Employment"],
  career: ["دليل المهن", "Career guide"],
  learning: ["تعليم وتدريب", "Learning"],
  business: ["مشروعات صغيرة", "Small business"],
} as const;

export default function VerifiedSourcesPage() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const tr = (a: string, e: string) => ar ? a : e;

  return (
    <main dir={ar ? "rtl" : "ltr"} lang={language} style={{ minHeight: "100vh", padding: "clamp(18px,4vw,46px)", background: "linear-gradient(145deg,#07131d,#0b1d2b 58%,#102a34)", color: "#e8f1f5" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#8bded2", textDecoration: "none" }}><ArrowRight size={17}/>{tr("العودة إلى الرئيسية","Back to home")}</Link>
        <header style={{ margin: "26px 0 22px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 9, color: "#8bded2", fontSize: 14 }}><ShieldCheck size={20}/>{tr("مراجع واضحة ومصادر أصلية","Transparent references and primary sources")}</div>
          <h1 style={{ fontSize: "clamp(28px,5vw,42px)", fontWeight: 850, margin: "12px 0" }}>{tr("دليل المصادر الموثوقة","Verified Resources Directory")}</h1>
          <p style={{ color: "#b7cbd4", lineHeight: 1.95, maxWidth: 820, margin: 0 }}>{tr("نجمع هنا روابط الجهات الرسمية التي تساعدك في البحث عن عمل، وفهم المهن، والتعلم، وتطوير مشروع صغير. نوضح وظيفة كل مصدر وحدوده حتى لا تختلط المعلومات بالوعود.", "This directory collects official sources for finding work, understanding occupations, learning, and developing a small business. Each source has a clear purpose and limitation, so information is never confused with a promise.")}</p>
        </header>

        <section aria-label={tr("سياسة التحقق","Verification policy")} style={{ padding: 16, border: "1px solid #2c665f", borderRadius: 14, background: "#0d292b", marginBottom: 18 }}>
          <strong style={{ color: "#a5eadb" }}>{tr("آخر مراجعة للروابط: ", "Links last reviewed: ")}{checkedAt}</strong>
          <p style={{ color: "#c5d6dd", lineHeight: 1.85, margin: "7px 0 0" }}>{tr("تم التحقق من هوية الجهات والغرض العام للمواقع بالرجوع إلى صفحاتها الرسمية أو صفحات حكومية تعرّف بها. هذا لا يضمن استمرار كل إعلان أو دورة أو خدمة؛ لذلك نوجّهك دائمًا إلى المصدر الأصلي للتحقق من التفاصيل الحالية.", "The organizations and general purpose of these sites were checked against their official pages or government pages describing them. This does not guarantee that every listing, course, or service remains available; always verify current details at the original source.")}</p>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: 14 }}>
          {sources.map((source) => {
            const Icon = source.icon;
            return <article key={source.url} style={{ display: "flex", flexDirection: "column", gap: 11, padding: 18, border: "1px solid #294858", borderRadius: 15, background: "#102333" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#8bded2", fontSize: 13 }}><Icon size={18}/>{tr(labels[source.category][0],labels[source.category][1])}</span>
                <span style={{ color: "#a5c2c9", fontSize: 11 }}>{tr("مصدر رسمي","Official source")}</span>
              </div>
              <h2 style={{ fontSize: 19, lineHeight: 1.5, margin: 0 }}>{tr(source.name,source.nameEn)}</h2>
              <p style={{ color: "#8bded2", fontSize: 12, margin: 0 }}>{tr(source.authority,source.authorityEn)}</p>
              <p style={{ color: "#d1dee3", lineHeight: 1.8, margin: 0 }}>{tr(source.purpose,source.purposeEn)}</p>
              <div style={{ borderTop: "1px solid #294858", paddingTop: 10, marginTop: "auto" }}>
                <strong style={{ fontSize: 12, color: "#f1d39a" }}>{tr("مهم قبل الاستخدام","Important")}</strong>
                <p style={{ color: "#b7cbd4", lineHeight: 1.75, fontSize: 13, margin: "5px 0 12px" }}>{tr(source.limitation,source.limitationEn)}</p>
                <a href={source.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "#8bded2", fontWeight: 750, textDecoration: "none" }}>{tr("افتح الموقع الرسمي","Open official website")}<ExternalLink size={15}/></a>
              </div>
            </article>;
          })}
        </section>

        <section style={{ marginTop: 22, padding: 18, border: "1px solid #294858", borderRadius: 14, background: "#0a1b27" }}>
          <h2 style={{ fontSize: 18, margin: "0 0 8px" }}>{tr("قواعد حماية المستفيد","Beneficiary safety rules")}</h2>
          <ul style={{ color: "#c5d6dd", lineHeight: 2, paddingInlineStart: 22, margin: 0 }}>
            <li>{tr("لا تدفع مالًا لشخص يعدك بوظيفة أو قبول مضمون أو مساعدة مؤكدة.","Do not pay anyone promising a guaranteed job, acceptance, or assistance.")}</li>
            <li>{tr("لا ترسل كلمات المرور أو رموز التحقق أو بياناتك البنكية إلى جهة غير موثوقة.","Never send passwords, verification codes, or banking details to an untrusted party.")}</li>
            <li>{tr("تحقق من اسم الجهة والرابط وشروط الخدمة من موقعها الرسمي قبل مشاركة مستنداتك.","Verify the organization, URL, and service terms on its official site before sharing documents.")}</li>
            <li>{tr("إذا وجدت رابطًا مكسورًا أو معلومة غير دقيقة، أبلغنا مع ذكر المصدر.","If you find a broken link or inaccurate information, report it with the source.")}</li>
          </ul>
          <a href="mailto:humanityone.contact@gmail.com?subject=تصحيح%20معلومة%20في%20دليل%20المصادر" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 12, color: "#8bded2", textDecoration: "none" }}><Mail size={16}/>humanityone.contact@gmail.com</a>
        </section>
        <footer style={{ color: "#819aa7", fontSize: 12, marginTop: 24, textAlign: "center" }}>HUMANITY ONE · {tr("المعلومة الواضحة تحمي الإنسان","Clear information protects people")}</footer>
      </div>
    </main>
  );
}
