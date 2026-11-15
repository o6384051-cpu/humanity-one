import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Info } from "lucide-react";

const freeServices = [
  "إنشاء حساب المستفيد واستخدام ملفه الشخصي.",
  "تقديم طلبات المساعدة الإنسانية ومتابعة حالتها.",
  "رفع المستندات المطلوبة المرتبطة بطلب المساعدة.",
  "البحث عن فرص العمل والتقديم عليها.",
  "نشر إعلانات الوظائف ومراجعتها قبل عرضها.",
  "الوصول إلى المعلومات والإرشادات والخدمات الأساسية المتاحة على المنصة.",
];

export default function FeesPage() {
  return (
    <main dir="rtl" style={{ minHeight: "100vh", padding: "clamp(20px,5vw,56px)", color: "#e8f1f5", background: "linear-gradient(145deg,#07131d,#0b1d2b 58%,#102a34)" }}>
      <div style={{ maxWidth: 850, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#8bded2", display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 24 }}><ArrowRight size={18}/> العودة للرئيسية</Link>
        <header style={{ padding: "28px 24px", borderRadius: 18, background: "rgba(17,38,52,.92)", border: "1px solid rgba(132,177,190,.25)" }}>
          <div style={{ color: "#8bded2", display: "flex", alignItems: "center", gap: 10 }}><ShieldCheck size={22}/> سياسة الرسوم والشفافية</div>
          <h1 style={{ fontSize: "clamp(28px,5vw,40px)", margin: "14px 0 8px" }}>الخدمات المجانية في HUMANITY ONE</h1>
          <p style={{ color: "#b7cbd4", lineHeight: 1.9, margin: 0 }}>هدفنا تسهيل وصول الناس إلى الدعم والفرص والمعرفة، دون أن تكون الرسوم عائقًا أمام الخدمات الإنسانية الأساسية.</p>
        </header>

        <section style={{ marginTop: 22, padding: 24, borderRadius: 16, background: "#102b2c", border: "1px solid #28645d" }}>
          <h2 style={{ marginTop: 0, color: "#a5eadb" }}>خدمات متاحة مجانًا</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 14 }}>
            {freeServices.map((service) => <li key={service} style={{ display: "flex", alignItems: "flex-start", gap: 10, lineHeight: 1.8 }}><CheckCircle2 size={19} color="#8bded2" style={{ flexShrink: 0, marginTop: 4 }}/><span>{service}</span></li>)}
          </ul>
        </section>

        <section style={{ marginTop: 20, padding: 24, borderRadius: 16, background: "rgba(17,38,52,.92)", border: "1px solid rgba(132,177,190,.2)" }}>
          <h2 style={{ marginTop: 0 }}>لا رسوم خفية</h2>
          <p style={{ color: "#c5d6dd", lineHeight: 2 }}>لا تطلب المنصة من الباحث عن عمل دفع مقابل التقديم أو الحصول على الوظيفة، ولا تفرض رسومًا على تقديم طلب المساعدة الإنسانية.</p>
          <p style={{ color: "#c5d6dd", lineHeight: 2 }}>إذا أُضيفت مستقبلًا خدمة اختيارية مدفوعة، فسيتم توضيح سعرها وشروطها قبل استخدامها، ولن يتم تفعيلها أو تحصيل أي مبلغ دون موافقة صريحة من المستخدم.</p>
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
