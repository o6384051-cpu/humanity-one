"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Activity, ArrowUpLeft, Bell, BriefcaseBusiness, Building2, CalendarDays,
  CheckCircle2, ChevronLeft, ClipboardList, FileText, HeartHandshake,
  LayoutDashboard, LockKeyhole, MapPinned, MessageSquare, Plus, Settings2,
  ShieldCheck, Users, Wallet, Globe2, HandHeart
} from "lucide-react";

const nav = [
  { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
  { id: "profile", label: "ملف المنظمة", icon: Building2 },
  { id: "initiatives", label: "المبادرات والمشروعات", icon: HeartHandshake },
  { id: "opportunities", label: "فرص العمل والتطوع", icon: BriefcaseBusiness },
  { id: "requests", label: "طلبات التعاون", icon: ClipboardList },
  { id: "beneficiaries", label: "الإحالات والمستفيدون", icon: Users },
  { id: "team", label: "الفريق والصلاحيات", icon: ShieldCheck },
  { id: "sharing", label: "مشاركة البيانات", icon: LockKeyhole },
  { id: "messages", label: "المراسلات", icon: MessageSquare },
  { id: "reports", label: "التقارير", icon: FileText },
];
const demoActivities = [
  { title: "تم تحديث بيانات المبادرة", detail: "مبادرة دعم التعليم المجتمعي · منذ ساعتين", tag: "تحديث" },
  { title: "طلب تعاون جديد بانتظار المراجعة", detail: "شريك مجتمعي · أمس", tag: "مراجعة" },
  { title: "اكتمل تقرير النشاط الشهري", detail: "التقارير · منذ يومين", tag: "جاهز" },
];
const demoInitiatives = [
  { name: "دعم التعليم المجتمعي", category: "تعليم وتدريب", status: "مسودة داخلية", progress: 68 },
  { name: "سلة احتياج الأسرة", category: "مساندة إنسانية", status: "قيد التخطيط", progress: 35 },
  { name: "التأهيل لسوق العمل", category: "تمكين اقتصادي", status: "مسودة داخلية", progress: 52 },
];

export default function OrganizationWorkspacePreview() {
  const [active, setActive] = useState("overview");
  const [notice, setNotice] = useState("");
  const current = nav.find((item) => item.id === active) ?? nav[0];
  const isOverview = active === "overview";
  const demoAction = (label: string) => setNotice(`هذه معاينة توضيحية: ${label} غير متصل ببيانات حقيقية بعد.`);

  return (
    <main dir="rtl" lang="ar" style={{ minHeight: "100vh", background: "#07131d", color: "#e8f2f5", fontFamily: "Cairo,system-ui,sans-serif" }}>
      <div style={{ background: "#49391b", color: "#ffe7ae", padding: "10px 18px", textAlign: "center", fontSize: 13, fontWeight: 800 }}>
        وضع المعاينة التجريبية — كل الأرقام والأنشطة المعروضة توضيحية وليست بيانات منظمات حقيقية
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(220px,270px) 1fr", minHeight: "calc(100vh - 40px)" }}>
        <aside style={{ background: "#0b1d28", borderLeft: "1px solid #1e3945", padding: "22px 16px", display: "flex", flexDirection: "column", gap: 18 }}>
          <Link href="/" style={{ color: "#e8f2f5", textDecoration: "none", display: "flex", alignItems: "center", gap: 10, padding: "4px 8px" }}>
            <span style={{ width: 38, height: 38, borderRadius: 12, background: "#16483f", display: "grid", placeItems: "center" }}><Globe2 size={21} color="#8ce0d5"/></span>
            <span><b style={{ display: "block", letterSpacing: ".3px" }}>HUMANITY ONE</b><small style={{ color: "#88a5b0" }}>مساحة المنظمات المستقلة</small></span>
          </Link>
          <div style={{ padding: 14, borderRadius: 14, background: "#102b37", border: "1px solid #28505a" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: "#1a5a52", display: "grid", placeItems: "center" }}><Building2 size={22}/></div>
              <div><b style={{ display: "block", fontSize: 14 }}>منظمة نموذجية</b><small style={{ color: "#9bb8c1" }}>حساب معاينة مستقل</small></div>
            </div>
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6, color: "#f4d38a", fontSize: 12 }}><ShieldCheck size={14}/> حالة اعتماد تجريبية</div>
          </div>
          <div style={{ color: "#6f929e", fontSize: 11, fontWeight: 900, padding: "0 9px" }}>مساحة عمل المنظمة</div>
          <nav style={{ display: "grid", gap: 5 }}>
            {nav.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => { setActive(id); setNotice(""); }} style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", border: active === id ? "1px solid #28665f" : "1px solid transparent", borderRadius: 10, padding: "11px 10px", textAlign: "right", background: active === id ? "#153d3b" : "transparent", color: active === id ? "#a5eee0" : "#b7cbd1", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: active === id ? 800 : 600 }}><Icon size={17}/><span style={{ flex: 1 }}>{label}</span>{active === id && <ChevronLeft size={15}/>}</button>)}
          </nav>
          <div style={{ marginTop: "auto", borderTop: "1px solid #203a45", paddingTop: 15, display: "grid", gap: 8 }}>
            <div style={{ color: "#86a3ad", fontSize: 12, lineHeight: 1.8 }}>هذه المساحة منفصلة عن لوحة إدارة HUMANITY ONE. صلاحيات المنظمة لا تمنحها الوصول إلى بيانات منظمة أخرى.</div>
            <Link href="/organization/login" style={{ color: "#9de6dc", textDecoration: "none", fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>الانتقال إلى دخول المنظمة <ArrowUpLeft size={15}/></Link>
          </div>
        </aside>

        <section style={{ minWidth: 0 }}>
          <header style={{ minHeight: 72, borderBottom: "1px solid #1e3945", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px clamp(16px,3vw,34px)", background: "#091923" }}>
            <div><div style={{ color: "#83b0b9", fontSize: 12 }}>مساحة المنظمة المستقلة / {current.label}</div><b style={{ fontSize: 18 }}>{isOverview ? "مرحبًا بك في مساحة عمل منظمتك" : current.label}</b></div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}><button onClick={() => demoAction("الإشعارات")} aria-label="الإشعارات" style={iconButton}><Bell size={18}/></button><span style={{ color: "#9bb5bd", fontSize: 12 }}>مسؤول المنظمة</span><div style={{ width: 36, height: 36, borderRadius: "50%", background: "#1b4d50", display: "grid", placeItems: "center" }}><Users size={17}/></div></div>
          </header>
          <div style={{ padding: "clamp(18px,3vw,34px)", maxWidth: 1440, margin: "0 auto" }}>
            {notice && <div role="status" style={{ marginBottom: 18, padding: 13, borderRadius: 10, background: "#332c1d", border: "1px solid #67542c", color: "#ffe4a7", fontSize: 13 }}>{notice}</div>}
            {isOverview ? <>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
                <div><div style={{ color: "#80cfc4", fontSize: 13, fontWeight: 800 }}>لوحة المنظمة</div><h1 style={{ margin: "7px 0", fontSize: "clamp(23px,3vw,31px)" }}>مساحة عمل مستقلة وآمنة</h1><p style={{ margin: 0, color: "#9db4bd", lineHeight: 1.8 }}>أدر أنشطة منظمتك وفريقك وطلبات التعاون من مكان واحد.</p></div>
                <button onClick={() => demoAction("إنشاء مبادرة جديدة")} style={primaryButton}><Plus size={17}/> إنشاء مبادرة</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,190px),1fr))", gap: 13 }}>
                {[
                  { label: "المبادرات", value: "03", note: "نماذج توضيحية", icon: HeartHandshake },
                  { label: "طلبات التعاون", value: "02", note: "طلبان تجريبيان", icon: ClipboardList },
                  { label: "أعضاء الفريق", value: "08", note: "حسابات توضيحية", icon: Users },
                  { label: "الإحالات النشطة", value: "12", note: "ليست سجلات حقيقية", icon: HandHeart },
                ].map(({ label, value, note, icon: Icon }) => <article key={label} style={statCard}><div style={{ display: "flex", justifyContent: "space-between", color: "#9db8c0", fontSize: 13 }}><span>{label}</span><Icon size={19} color="#83d9ce"/></div><div style={{ fontSize: 30, fontWeight: 900, margin: "12px 0 3px" }}>{value}</div><small style={{ color: "#7fa29d" }}>{note}</small></article>)}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))", gap: 16, marginTop: 18 }}>
                <article style={panel}>
                  <div style={panelHeader}><div><b>المبادرات والمشروعات</b><div style={muted}>متابعة نماذج أنشطة المنظمة</div></div><button onClick={() => setActive("initiatives")} style={textButton}>عرض الكل <ChevronLeft size={14}/></button></div>
                  <div style={{ display: "grid", gap: 17, marginTop: 20 }}>{demoInitiatives.map((item) => <div key={item.name}><div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 13 }}><b>{item.name}</b><span style={{ color: "#8fd8ce", whiteSpace: "nowrap" }}>{item.progress}%</span></div><div style={{ color: "#87a4ad", fontSize: 12, margin: "5px 0 9px" }}>{item.category} · {item.status}</div><div style={{ height: 6, background: "#1c3741", borderRadius: 9, overflow: "hidden" }}><div style={{ width: item.progress + "%", height: "100%", background: "#51b9a9", borderRadius: 9 }}/></div></div>)}</div>
                </article>
                <article style={panel}>
                  <div style={panelHeader}><div><b>آخر النشاطات</b><div style={muted}>سجل توضيحي لحركة مساحة المنظمة</div></div><Activity size={19} color="#83d9ce"/></div>
                  <div style={{ display: "grid", gap: 0, marginTop: 10 }}>{demoActivities.map((item, i) => <div key={item.title} style={{ display: "flex", gap: 12, padding: "15px 0", borderBottom: i < 2 ? "1px solid #203a45" : 0 }}><span style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 10, background: "#163c3b", display: "grid", placeItems: "center", color: "#8de0d3" }}><CheckCircle2 size={17}/></span><div style={{ flex: 1 }}><b style={{ fontSize: 13 }}>{item.title}</b><div style={{ color: "#88a5ae", fontSize: 12, marginTop: 5 }}>{item.detail}</div></div><small style={{ color: "#9bded4" }}>{item.tag}</small></div>)}</div>
                </article>
              </div>
              <div style={{ ...panel, marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 13 }}><span style={{ width: 42, height: 42, borderRadius: 12, background: "#173c48", display: "grid", placeItems: "center" }}><LockKeyhole color="#8edbd1"/></span><div><b>خصوصية البيانات وصلاحيات المشاركة</b><div style={muted}>أنت تتحكم في البيانات التي تشاركها ومع من ولماذا.</div></div></div><button onClick={() => setActive("sharing")} style={secondaryButton}>إدارة الصلاحيات <ChevronLeft size={15}/></button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,210px),1fr))", gap: 12, marginTop: 16 }}>
                {[["ملف المنظمة","تحديث بيانات الجهة ووسائل التواصل",Building2,"profile"],["فريق العمل","إضافة أعضاء وتحديد صلاحياتهم",Users,"team"],["المراسلات","التواصل مع فريق المنصة",MessageSquare,"messages"]].map(([title, desc, Icon, id]) => <button key={String(id)} onClick={() => setActive(String(id))} style={{ ...panel, textAlign: "right", cursor: "pointer", color: "#e8f2f5", fontFamily: "inherit" }}><Icon size={21} color="#83d9ce"/><b style={{ display: "block", margin: "10px 0 5px" }}>{String(title)}</b><span style={{ color: "#91aeb7", fontSize: 12 }}>{String(desc)}</span></button>)}
              </div>
            </> : <article style={{ ...panel, minHeight: 360 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}><span style={{ width: 44, height: 44, borderRadius: 12, background: "#163d3b", display: "grid", placeItems: "center" }}><current.icon size={22} color="#91e1d5"/></span><div><h1 style={{ margin: 0, fontSize: 24 }}>{current.label}</h1><p style={{ color: "#91aeb7", margin: "5px 0 0", fontSize: 13 }}>قسم مستقل ضمن مساحة منظمتك</p></div></div>
              {active === "sharing" ? <div style={{ display: "grid", gap: 12 }}>{["بيانات ملف المنظمة","بيانات المبادرات والأنشطة","الإحالات وبيانات المستفيدين","معلومات التواصل"].map((item) => <div key={item} style={{ padding: 15, borderRadius: 11, background: "#102632", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}><span>{item}</span><span style={{ color: "#a9d9d0", fontSize: 12 }}>مشاركة بموافقة وصلاحية محددة</span></div>)}</div> : <><p style={{ color: "#b0c4cb", lineHeight: 1.9 }}>هنا تدير المنظمة هذا القسم بنفسها، وتظل بياناتها منفصلة عن بقية المنظمات. الإجراءات الفعلية وربط البيانات ستُفعّل بعد استكمال صلاحيات الحساب وربط الخدمات.</p><button onClick={() => demoAction("إضافة عنصر في قسم " + current.label)} style={primaryButton}><Plus size={17}/> إضافة جديد</button><div style={{ marginTop: 24, border: "1px dashed #3b5a65", borderRadius: 12, padding: 24, textAlign: "center", color: "#8faab3" }}><current.icon size={28}/><p style={{ marginBottom: 0 }}>لا توجد سجلات حقيقية في وضع المعاينة.</p></div></>}
            </article>}
            <footer style={{ padding: "24px 0 8px", color: "#688793", fontSize: 12, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}><span>HUMANITY ONE · استقلال المنظمة وخصوصية المستفيد</span><span>معاينة واجهة فقط — لا تحفظ بيانات ولا ترسل طلبات</span></footer>
          </div>
        </section>
      </div>
      <style jsx>{`
        @media(max-width:760px){main>div:nth-child(2){grid-template-columns:1fr!important} aside{border-left:0!important;border-bottom:1px solid #1e3945} aside nav{grid-template-columns:repeat(2,minmax(0,1fr))!important} aside nav button{font-size:11px!important;padding:9px 7px!important} }
        @media(max-width:420px){aside nav{grid-template-columns:1fr!important}}
      `}</style>
    </main>
  );
}

const statCard: React.CSSProperties = { background: "#0d222e", border: "1px solid #25434f", borderRadius: 15, padding: 18 };
const panel: React.CSSProperties = { background: "#0c202b", border: "1px solid #25434f", borderRadius: 15, padding: 20 };
const panelHeader: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 };
const muted: React.CSSProperties = { color: "#88a5ae", fontSize: 12, marginTop: 5 };
const primaryButton: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 16px", border: 0, borderRadius: 10, background: "#56c6b7", color: "#062027", fontWeight: 900, cursor: "pointer", fontFamily: "inherit" };
const secondaryButton: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 13px", border: "1px solid #35645f", borderRadius: 9, background: "#102d32", color: "#a5e7dd", cursor: "pointer", fontFamily: "inherit" };
const textButton: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 4, border: 0, background: "transparent", color: "#8ddbd0", cursor: "pointer", fontFamily: "inherit", fontSize: 12 };
const iconButton: React.CSSProperties = { width: 36, height: 36, borderRadius: 10, border: "1px solid #294653", background: "#102632", color: "#b9d2d8", display: "grid", placeItems: "center", cursor: "pointer" };
