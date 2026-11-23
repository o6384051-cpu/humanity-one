"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, MapPin, Search, Filter, ShieldCheck, Info } from "lucide-react";

type Layer = "needs" | "resources" | "initiatives";
type RadarPoint = {
  id: string; title: string; country: string; city: string; lat: number; lon: number;
  layer: Layer; category: string; description: string; status: string; evidence: string;
};

const demoPoints: RadarPoint[] = [
  { id: "demo-1", title: "فرصة دعم تعليمي مجتمعي", country: "مصر", city: "القاهرة", lat: 30.0444, lon: 31.2357, layer: "needs", category: "التعليم", description: "مثال توضيحي لاحتياج تعليمي يمكن للمنظمات والمتطوعين مراجعته وتقديم الدعم المناسب له.", status: "بيانات تجريبية", evidence: "لا يوجد بلاغ حقيقي مرتبط بهذا المثال" },
  { id: "demo-2", title: "متطوعون بمهارات تقنية", country: "الأردن", city: "عمّان", lat: 31.9539, lon: 35.9106, layer: "resources", category: "متطوعون", description: "مثال توضيحي لقدرة تطوعية يمكن ربطها بمبادرات تحتاج إلى دعم تقني.", status: "بيانات تجريبية", evidence: "يلزم التحقق من الهوية والتوفر قبل الاعتماد" },
  { id: "demo-3", title: "مبادرة توعية مائية", country: "المغرب", city: "الرباط", lat: 34.0209, lon: -6.8416, layer: "initiatives", category: "المياه", description: "مثال توضيحي لمبادرة مجتمعية قابلة للتوثيق والمتابعة.", status: "بيانات تجريبية", evidence: "لا تمثل مبادرة قائمة مؤكدة" },
  { id: "demo-4", title: "موارد تعليمية قابلة للمشاركة", country: "كينيا", city: "نيروبي", lat: -1.2921, lon: 36.8219, layer: "resources", category: "موارد", description: "مثال توضيحي لمورد يمكن عرضه بعد إثبات توفره وملكيته وموافقة صاحبه.", status: "بيانات تجريبية", evidence: "يلزم التحقق من المورد والجهة المقدمة" },
  { id: "demo-5", title: "فرصة مبادرة مجتمعية", country: "لبنان", city: "بيروت", lat: 33.8938, lon: 35.5018, layer: "initiatives", category: "مجتمع", description: "مثال توضيحي لفرصة تعاون بين جهة محلية ومتطوعين.", status: "بيانات تجريبية", evidence: "لا يوجد تنفيذ أو أثر مثبت لهذا المثال" },
];

const layerLabels: Record<Layer, string> = { needs: "احتياجات", resources: "موارد وقدرات", initiatives: "مبادرات" };
const layerColors: Record<Layer, string> = { needs: "#f59e0b", resources: "#38bdf8", initiatives: "#34d399" };

function project(lon: number, lat: number) {
  return { x: ((lon + 180) / 360) * 900, y: ((90 - lat) / 180) * 430 };
}

