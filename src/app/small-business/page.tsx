"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Calculator, Download, Lightbulb, ShieldCheck, ClipboardList } from "lucide-react";

type Item = { id: number; name: string; quantity: string; unit: string; unitCost: string };
const initialItems: Item[] = [
  { id: 1, name: "مواد خام أو بضاعة", quantity: "1", unit: "وحدة", unitCost: "" },
  { id: 2, name: "تغليف وتجهيز", quantity: "1", unit: "وحدة", unitCost: "" },
];
const ideas = [
  { name: "خدمات منزلية أو صيانة", need: "مهارة عملية وأدوات أساسية وتسويق محلي", first: "ابدأ بخدمة واحدة ونطاق جغرافي صغير، واختبر الطلب قبل شراء معدات إضافية." },
  { name: "بيع منتجات حسب الطلب", need: "مورد موثوق، عينة، وسيلة عرض وتوصيل", first: "اعرض عينة أو كتالوجًا واضحًا، ولا تشترِ مخزونًا كبيرًا قبل اختبار طلب العملاء." },
  { name: "أطعمة منزلية", need: "مهارة إعداد، اشتراطات سلامة وترخيص محلي حسب النشاط", first: "اختبر منتجًا واحدًا مع الالتزام بسلامة الغذاء والمتطلبات القانونية في منطقتك." },
  { name: "خدمات رقمية", need: "هاتف أو حاسوب، اتصال، ونموذج أعمال", first: "أنشئ نموذجًا واحدًا لخدمة واضحة مثل التصميم أو إدخال البيانات أو الكتابة." },
  { name: "إنتاج حرفي بسيط", need: "خامة وأدوات ومكان عمل آمن", first: "اصنع كمية تجريبية صغيرة واحسب الهالك والوقت قبل التسعير." },
  { name: "تجارة محلية صغيرة", need: "معرفة طلب المنطقة ومورد وأسعار موثقة", first: "اسأل عملاء محتملين وقارن عروض موردين حقيقية قبل الالتزام برأس المال." },
];

