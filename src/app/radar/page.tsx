"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ShieldCheck, Info, Globe2, Map } from "lucide-react";

type Access = {
  authenticated: boolean;
  view: "central-admin" | "organization" | "schematic";
  role: string;
  records: Array<never>;
  dataConnected: boolean;
};

type Layer = "needs" | "resources" | "initiatives";
const layerLabels: Record<Layer, string> = {
  needs: "الاحتياجات",
  resources: "الموارد والقدرات",
  initiatives: "المبادرات",
};
const layerColors: Record<Layer, string> = {
  needs: "#f59e0b",
  resources: "#38bdf8",
  initiatives: "#34d399",
};

function SchematicMap() {
  return (
    <svg viewBox="0 0 900 430" role="img" aria-label="رسم SVG تخطيطي توضيحي للعالم، وليس خريطة جغرافية دقيقة" style={{ width: "100%", height: "auto", display: "block", minHeight: 260 }}>
      <defs>
        <pattern id="radar-grid-v2" width="45" height="45" patternUnits="userSpaceOnUse">
          <path d="M 45 0 L 0 0 0 45" fill="none" stroke="#234653" strokeWidth="0.7" />
        </pattern>
      </defs>
      <rect width="900" height="430" fill="#0b2633" />
      <rect width="900" height="430" fill="url(#radar-grid-v2)" />
      {[90, 180, 270, 360].map((y) => <line key={y} x1="0" x2="900" y1={y} y2={y} stroke="#31535e" strokeDasharray="3 7" opacity=".65" />)}
      <g fill="#244b55" stroke="#47717a" strokeWidth="1.5" opacity=".95">
        <path d="M75 85 L110 57 165 48 205 66 224 100 206 125 220 151 196 176 180 214 151 226 135 197 112 181 100 147 76 130Z" />
        <path d="M205 232 L235 245 252 278 245 317 224 357 207 336 195 293 181 265Z" />
        <path d="M390 85 L426 66 460 73 478 95 466 119 438 126 419 111Z" />
        <path d="M405 137 L445 119 489 132 515 164 504 206 478 245 453 278 430 259 417 218 394 185Z" />
        <path d="M485 77 L535 53 590 59 633 78 681 72 727 94 766 125 744 154 710 157 686 184 651 177 630 199 603 181 580 155 548 151 523 125 493 118Z" />
        <path d="M684 213 L723 201 762 215 790 244 779 278 746 291 714 274 692 245Z" />
        <path d="M817 315 L841 308 858 323 850 344 825 343Z" />
        <path d="M330 86 L345 75 359 84 352 105 336 108Z" />
      </g>
      <g fill="none" stroke="#6aa4a9" opacity=".25">
        <ellipse cx="450" cy="215" rx="420" ry="190" />
        <ellipse cx="450" cy="215" rx="300" ry="190" />
      </g>
      <text x="450" y="398" textAnchor="middle" fill="#8eabb5" fontSize="15">عرض تخطيطي — لا يمثل حدودًا أو مواقع جغرافية دقيقة</text>
    </svg>
  );
}

