"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, FolderKanban, Plus, Search, HeartHandshake, BookOpen, Sprout, Users, MapPin, CalendarDays, Trash2, Download, X, Target, HandHeart } from "lucide-react";

type Initiative = {
  id: string;
  title: string;
  category: string;
  goal: string;
  beneficiaries: string;
  location: string;
  needs: string;
  status: "idea" | "planning" | "active" | "complete";
  createdAt: string;
};

const STORAGE_KEY = "humanity-one-initiatives-v1";
const categories = [
  { value: "education", label: "التعليم", icon: BookOpen },
  { value: "community", label: "الدعم المجتمعي", icon: HeartHandshake },
  { value: "environment", label: "البيئة والاستدامة", icon: Sprout },
  { value: "accessibility", label: "إتاحة الفرص", icon: Users },
  { value: "other", label: "مجالات أخرى", icon: Target },
];
const statusLabels: Record<Initiative["status"], string> = {
  idea: "فكرة أولية",
  planning: "قيد التخطيط",
  active: "مبادرة نشطة",
  complete: "مكتملة",
};
const blankForm = { title: "", category: "community", goal: "", beneficiaries: "", location: "", needs: "" };

export default function ProjectsPage() {
  const [items, setItems] = useState<Initiative[]>([]);
  const [ready, setReady] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState(blankForm);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setItems(parsed.filter((item) => item && typeof item.id === "string" && typeof item.title === "string"));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const visibleItems = useMemo(() => items.filter((item) => {
    const haystack = [item.title, item.goal, item.location, item.beneficiaries, item.category].join(" ").toLowerCase();
    return haystack.includes(query.trim().toLowerCase()) && (statusFilter === "all" || item.status === statusFilter);
  }), [items, query, statusFilter]);

  function createInitiative(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim() || !form.goal.trim()) return;
    const item: Initiative = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `initiative-${Date.now()}`,
      ...form,
      title: form.title.trim(),
      goal: form.goal.trim(),
      beneficiaries: form.beneficiaries.trim(),
      location: form.location.trim(),
      needs: form.needs.trim(),
      status: "idea",
      createdAt: new Date().toISOString(),
    };
    setItems((current) => [item, ...current]);
    setForm(blankForm);
    setShowForm(false);
  }

  function updateStatus(id: string, status: Initiative["status"]) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, status } : item));
  }

  function deleteInitiative(id: string) {
    if (!window.confirm("هل تريد حذف هذه المبادرة من هذا الجهاز؟")) return;
    setItems((current) => current.filter((item) => item.id !== id));
  }

  function exportInitiatives() {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "humanity-one-initiatives.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const pageStyle: React.CSSProperties = { minHeight: "100vh", padding: "clamp(18px, 4vw, 48px)", color: "#e8f1f5", background: "linear-gradient(145deg,#07131d,#0b1d2b 58%,#102a34)" };
  const panelStyle: React.CSSProperties = { background: "rgba(17,38,52,.88)", border: "1px solid rgba(132,177,190,.18)", borderRadius: 18, padding: 20 };
  const fieldStyle: React.CSSProperties = { width: "100%", border: "1px solid #294454", borderRadius: 10, padding: "12px 13px", background: "#0a1b27", color: "#eef7f8", outline: "none", font: "inherit" };
  const buttonStyle: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, border: "1px solid #3b7f78", borderRadius: 10, padding: "10px 14px", background: "#174c49", color: "#eafff9", cursor: "pointer", font: "inherit" };

  return (
    <main dir="rtl" style={pageStyle}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#8bded2", textDecoration: "none", marginBottom: 24 }}>
          <ArrowRight size={17} /> العودة إلى HUMANITY ONE
        </Link>

        <header style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 18, marginBottom: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#80d8ca", fontSize: 13, marginBottom: 9 }}><HeartHandshake size={18} /> من الأفكار إلى أثر إنساني</div>
            <h1 style={{ fontSize: "clamp(27px,4vw,40px)", margin: 0, color: "#f3fbfc" }}>مساحة المبادرات الإنسانية</h1>
            <p style={{ color: "#a9bdc8", lineHeight: 1.9, maxWidth: 720, margin: "10px 0 0" }}>خطط لمبادرات تعليمية ومجتمعية وبيئية، وحدد الهدف والفئات المستفيدة والاحتياجات والخطوات التالية. ابدأ بفكرة صغيرة قابلة للتنفيذ.</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
            <button type="button" onClick={exportInitiatives} disabled={!items.length} style={{ ...buttonStyle, background: "transparent", borderColor: "#355365", color: "#c4d7df", opacity: items.length ? 1 : .45 }}><Download size={16} /> تصدير نسخة</button>
            <button type="button" onClick={() => setShowForm((open) => !open)} style={buttonStyle}><Plus size={17} /> مبادرة جديدة</button>
          </div>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 22 }}>
          {[
            { label: "كل المبادرات", value: items.length, icon: FolderKanban },
            { label: "أفكار أولية", value: items.filter((item) => item.status === "idea").length, icon: Target },
            { label: "قيد التنفيذ", value: items.filter((item) => item.status === "active").length, icon: HandHeart },
            { label: "مكتملة", value: items.filter((item) => item.status === "complete").length, icon: Users },
          ].map((stat) => <div key={stat.label} style={{ ...panelStyle, padding: 16, display: "flex", alignItems: "center", gap: 13 }}>
            <stat.icon size={20} color="#82d9cd" />
            <div><div style={{ color: "#a9bdc8", fontSize: 12 }}>{stat.label}</div><strong style={{ fontSize: 24 }}>{stat.value}</strong></div>
          </div>)}
        </section>

        {showForm && <section style={{ ...panelStyle, marginBottom: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <h2 style={{ fontSize: 20, margin: 0 }}>إنشاء مبادرة جديدة</h2>
            <button type="button" onClick={() => setShowForm(false)} aria-label="إغلاق النموذج" style={{ ...buttonStyle, padding: 8, background: "transparent", borderColor: "#355365" }}><X size={17} /></button>
          </div>
          <form onSubmit={createInitiative} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 13 }}>
            <label style={{ display: "grid", gap: 7, color: "#c5d6dd", fontSize: 13 }}>اسم المبادرة *
              <input required maxLength={90} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="مثال: دروس دعم مجانية للطلاب" style={fieldStyle} />
            </label>
            <label style={{ display: "grid", gap: 7, color: "#c5d6dd", fontSize: 13 }}>مجال المبادرة
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={fieldStyle}>{categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}</select>
            </label>
            <label style={{ display: "grid", gap: 7, color: "#c5d6dd", fontSize: 13 }}>الهدف الأساسي *
              <textarea required maxLength={700} rows={3} value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} placeholder="ما المشكلة التي تريد المبادرة المساهمة في حلها؟" style={{ ...fieldStyle, resize: "vertical" }} />
            </label>
            <label style={{ display: "grid", gap: 7, color: "#c5d6dd", fontSize: 13 }}>الفئات المستفيدة
              <input maxLength={180} value={form.beneficiaries} onChange={(e) => setForm({ ...form, beneficiaries: e.target.value })} placeholder="من سيستفيد؟" style={fieldStyle} />
            </label>
            <label style={{ display: "grid", gap: 7, color: "#c5d6dd", fontSize: 13 }}>الموقع أو النطاق
              <input maxLength={180} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="المدينة أو الحي أو عبر الإنترنت" style={fieldStyle} />
            </label>
            <label style={{ display: "grid", gap: 7, color: "#c5d6dd", fontSize: 13 }}>الاحتياجات والشركاء
              <textarea maxLength={700} rows={3} value={form.needs} onChange={(e) => setForm({ ...form, needs: e.target.value })} placeholder="متطوعون، أدوات، مكان، تمويل، خبرات..." style={{ ...fieldStyle, resize: "vertical" }} />
            </label>
            <div style={{ display: "flex", alignItems: "end", gap: 9 }}>
              <button type="submit" style={buttonStyle}><Plus size={16} /> حفظ المبادرة</button>
              <button type="button" onClick={() => { setForm(blankForm); setShowForm(false); }} style={{ ...buttonStyle, background: "transparent", borderColor: "#355365", color: "#c4d7df" }}>إلغاء</button>
            </div>
          </form>
        </section>}

        <section style={{ ...panelStyle, marginBottom: 18, display: "flex", flexWrap: "wrap", gap: 10 }}>
          <div style={{ flex: "1 1 240px", position: "relative" }}>
            <Search size={17} style={{ position: "absolute", right: 12, top: 13, color: "#8fa8b5" }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث في مبادراتك..." style={{ ...fieldStyle, paddingRight: 38 }} />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="تصفية حسب الحالة" style={{ ...fieldStyle, flex: "0 1 190px" }}>
            <option value="all">كل الحالات</option>
            {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </section>

        {!ready ? <p style={{ color: "#a9bdc8" }}>جارٍ تحميل المبادرات...</p> : visibleItems.length === 0 ? (
          <section style={{ ...panelStyle, textAlign: "center", padding: "42px 20px" }}>
            <div style={{ width: 58, height: 58, borderRadius: 18, display: "grid", placeItems: "center", margin: "0 auto 15px", background: "#183c43", color: "#8ce0d3" }}><HeartHandshake size={27} /></div>
            <h2 style={{ margin: "0 0 9px", fontSize: 20 }}>{items.length ? "لا توجد نتائج مطابقة" : "ابدأ أول مبادرة"}</h2>
            <p style={{ color: "#a9bdc8", lineHeight: 1.8, maxWidth: 520, margin: "0 auto 18px" }}>{items.length ? "جرّب تغيير كلمات البحث أو حالة المبادرة." : "كل تغيير كبير يبدأ بخطوة. سجّل الفكرة والهدف والفئات المستفيدة، ثم حوّلها إلى خطة قابلة للتنفيذ."}</p>
            {!items.length && <button type="button" onClick={() => setShowForm(true)} style={buttonStyle}><Plus size={16} /> إنشاء أول مبادرة</button>}
          </section>
        ) : (
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: 14 }}>
            {visibleItems.map((item) => {
              const category = categories.find((entry) => entry.value === item.category) || categories[4];
              const CategoryIcon = category.icon;
              return <article key={item.id} style={{ ...panelStyle, display: "flex", flexDirection: "column", gap: 13 }}>
                <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, color: "#86d9ce" }}><CategoryIcon size={19} /><span style={{ fontSize: 12 }}>{category.label}</span></div>
                  <button type="button" onClick={() => deleteInitiative(item.id)} title="حذف المبادرة" aria-label="حذف المبادرة" style={{ border: 0, background: "transparent", color: "#9aabb5", cursor: "pointer" }}><Trash2 size={16} /></button>
                </div>
                <h2 style={{ fontSize: 19, margin: 0, lineHeight: 1.5 }}>{item.title}</h2>
                <p style={{ color: "#b5c7cf", lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>{item.goal}</p>
                {item.beneficiaries && <div style={{ display: "flex", gap: 8, alignItems: "center", color: "#b5c7cf", fontSize: 13 }}><Users size={15} color="#83cfc5" /> {item.beneficiaries}</div>}
                {item.location && <div style={{ display: "flex", gap: 8, alignItems: "center", color: "#b5c7cf", fontSize: 13 }}><MapPin size={15} color="#83cfc5" /> {item.location}</div>}
                {item.needs && <div style={{ padding: 12, background: "#0a1b27", borderRadius: 10, color: "#b5c7cf", fontSize: 13, lineHeight: 1.8 }}><b style={{ color: "#dce9ec" }}>الاحتياجات:</b> {item.needs}</div>}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: "auto", paddingTop: 10, borderTop: "1px solid #294454" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#91aab6", fontSize: 11 }}><CalendarDays size={13} /> {new Date(item.createdAt).toLocaleDateString("ar-EG")}</span>
                  <select value={item.status} onChange={(e) => updateStatus(item.id, e.target.value as Initiative["status"])} aria-label="حالة المبادرة" style={{ ...fieldStyle, width: "auto", maxWidth: 145, padding: "7px 9px", fontSize: 12 }}>
                    {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
              </article>;
            })}
          </section>
        )}

        <footer style={{ marginTop: 26, padding: 15, borderRadius: 12, background: "rgba(10,27,39,.75)", color: "#91aab6", fontSize: 12, lineHeight: 1.9 }}>
          <b style={{ color: "#bfe9e3" }}>تنبيه الشفافية والخصوصية:</b> تُحفظ هذه المسودات على هذا الجهاز والمتصفح فقط في هذه المرحلة، ولا تُنشر للعامة ولا يراها مستخدمون آخرون. لا تضف أسماء المستفيدين أو بياناتهم الشخصية. استخدم «تصدير نسخة» للاحتفاظ بنسخة احتياطية.
        </footer>
      </div>
    </main>
  );
}