export default function SmallBusinessPage() {
  const [idea, setIdea] = useState(ideas[0].name);
  const [budget, setBudget] = useState("");
  const [customers, setCustomers] = useState("");
  const [price, setPrice] = useState("");
  const [monthlyFixed, setMonthlyFixed] = useState("");
  const [items, setItems] = useState<Item[]>(initialItems);
  const [notes, setNotes] = useState("");
  const selected = ideas.find((x) => x.name === idea) ?? ideas[0];
  const n = (v: string) => Math.max(0, Number(v) || 0);
  const totalSetup = useMemo(() => items.reduce((sum, x) => sum + n(x.quantity) * n(x.unitCost), 0), [items]);
  const variableCost = useMemo(() => items.reduce((sum, x) => sum + n(x.unitCost) * n(x.quantity), 0), [items]);
  const revenue = n(customers) * n(price);
  const operating = n(monthlyFixed) + variableCost;
  const remainder = revenue - operating;
  const money = (v: number) => new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 2 }).format(v) + " (بالعملة التي أدخلتها)";
  const updateItem = (id: number, key: keyof Item, value: string) => setItems((old) => old.map((x) => x.id === id ? { ...x, [key]: value } : x));
  const addItem = () => setItems((old) => [...old, { id: Date.now(), name: "", quantity: "1", unit: "وحدة", unitCost: "" }]);
  const removeItem = (id: number) => setItems((old) => old.filter((x) => x.id !== id));
  const report = [
    "خطة مشروع أولية - HUMANITY ONE",
    "الفكرة: " + idea,
    "الميزانية المتاحة: " + (budget || "لم تُحدد"),
    "العملاء المتوقعون شهريًا (تقدير المستخدم): " + (customers || "لم يُحدد"),
    "سعر البيع للوحدة: " + (price || "لم يُحدد"),
    "المصروفات الثابتة الشهرية: " + (monthlyFixed || "لم تُحدد"),
    "قائمة البنود:",
    ...items.map((x) => [x.name, "الكمية " + x.quantity, x.unit, "تكلفة الوحدة " + (x.unitCost || "غير محددة")].join(" - ")),
    "إجمالي البنود المدخلة: " + totalSetup,
    "الإيراد التقديري: " + revenue,
    "المتبقي الحسابي قبل الضرائب والتكاليف غير المدخلة: " + remainder,
    "ملاحظات: " + notes,
    "هذه أرقام أدخلها المستخدم وليست أسعار سوق أو ضمان ربح."
  ].join("\n");
  const download = () => {
    const url = URL.createObjectURL(new Blob(["\uFEFF" + report], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "humanity-one-business-plan.txt"; a.click(); URL.revokeObjectURL(url);
  };
  const field: React.CSSProperties = { width: "100%", minWidth: 0, boxSizing: "border-box", border: "1px solid #294454", borderRadius: 9, padding: 10, background: "#0a1b27", color: "#eef7f8", font: "inherit" };
  const panel: React.CSSProperties = { background: "rgba(17,38,52,.9)", border: "1px solid rgba(132,177,190,.18)", borderRadius: 15, padding: 17 };
  const label: React.CSSProperties = { display: "grid", gap: 6, color: "#c5d6dd", fontSize: 13 };

  return <main dir="rtl" style={{ minHeight: "100vh", padding: "clamp(16px,4vw,44px)", color: "#e8f1f5", background: "linear-gradient(145deg,#07131d,#0b1d2b 58%,#102a34)" }}>
    <div style={{ maxWidth: 1080, margin: "0 auto" }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#8bded2", textDecoration: "none", marginBottom: 20 }}><ArrowRight size={17}/> العودة إلى HUMANITY ONE</Link>
      <header style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#83d9ce", fontSize: 13 }}><Lightbulb size={18}/> تخطيط واقعي قبل المخاطرة بالمال</div>
        <h1 style={{ fontSize: "clamp(27px,4vw,39px)", margin: "8px 0" }}>مساعد المشروعات الصغيرة</h1>
        <p style={{ color: "#a9bdc8", lineHeight: 1.9, maxWidth: 800, margin: 0 }}>حوّل فكرتك إلى تجربة صغيرة قابلة للاختبار. أدخل أسعارًا وعروضًا حصلت عليها بنفسك؛ لن نخترع أسعارًا أو نعدك بالربح أو التمويل.</p>
      </header>

      <section style={{ ...panel, display: "grid", gap: 13, marginBottom: 15 }}>
        <h2 style={{ margin: 0, fontSize: 19 }}>1. اختر فكرة وابدأ بخطوة صغيرة</h2>
        <label style={label}>نوع النشاط
          <select value={idea} onChange={(e) => setIdea(e.target.value)} style={field}>{ideas.map((x) => <option key={x.name}>{x.name}</option>)}</select>
        </label>
        <div style={{ background: "#0a1b27", borderRadius: 10, padding: 13, lineHeight: 1.9 }}>
          <strong style={{ color: "#bfe9e3" }}>ما قد تحتاجه:</strong><p style={{ margin: "3px 0 10px", color: "#b7cbd2" }}>{selected.need}</p>
          <strong style={{ color: "#bfe9e3" }}>أول خطوة مقترحة:</strong><p style={{ margin: "3px 0 0", color: "#b7cbd2" }}>{selected.first}</p>
        </div>
        <label style={label}>الميزانية المتاحة (أدخل المبلغ والعملة بنفسك)<input inputMode="decimal" value={budget} onChange={(e) => setBudget(e.target.value)} style={field} placeholder="مثال: 5000 جنيه" /></label>
      </section>

      <section style={{ ...panel, marginBottom: 15 }}>
        <h2 style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 14px", fontSize: 19 }}><Calculator size={19}/> 2. حاسبة التكاليف والإيرادات</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,190px),1fr))", gap: 11, marginBottom: 15 }}>
          <label style={label}>عدد الوحدات/العملاء شهريًا<input inputMode="decimal" value={customers} onChange={(e) => setCustomers(e.target.value)} style={field} placeholder="تقديرك أنت" /></label>
          <label style={label}>سعر بيع الوحدة<input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} style={field} placeholder="سعر موثق أو افتراضي" /></label>
          <label style={label}>المصروفات الثابتة شهريًا<input inputMode="decimal" value={monthlyFixed} onChange={(e) => setMonthlyFixed(e.target.value)} style={field} placeholder="إيجار، نقل، إنترنت..." /></label>
        </div>
        <h3 style={{ fontSize: 15, margin: "10px 0" }}>بنود التكلفة التي أدخلتها بنفسك</h3>
        <div style={{ display: "grid", gap: 9 }}>
          {items.map((item) => <div key={item.id} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(105px,1fr))", gap: 7, alignItems: "center" }}>
            <input aria-label="اسم البند" value={item.name} onChange={(e) => updateItem(item.id, "name", e.target.value)} style={field} placeholder="اسم البند"/>
            <input aria-label="الكمية" inputMode="decimal" value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", e.target.value)} style={field} placeholder="الكمية"/>
            <input aria-label="الوحدة" value={item.unit} onChange={(e) => updateItem(item.id, "unit", e.target.value)} style={field} placeholder="الوحدة"/>
            <input aria-label="تكلفة الوحدة" inputMode="decimal" value={item.unitCost} onChange={(e) => updateItem(item.id, "unitCost", e.target.value)} style={field} placeholder="تكلفة الوحدة"/>
            <button type="button" onClick={() => removeItem(item.id)} style={{ border: "1px solid #704b4b", color: "#ffd4d4", background: "transparent", borderRadius: 8, padding: 9 }}>حذف</button>
          </div>)}
        </div>
        <button type="button" onClick={addItem} style={{ marginTop: 10, border: "1px solid #426b70", color: "#c9eeea", background: "transparent", borderRadius: 9, padding: "9px 12px" }}>+ إضافة بند تكلفة</button>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10, marginTop: 16 }}>
          <div style={{ background: "#0a1b27", padding: 12, borderRadius: 10 }}><small style={{ color: "#9db5c0" }}>إجمالي البنود المدخلة</small><strong style={{ display: "block", color: "#d8efeb", fontSize: 18 }}>{money(totalSetup)}</strong></div>
          <div style={{ background: "#0a1b27", padding: 12, borderRadius: 10 }}><small style={{ color: "#9db5c0" }}>الإيراد الشهري التقديري</small><strong style={{ display: "block", color: "#d8efeb", fontSize: 18 }}>{money(revenue)}</strong></div>
          <div style={{ background: "#0a1b27", padding: 12, borderRadius: 10 }}><small style={{ color: "#9db5c0" }}>المتبقي الحسابي</small><strong style={{ display: "block", color: remainder >= 0 ? "#83d9ce" : "#ffb5a9", fontSize: 18 }}>{money(remainder)}</strong></div>
        </div>
        <p style={{ color: "#91aab6", fontSize: 12, lineHeight: 1.8, marginBottom: 0 }}>تنبيه: الحاسبة تقريبية. تفترض أن تكاليف البنود المدخلة تخص الفترة الشهرية نفسها، ولا تشمل تلقائيًا الضرائب أو التالف أو عمولات المنصات أو أجور العمل أو التكاليف التي لم تدخلها. لا تعتبر النتيجة ربحًا مؤكدًا.</p>
      </section>

      <section style={{ ...panel, display: "grid", gap: 10 }}>
        <h2 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0, fontSize: 19 }}><ClipboardList size={19}/> 3. جهّز خطة التجربة</h2>
        <ol style={{ color: "#c2d4dc", lineHeight: 2, paddingRight: 22, margin: 0 }}>
          <li>تحدث مع 5 عملاء محتملين واسألهم عن احتياجهم الحقيقي.</li>
          <li>احصل على عرضي سعر على الأقل من موردين يمكن التحقق منهم.</li>
          <li>احسب تكلفة وحدة واحدة، بما فيها وقتك والنقل والتغليف والهالك.</li>
          <li>اختبر عينة أو خدمة واحدة قبل شراء مخزون كبير أو الاقتراض.</li>
          <li>راجع التراخيص والاشتراطات والسلامة المناسبة لنشاطك في منطقتك.</li>
        </ol>
        <label style={label}>ملاحظاتك ومصادر الأسعار أو عروض الموردين<textarea rows={4} maxLength={2000} value={notes} onChange={(e) => setNotes(e.target.value)} style={{ ...field, resize: "vertical" }} placeholder="سجّل اسم المورد وتاريخ العرض وما يشمله السعر، ولا تضع بيانات شخصية حساسة."/></label>
        <button type="button" onClick={download} style={{ justifySelf: "start", display: "inline-flex", alignItems: "center", gap: 8, border: 0, borderRadius: 10, padding: "11px 15px", background: "#17635b", color: "white", font: "inherit" }}><Download size={16}/> تنزيل خطة المشروع</button>
      </section>

      <footer style={{ ...panel, marginTop: 15, color: "#91aab6", fontSize: 12, lineHeight: 1.9 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#bfe9e3", marginBottom: 5 }}><ShieldCheck size={16}/> الخصوصية والشفافية</div>
        تُحسب الأرقام داخل المتصفح ولا تُرسل إلى الخادم ولا تُحفظ تلقائيًا. لا نقدم تمويلًا ولا نضمن الربح. لا تدفع رسومًا لوسيط مقابل وعد بتمويل، واستشر الجهات الرسمية المختصة قبل بدء نشاط يتطلب ترخيصًا.
      </footer>
    </div>
  </main>;
}