export default function HumanityRadarPage() {
  const [access, setAccess] = useState<Access | null>(null);
  const [layer, setLayer] = useState<"all" | Layer>("all");

  useEffect(() => {
    let active = true;
    fetch("/api/radar/access", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("تعذر التحقق من صلاحية العرض");
        return response.json();
      })
      .then((data: Access) => { if (active) setAccess(data); })
      .catch(() => {
        if (active) setAccess({ authenticated: false, view: "schematic", role: "GUEST", records: [], dataConnected: false });
      });
    return () => { active = false; };
  }, []);

  const isCentralAdmin = access?.view === "central-admin";
  const visibleLayerText = useMemo(
    () => layer === "all" ? "كل الطبقات" : layerLabels[layer],
    [layer]
  );

  return (
    <main dir="rtl" style={{ minHeight: "100vh", padding: "clamp(16px,3vw,34px)", color: "#e8f3f5", background: "radial-gradient(circle at 80% 0%,#153747 0,#081923 48%,#06121b 100%)" }}>
      <div style={{ maxWidth: 1440, margin: "0 auto" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#8edbd0", textDecoration: "none", marginBottom: 20 }}>
          <ArrowRight size={17} /> العودة إلى HUMANITY ONE
        </Link>

        <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "end", gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ color: "#79d7c8", fontSize: 12, fontWeight: 800, letterSpacing: 1 }}>HUMANITY ONE / INTELLIGENCE</div>
            <h1 style={{ fontSize: "clamp(28px,4vw,42px)", margin: "8px 0", lineHeight: 1.25 }}>الرادار الإنساني</h1>
            <p style={{ color: "#a9c0c9", margin: 0, lineHeight: 1.8 }}>
              {isCentralAdmin
                ? "عرض جغرافي حقيقي للإدارة المركزية، مع إظهار البيانات الموثقة فقط عند ربط مصادرها."
                : "عرض تخطيطي للمنظمات، يحافظ على خصوصية بيانات الجهات الأخرى والمستفيدين."}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ border: "1px solid #31515d", background: "#102936", padding: "8px 12px", borderRadius: 99, fontSize: 12 }}>
              {access ? (isCentralAdmin ? "الإدارة المركزية" : access.view === "organization" ? "حساب منظمة" : "عرض تخطيطي") : "جارٍ التحقق من الصلاحية…"}
            </span>
            <span style={{ border: "1px solid #765b32", background: "#2a2419", padding: "8px 12px", borderRadius: 99, fontSize: 12, color: "#e8d7b5" }}>
              لا توجد بيانات رادار موثقة مرتبطة بعد
            </span>
          </div>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginBottom: 14 }}>
          {(["needs", "resources", "initiatives"] as Layer[]).map((key) => (
            <button key={key} type="button" onClick={() => setLayer(layer === key ? "all" : key)} aria-pressed={layer === key}
              style={{ textAlign: "right", border: layer === key ? `1px solid ${layerColors[key]}` : "1px solid #294653", background: layer === key ? "#173541" : "#0d2430", color: "#e8f3f5", borderRadius: 13, padding: "12px 14px", cursor: "pointer", font: "inherit" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800 }}>
                <i style={{ width: 9, height: 9, borderRadius: 20, background: layerColors[key] }} />{layerLabels[key]}
              </span>
              <small style={{ display: "block", color: "#9eb6c0", marginTop: 5 }}>تحديد طبقة العرض: {layerLabels[key]}</small>
            </button>
          ))}
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))", gap: 14, alignItems: "start" }}>
          <section style={{ border: "1px solid #294653", borderRadius: 18, overflow: "hidden", background: "#091d29" }}>
            <div style={{ padding: 13, display: "flex", gap: 10, alignItems: "center", borderBottom: "1px solid #294653", color: "#83d6ca", fontWeight: 800 }}>
              {isCentralAdmin ? <Globe2 size={18} /> : <Map size={18} />}
              {isCentralAdmin ? "الخريطة الجغرافية الحقيقية" : "الخريطة التخطيطية للمنظمات"}
              <span style={{ marginRight: "auto", color: "#86a4af", fontSize: 12, fontWeight: 400 }}>{visibleLayerText}</span>
            </div>
            <div style={{ padding: 8, background: "linear-gradient(180deg,#102f3c,#0a202d)" }}>
              {isCentralAdmin ? (
                <iframe
                  title="الخريطة الجغرافية العالمية — OpenStreetMap"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=-180%2C-85%2C180%2C85&layer=mapnik"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  style={{ width: "100%", height: 430, border: 0, borderRadius: 10, background: "#dbe5e8" }}
                />
              ) : <SchematicMap />}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14, padding: "8px 10px", color: "#b7cbd1", fontSize: 12 }}>
                {(["needs", "resources", "initiatives"] as Layer[]).map((key) => (
                  <span key={key} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <i style={{ width: 8, height: 8, borderRadius: 20, background: layerColors[key] }} />{layerLabels[key]}
                  </span>
                ))}
                <span style={{ marginRight: "auto", color: "#86a4af" }}>0 سجلات موثقة</span>
              </div>
            </div>
          </section>

          <aside style={{ display: "grid", gap: 12 }}>
            <section style={{ border: "1px solid #294653", borderRadius: 16, padding: 16, background: "#102936" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#83d6ca", fontWeight: 800, marginBottom: 12 }}>
                <Info size={17} /> حالة بيانات الرادار
              </div>
              <h2 style={{ fontSize: 19, lineHeight: 1.5, margin: "8px 0" }}>لا توجد سجلات موثقة للعرض حتى الآن</h2>
              <p style={{ color: "#c5d5da", fontSize: 13, lineHeight: 1.9, marginBottom: 0 }}>
                تم تجهيز اختلاف نوع الخريطة بحسب جلسة الدخول، لكن قاعدة البيانات الحالية لا تحتوي على سجل رادار موحد موثق ومربوط بمصادره. لذلك لن نعرض نقاطًا تجريبية أو نختلق احتياجات أو موارد أو مبادرات.
              </p>
            </section>
            <section style={{ border: "1px solid #294653", borderRadius: 16, padding: 16, background: "#102936" }}>
              <div style={{ color: "#83d6ca", fontWeight: 800, marginBottom: 10 }}>حدود الوصول</div>
              <ul style={{ color: "#c5d5da", fontSize: 13, lineHeight: 2, paddingRight: 20, margin: 0 }}>
                {isCentralAdmin ? (
                  <>
                    <li>الخريطة الجغرافية الحقيقية متاحة للإدارة المركزية فقط.</li>
                    <li>لا تُعرض مواقع المستفيدين الشخصية على الخريطة.</li>
                    <li>لا تظهر بيانات فعلية إلا بعد توثيق المصدر وتاريخ الرصد والتحقق.</li>
                  </>
                ) : (
                  <>
                    <li>تظهر الخريطة التخطيطية SVG فقط.</li>
                    <li>لا يمكن للمنظمة الاطلاع على بيانات المنظمات الأخرى.</li>
                    <li>لا تظهر المواقع الحساسة أو مواقع المستفيدين الأفراد.</li>
                  </>
                )}
              </ul>
            </section>
          </aside>
        </div>

        <section style={{ marginTop: 14, border: "1px solid #765b32", background: "#2a2419", borderRadius: 14, padding: 14, display: "flex", gap: 10, alignItems: "start" }}>
          <ShieldCheck size={20} color="#f3c879" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ color: "#e8d7b5", fontSize: 12, lineHeight: 1.9 }}>
            <b>الشفافية وحماية الخصوصية:</b> خريطة الإدارة تعتمد على OpenStreetMap لعرض جغرافيا حقيقية. صلاحية عرضها تُحدد من الخادم وفق جلسة الإدارة المركزية، وليس بإخفاء عنصر في المتصفح فقط. تبقى بيانات الرادار فارغة حتى إنشاء مصدر بيانات موثق؛ ولا يتم كشف عناوين المستفيدين أو مواقعهم الدقيقة.
          </div>
        </section>
      </div>
    </main>
  );
}
