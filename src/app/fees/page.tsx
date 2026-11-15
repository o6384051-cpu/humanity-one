"use client";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Info } from "lucide-react";
import { useLanguage } from "../../components/LanguageProvider";

const freeServices: [string,string][] = [
  ["إنشاء حساب المستفيد واستخدام ملفه الشخصي.","Create a beneficiary account and use the personal profile."],
  ["تقديم طلبات المساعدة الإنسانية ومتابعة حالتها.","Submit humanitarian assistance requests and track their status."],
  ["رفع المستندات المطلوبة المرتبطة بطلب المساعدة.","Upload documents required for an assistance request."],
  ["البحث عن فرص العمل والتقديم عليها.","Search and apply for job opportunities."],
  ["نشر إعلانات الوظائف ومراجعتها قبل عرضها.","Publish job listings and review them before display."],
  ["الوصول إلى المعلومات والإرشادات والخدمات الأساسية المتاحة على المنصة.","Access information, guidance, and essential services available on the platform."],
];

export default function FeesPage() {
  const { language } = useLanguage();
  const tr = (ar: string, en: string) => language === "ar" ? ar : en;
  return (
    <main dir={language === "ar" ? "rtl" : "ltr"} style={{ minHeight: "100vh", padding: "clamp(20px,5vw,56px)", color: "#e8f1f5", background: "linear-gradient(145deg,#07131d,#0b1d2b 58%,#102a34)" }}>
      <div style={{ maxWidth: 850, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#8bded2", display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 24 }}><ArrowRight size={18}/>{tr("العودة للرئيسية","Back to home")}</Link>
        <header style={{ padding: "28px 24px", borderRadius: 18, background: "rgba(17,38,52,.92)", border: "1px solid rgba(132,177,190,.25)" }}>
          <div style={{ color: "#8bded2", display: "flex", alignItems: "center", gap: 10 }}><ShieldCheck size={22}/>{tr("سياسة الرسوم والشفافية","Fees & transparency policy")}</div>
          <h1 style={{ fontSize: "clamp(28px,5vw,40px)", margin: "14px 0 8px" }}>{tr("الخدمات المجانية في HUMANITY ONE","Free services at HUMANITY ONE")}</h1>
          <p style={{ color: "#b7cbd4", lineHeight: 1.9, margin: 0 }}>هدفنا تسهيل وصول الناس إلى الدعم والفرص والمعرفة، دون أن تكون الرسوم عائقًا أمام الخدمات الإنسانية الأساسية.</p>
        </header>
        <section style={{ marginTop: 22, padding: 24, borderRadius: 16, background: "#102b2c", border: "1px solid #28645d" }}>
          <h2 style={{ marginTop: 0, color: "#a5eadb" }}>{tr("خدمات متاحة مجانًا","Services available for free")}</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 14 }}>
            {freeServices.map(([ar, en]) => <li key={ar} style={{ display: "flex", alignItems: "flex-start", gap: 10, lineHeight: 1.8 }}><CheckCircle2 size={19} color="#8bded2" style={{ flexShrink: 0, marginTop: 4 }}/><span>{tr(ar, en)}</span></li>)}
          </ul>
        </section>
        <section style={{ marginTop: 20, padding: 24, borderRadius: 16, background: "rgba(17,38,52,.92)", border: "1px solid rgba(132,177,190,.2)" }}>
          <h2 style={{ marginTop: 0 }}>{tr("لا رسوم خفية","No hidden fees")}</h2>
          <p style={{ color: "#c5d6dd", lineHeight: 2 }}>{tr("لا تطلب المنصة من الباحث عن عمل دفع مقابل التقديم أو الحصول على الوظيفة، ولا تفرض رسومًا على تقديم طلب المساعدة الإنسانية.","The platform does not ask job seekers to pay to apply or get a job, and does not charge for submitting humanitarian assistance requests.")}</p>
          <p style={{ color: "#c5d6dd", lineHeight: 2 }}>{tr("إذا أُضيفت مستقبلًا خدمة اختيارية مدفوعة، فسيتم توضيح سعرها وشروطها قبل استخدامها، ولن يتم تفعيلها أو تحصيل أي مبلغ دون موافقة صريحة من المستخدم.","If an optional paid service is introduced in the future, its price and terms will be explained in advance. It will not be activated or charged without the user’s explicit consent.")}</p>
        </section>
        <aside style={{ marginTop: 20, padding: 18, borderRadius: 14, background: "#0a1b27", color: "#a9bdc8", lineHeight: 1.9, fontSize: 14 }}>
          <Info size={18} style={{ verticalAlign: "middle", marginLeft: 8, color: "#8bded2" }}/>
          هذه الصفحة توضح سياسة المنصة المعلنة. لا تعني المجانية ضمان الحصول على مساعدة أو وظيفة؛ تخضع الطلبات والفرص للمراجعة والتوافر والتحقق.
        </aside>
        <footer style={{ marginTop: 28, textAlign: "center", color: "#91aab6", fontSize: 13 }}>HUMANITY ONE © 2026</footer>
      </div>
    </main>
  );
}