export default function HumanityRadarPage() {
  const [layer, setLayer] = useState<"all" | Layer>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(demoPoints[0]);
  const visible = useMemo(() => demoPoints.filter((p) =>
    (layer === "all" || p.layer === layer) &&
    [p.title, p.country, p.city, p.category].join(" ").toLowerCase().includes(query.trim().toLowerCase())
  ), [layer, query]);
  const land = "#244b55";
  const border = "#47717a";

  return (
    <main dir="rtl" style={{ minHeight: "100vh", padding: "clamp(16px,3vw,34px)", color: "#e8f3f5", background: "radial-gradient(circle at 80% 0%,#153747 0,#081923 48%,#06121b 100%)" }}>
      <div style={{ maxWidth: 1440, margin: "0 auto" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#8edbd0", textDecoration: "none", marginBottom: 20 }}><ArrowRight size={17}/> العودة إلى HUMANITY ONE</Link>
        <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "end", gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ color: "#79d7c8", fontSize: 12, fontWeight: 800, letterSpacing: 1 }}>HUMANITY ONE / INTELLIGENCE</div>
            <h1 style={{ fontSize: "clamp(28px,4vw,42px)", margin: "8px 0", lineHeight: 1.25 }}>الرادار الإنساني</h1>
            <p style={{ color: "#a9c0c9", margin: 0, lineHeight: 1.8 }}>خريطة تفاعلية لاستكشاف الاحتياجات والموارد والمبادرات وربطها بفرص المساعدة.</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ border: "1px solid #31515d", background: "#102936", padding: "8px 12px", borderRadius: 99, fontSize: 12 }}>نسخة أولية تجريبية</span>
            <span style={{ border: "1px solid #31515d", background: "#102936", padding: "8px 12px", borderRadius: 99, fontSize: 12 }}>لا توجد بيانات حية بعد</span>
          </div>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginBottom: 14 }}>
          {(["needs","resources","initiatives"] as Layer[]).map((key) => (
            <button key={key} type="button" onClick={() => setLayer(layer === key ? "all" : key)} aria-pressed={layer === key} style={{ textAlign: "right", border: layer === key ? `1px solid ${layerColors[key]}` : "1px solid #294653", background: layer === key ? "#173541" : "#0d2430", color: "#e8f3f5", borderRadius: 13, padding: "12px 14px", cursor: "pointer", font: "inherit" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800 }}><i style={{ width: 9, height: 9, borderRadius: 20, background: layerColors[key] }}/>{layerLabels[key]}</span>
              <small style={{ display: "block", color: "#9eb6c0", marginTop: 5 }}>عرض هذه الطبقة على الخريطة</small>
            </button>
          ))}
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.8fr) minmax(280px,0.85fr)", gap: 14, alignItems: "start" }}>
          <section style={{ border: "1px solid #294653", borderRadius: 18, overflow: "hidden", background: "#091d29" }}>
            <div style={{ padding: 13, display: "flex", gap: 10, alignItems: "center", borderBottom: "1px solid #294653" }}>
              <Search size={17} color="#82cfc4"/>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث عن دولة أو مدينة أو احتياج..." aria-label="البحث في الرادار" style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: "transparent", color: "#effafa", font: "inherit" }}/>
              <Filter size={17} color="#8baab5"/>
            </div>
            <div style={{ padding: 8, background: "linear-gradient(180deg,#102f3c,#0a202d)" }}>
              <svg viewBox="0 0 900 430" role="img" aria-label="خريطة عالمية تفاعلية تجريبية" style={{ width: "100%", height: "auto", display: "block", minHeight: 260 }}>
                <defs><pattern id="radar-grid" width="45" height="45" patternUnits="userSpaceOnUse"><path d="M 45 0 L 0 0 0 45" fill="none" stroke="#234653" strokeWidth="0.7"/></pattern></defs>
                <rect width="900" height="430" fill="#0b2633"/>
                <rect width="900" height="430" fill="url(#radar-grid)"/>
                {[90,180,270,360].map(y=><line key={y} x1="0" x2="900" y1={y} y2={y} stroke="#31535e" strokeDasharray="3 7" opacity=".65"/>)}
                <g fill={land} stroke={border} strokeWidth="1.5" opacity=".95">
                  <path d="M75 85 L110 57 165 48 205 66 224 100 206 125 220 151 196 176 180 214 151 226 135 197 112 181 100 147 76 130Z"/>
                  <path d="M205 232 L235 245 252 278 245 317 224 357 207 336 195 293 181 265Z"/>
                  <path d="M390 85 L426 66 460 73 478 95 466 119 438 126 419 111Z"/>
                  <path d="M405 137 L445 119 489 132 515 164 504 206 478 245 453 278 430 259 417 218 394 185Z"/>
                  <path d="M485 77 L535 53 590 59 633 78 681 72 727 94 766 125 744 154 710 157 686 184 651 177 630 199 603 181 580 155 548 151 523 125 493 118Z"/>
                  <path d="M684 213 L723 201 762 215 790 244 779 278 746 291 714 274 692 245Z"/>
                  <path d="M817 315 L841 308 858 323 850 344 825 343Z"/>
                  <path d="M330 86 L345 75 359 84 352 105 336 108Z"/>
                </g>
                <g fill="none" stroke="#6aa4a9" opacity=".25"><ellipse cx="450" cy="215" rx="420" ry="190"/><ellipse cx="450" cy="215" rx="300" ry="190"/></g>
                {visible.map((point) => { const p = project(point.lon, point.lat); const active = selected?.id === point.id; return <g key={point.id} onClick={() => setSelected(point)} role="button" tabIndex={0} aria-label={point.title} style={{ cursor: "pointer" }} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelected(point); }}><circle cx={p.x} cy={p.y} r={active ? 15 : 11} fill={layerColors[point.layer]} opacity=".2"/><circle cx={p.x} cy={p.y} r={active ? 7 : 5.5} fill={layerColors[point.layer]} stroke="#eaffff" strokeWidth={active ? 2 : 1}/><title>{point.city} — {point.title}</title></g>; })}
              </svg>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14, padding: "8px 10px", color: "#b7cbd1", fontSize: 12 }}>
                {(["needs","resources","initiatives"] as Layer[]).map(key=><span key={key} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><i style={{ width: 8, height: 8, borderRadius: 20, background: layerColors[key] }}/>{layerLabels[key]}</span>)}
                <span style={{ marginRight: "auto", color: "#86a4af" }}>{visible.length} مواقع في بيانات العرض</span>
              </div>
            </div>
          </section>

          <aside style={{ display: "grid", gap: 12 }}>
            <section style={{ border: "1px solid #294653", borderRadius: 16, padding: 16, background: "#102936" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#83d6ca", fontWeight: 800, marginBottom: 12 }}><MapPin size={17}/> تفاصيل الموقع المحدد</div>
              {selected && visible.some(p=>p.id===selected.id) ? <>
                <div style={{ color: layerColors[selected.layer], fontSize: 12, fontWeight: 800 }}>{layerLabels[selected.layer]} · {selected.category}</div>
                <h2 style={{ fontSize: 20, lineHeight: 1.5, margin: "8px 0" }}>{selected.title}</h2>
                <div style={{ color: "#b2c7cf", fontSize: 13, marginBottom: 10 }}>{selected.city}، {selected.country}</div>
                <p style={{ color: "#c5d5da", fontSize: 13, lineHeight: 1.9 }}>{selected.description}</p>
                <div style={{ borderRadius: 10, background: "#0a202b", padding: 11, color: "#b4c9cf", fontSize: 12, lineHeight: 1.8 }}><b>حالة التحقق:</b> {selected.status}<br/><b>المصدر:</b> {selected.evidence}</div>
              </> : <p style={{ color: "#a9c0c9", lineHeight: 1.8 }}>لا توجد نتيجة مطابقة. غيّر البحث أو الطبقة.</p>}
            </section>
            <section style={{ border: "1px solid #294653", borderRadius: 16, padding: 16, background: "#102936" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#83d6ca", fontWeight: 800, marginBottom: 10 }}><Info size={17}/> قائمة المواقع</div>
              <div style={{ display: "grid", gap: 8, maxHeight: 300, overflowY: "auto" }}>
                {visible.map(point=><button type="button" key={point.id} onClick={()=>setSelected(point)} style={{ textAlign: "right", border: selected?.id===point.id ? "1px solid #6bcfc1" : "1px solid #294653", borderRadius: 10, padding: 10, background: "#0b222e", color: "#e7f2f4", cursor: "pointer", font: "inherit" }}><span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700 }}><i style={{ width: 8, height: 8, borderRadius: 20, background: layerColors[point.layer] }}/>{point.title}</span><small style={{ display: "block", color: "#9eb6c0", marginTop: 5 }}>{point.city}، {point.country}</small></button>)}
                {!visible.length && <p style={{ color: "#a9c0c9", fontSize: 13 }}>لا توجد مواقع مطابقة.</p>}
              </div>
            </section>
          </aside>
        </div>

        <section style={{ marginTop: 14, border: "1px solid #765b32", background: "#2a2419", borderRadius: 14, padding: 14, display: "flex", gap: 10, alignItems: "start" }}>
          <ShieldCheck size={20} color="#f3c879" style={{ flexShrink: 0, marginTop: 2 }}/>
          <div style={{ color: "#e8d7b5", fontSize: 12, lineHeight: 1.9 }}><b>شفافية البيانات:</b> جميع النقاط الظاهرة حاليًا أمثلة توضيحية مصطنعة لا تمثل بلاغات أو أزمات أو منظمات حقيقية. لن تُعرض بيانات فعلية إلا بعد ربط مصادر موثوقة، وتوثيق المصدر وتاريخ الرصد وحالة التحقق. لا تُعرض مواقع المستفيدين الأفراد للعامة.</div>
        </section>
      </div>
    </main>
  );
}
