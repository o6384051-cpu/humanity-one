"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, ShieldCheck, Info, Globe2, Map, RefreshCw, PlusCircle, CheckCircle2, Clock3, Lock, Share2 } from "lucide-react";

type Access = { authenticated: boolean; view: "central-admin" | "organization" | "schematic"; role: string; organizationId?: string | null };
type RecordType = "NEED" | "RESOURCE" | "INITIATIVE";
type SharingMode = "PRIVATE" | "SHARED" | "NETWORK";
type RadarRecord = {
  id: string; organizationId: string; type: RecordType; title: string; description: string;
  country: string; city: string | null; area: string | null; sourceName: string; sourceUrl: string | null;
  observedAt: string; verificationStatus: string; verifiedAt: string | null; verificationNote: string | null;
  sharingMode: SharingMode; createdAt: string; organization: { id: string; name: string };
};
type Organization = { id: string; name: string };
type Draft = { type: RecordType; title: string; description: string; country: string; city: string; area: string; sourceName: string; sourceUrl: string; observedAt: string };
const emptyDraft: Draft = { type: "NEED", title: "", description: "", country: "مصر", city: "", area: "", sourceName: "", sourceUrl: "", observedAt: "" };
const labels: Record<RecordType, string> = { NEED: "احتياج", RESOURCE: "مورد أو قدرة", INITIATIVE: "مبادرة" };
const statusLabels: Record<string, string> = { PENDING: "بانتظار التحقق", VERIFIED: "موثق", REJECTED: "مرفوض" };

function SchematicMap() {
  return <svg viewBox="0 0 900 430" role="img" aria-label="رسم تخطيطي للعالم وليس خريطة دقيقة" style={{ width: "100%", height: "auto", display: "block", minHeight: 260 }}>
    <defs><pattern id="radar-grid-v3" width="45" height="45" patternUnits="userSpaceOnUse"><path d="M 45 0 L 0 0 0 45" fill="none" stroke="#234653" strokeWidth=".7" /></pattern></defs>
    <rect width="900" height="430" fill="#0b2633" /><rect width="900" height="430" fill="url(#radar-grid-v3)" />
    <g fill="#244b55" stroke="#47717a" strokeWidth="1.5"><path d="M75 85 L110 57 165 48 205 66 224 100 206 125 220 151 196 176 180 214 151 226 135 197 112 181 100 147 76 130Z" /><path d="M205 232 L235 245 252 278 245 317 224 357 207 336 195 293 181 265Z" /><path d="M390 85 L426 66 460 73 478 95 466 119 438 126 419 111Z" /><path d="M405 137 L445 119 489 132 515 164 504 206 478 245 453 278 430 259 417 218 394 185Z" /><path d="M485 77 L535 53 590 59 633 78 681 72 727 94 766 125 744 154 710 157 686 184 651 177 630 199 603 181 580 155 548 151 523 125 493 118Z" /><path d="M684 213 L723 201 762 215 790 244 779 278 746 291 714 274 692 245Z" /></g>
    <text x="450" y="398" textAnchor="middle" fill="#8eabb5" fontSize="15">عرض تخطيطي — لا يمثل مواقع أو حدودًا دقيقة</text>
  </svg>;
}

const panel: React.CSSProperties = { border: "1px solid #294653", borderRadius: 16, padding: 16, background: "#102936" };
const field: React.CSSProperties = { width: "100%", border: "1px solid #385763", borderRadius: 9, padding: "10px 12px", background: "#081d28", color: "#e8f3f5", font: "inherit", boxSizing: "border-box" };
const primary: React.CSSProperties = { border: 0, borderRadius: 9, padding: "10px 14px", background: "#168b83", color: "white", font: "inherit", fontWeight: 800, cursor: "pointer" };

export default function HumanityRadarPage() {
  const [access, setAccess] = useState<Access | null>(null);
  const [records, setRecords] = useState<RadarRecord[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [shareModes, setShareModes] = useState<Record<string, SharingMode>>({});
  const [shareTargets, setShareTargets] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isAdmin = access?.view === "central-admin";
  const canSubmit = access?.view === "organization";
  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const a = await fetch("/api/radar/access", { cache: "no-store" });
      if (!a.ok) throw new Error("تعذر التحقق من صلاحية الحساب");
      const accessData = await a.json() as Access;
      setAccess(accessData);
      if (accessData.authenticated) {
        const [r, o] = await Promise.all([
          fetch("/api/radar/records", { cache: "no-store" }),
          fetch("/api/radar/organizations", { cache: "no-store" }),
        ]);
        if (!r.ok) throw new Error("تعذر تحميل سجلات الرادار");
        const recordData = await r.json();
        setRecords(recordData.records ?? []);
        if (o.ok) { const orgData = await o.json(); setOrganizations(orgData.organizations ?? []); }
      } else {
        setRecords([]); setOrganizations([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ أثناء تحميل الرادار");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const counts = useMemo(() => ({
    total: records.length,
    pending: records.filter(r => r.verificationStatus === "PENDING").length,
    verified: records.filter(r => r.verificationStatus === "VERIFIED").length,
  }), [records]);

  async function submitRecord(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/radar/records", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, city: draft.city || null, area: draft.area || null, sourceUrl: draft.sourceUrl || null, observedAt: new Date(draft.observedAt).toISOString(), locationPrecision: "APPROXIMATE" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذر حفظ السجل");
      setDraft(emptyDraft); setMessage(data.message || "تم حفظ السجل بانتظار التحقق."); await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "تعذر حفظ السجل"); }
    finally { setSaving(false); }
  }

  async function verifyRecord(recordId: string, verificationStatus: "VERIFIED" | "REJECTED") {
    setError(""); setMessage("");
    try {
      const response = await fetch(`/api/radar/records/${recordId}/verify`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationStatus, verificationNote: (notes[recordId] || "").trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذر تحديث حالة التحقق");
      setMessage(verificationStatus === "VERIFIED" ? "تم اعتماد السجل." : "تم رفض السجل."); await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "تعذر تحديث السجل"); }
  }

  async function updateSharing(record: RadarRecord) {
    const sharingMode = shareModes[record.id] || record.sharingMode;
    const organizationIds = shareTargets[record.id] || [];
    setError(""); setMessage("");
    try {
      const response = await fetch(`/api/radar/records/${record.id}/share`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sharingMode, organizationIds }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذر تحديث المشاركة");
      setMessage("تم تحديث صلاحيات المشاركة."); await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "تعذر تحديث المشاركة"); }
  }

  const recordsToShow = records;

  return <main dir="rtl" style={{ minHeight: "100vh", padding: "clamp(16px,3vw,34px)", color: "#e8f3f5", background: "radial-gradient(circle at 80% 0%,#153747 0,#081923 48%,#06121b 100%)" }}>
    <div style={{ maxWidth: 1440, margin: "0 auto" }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#8edbd0", textDecoration: "none", marginBottom: 20 }}><ArrowRight size={17} /> العودة إلى HUMANITY ONE</Link>
      <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "end", gap: 16, marginBottom: 20 }}>
        <div><div style={{ color: "#79d7c8", fontSize: 12, fontWeight: 800, letterSpacing: 1 }}>HUMANITY ONE / INTELLIGENCE</div><h1 style={{ fontSize: "clamp(28px,4vw,42px)", margin: "8px 0", lineHeight: 1.25 }}>الرادار الإنساني</h1><p style={{ color: "#a9c0c9", margin: 0, lineHeight: 1.8 }}>منظومة موحدة لتسجيل الاحتياجات والموارد والمبادرات، مع توثيق المصدر والتحقق وحماية الخصوصية.</p></div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ border: "1px solid #31515d", background: "#102936", padding: "8px 12px", borderRadius: 99, fontSize: 12 }}>{access ? (isAdmin ? "الإدارة المركزية" : canSubmit ? "حساب منظمة" : "زائر") : "جارٍ التحقق…"}</span>
          <button type="button" onClick={() => void refresh()} style={{ ...primary, display: "inline-flex", alignItems: "center", gap: 7 }}><RefreshCw size={15} /> تحديث البيانات</button>
        </div>
      </header>

      {message && <div role="status" style={{ ...panel, borderColor: "#277e68", color: "#a9f0d5", marginBottom: 12 }}>{message}</div>}
      {error && <div role="alert" style={{ ...panel, borderColor: "#9b4b4b", color: "#ffc5c5", marginBottom: 12 }}>{error}</div>}

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 14 }}>
        {[["إجمالي السجلات", counts.total], ["بانتظار التحقق", counts.pending], ["سجلات موثقة", counts.verified]].map(([label, value]) => <div key={String(label)} style={panel}><small style={{ color: "#9eb6c0" }}>{label}</small><div style={{ fontSize: 28, fontWeight: 900, marginTop: 5 }}>{value}</div></div>)}
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))", gap: 14, alignItems: "start" }}>
        <section style={{ border: "1px solid #294653", borderRadius: 18, overflow: "hidden", background: "#091d29" }}>
          <div style={{ padding: 13, display: "flex", gap: 10, alignItems: "center", borderBottom: "1px solid #294653", color: "#83d6ca", fontWeight: 800 }}>{isAdmin ? <Globe2 size={18} /> : <Map size={18} />}{isAdmin ? "الخريطة الجغرافية للإدارة المركزية" : "الخريطة التخطيطية"}</div>
          <div style={{ padding: 8, background: "linear-gradient(180deg,#102f3c,#0a202d)" }}>
            {isAdmin ? <iframe title="خريطة OpenStreetMap" src="https://www.openstreetmap.org/export/embed.html?bbox=-180%2C-85%2C180%2C85&layer=mapnik" loading="lazy" referrerPolicy="no-referrer" style={{ width: "100%", height: 360, border: 0, borderRadius: 10, background: "#dbe5e8" }} /> : <SchematicMap />}
            <p style={{ color: "#9eb6c0", fontSize: 12, lineHeight: 1.8, margin: "8px 10px" }}>لا نعرض نقاطًا أو مواقع جغرافية إلا من سجلات موثقة. لا تُعرض مواقع المستفيدين الشخصية.</p>
          </div>
        </section>

        {canSubmit && <section style={panel}>
          <h2 style={{ margin: "0 0 12px", fontSize: 19, display: "flex", alignItems: "center", gap: 8 }}><PlusCircle size={19} color="#83d6ca" /> إضافة سجل إنساني</h2>
          <p style={{ color: "#a9c0c9", fontSize: 12, lineHeight: 1.8 }}>كل سجل يرتبط بمنظمتكم، ويبدأ خاصًا وبانتظار التحقق. لا تدخلوا عنوان منزل أو موقع مستفيد.</p>
          <form onSubmit={submitRecord} style={{ display: "grid", gap: 10 }}>
            <label style={{ display: "grid", gap: 5, fontSize: 13 }}>نوع السجل<select required value={draft.type} onChange={e => setDraft({ ...draft, type: e.target.value as RecordType })} style={field}><option value="NEED">احتياج</option><option value="RESOURCE">مورد أو قدرة</option><option value="INITIATIVE">مبادرة</option></select></label>
            <label style={{ display: "grid", gap: 5, fontSize: 13 }}>عنوان السجل<input required minLength={4} maxLength={180} value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} style={field} /></label>
            <label style={{ display: "grid", gap: 5, fontSize: 13 }}>الوصف<textarea required minLength={10} maxLength={4000} rows={3} value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} style={field} /></label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 8 }}>
              <label style={{ display: "grid", gap: 5, fontSize: 13 }}>الدولة<input required value={draft.country} onChange={e => setDraft({ ...draft, country: e.target.value })} style={field} /></label>
              <label style={{ display: "grid", gap: 5, fontSize: 13 }}>المدينة (اختياري)<input value={draft.city} onChange={e => setDraft({ ...draft, city: e.target.value })} style={field} /></label>
            </div>
            <label style={{ display: "grid", gap: 5, fontSize: 13 }}>المنطقة العامة (اختياري)<input value={draft.area} onChange={e => setDraft({ ...draft, area: e.target.value })} style={field} /></label>
            <label style={{ display: "grid", gap: 5, fontSize: 13 }}>اسم مصدر البيانات<input required minLength={2} value={draft.sourceName} onChange={e => setDraft({ ...draft, sourceName: e.target.value })} placeholder="مثال: تقرير ميداني موثق" style={field} /></label>
            <label style={{ display: "grid", gap: 5, fontSize: 13 }}>رابط المصدر (اختياري)<input type="url" value={draft.sourceUrl} onChange={e => setDraft({ ...draft, sourceUrl: e.target.value })} style={field} /></label>
            <label style={{ display: "grid", gap: 5, fontSize: 13 }}>تاريخ ووقت رصد البيانات<input required type="datetime-local" value={draft.observedAt} onChange={e => setDraft({ ...draft, observedAt: e.target.value })} style={field} /></label>
            <button type="submit" disabled={saving} style={{ ...primary, opacity: saving ? .6 : 1 }}>{saving ? "جارٍ الحفظ…" : "حفظ السجل بانتظار التحقق"}</button>
          </form>
        </section>}
      </div>

      <section style={{ marginTop: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}><h2 style={{ margin: 0, fontSize: 20 }}>سجلات الرادار</h2><span style={{ color: "#9eb6c0", fontSize: 12 }}>{recordsToShow.length} سجل</span></div>
        {loading ? <div style={panel}>جارٍ تحميل السجلات…</div> : !access?.authenticated ? <div style={panel}><p style={{ margin: 0, lineHeight: 1.9 }}>يمكن للزائر مشاهدة العرض التخطيطي فقط. سجّل الدخول بحساب منظمة لإضافة سجلاتك، أو بحساب الإدارة المركزية لمراجعة السجلات.</p></div> : recordsToShow.length === 0 ? <div style={panel}><div style={{ display: "flex", gap: 9, alignItems: "center", color: "#c5d5da" }}><Info size={18} /> لا توجد سجلات متاحة لهذا الحساب بعد. لا نعرض بيانات تجريبية أو غير موثقة.</div></div> : <div style={{ display: "grid", gap: 12 }}>
          {recordsToShow.map(record => {
            const ownRecord = isAdmin || record.organizationId === access?.organizationId;
            const mode = shareModes[record.id] || record.sharingMode;
            const targets = shareTargets[record.id] || [];
            return <article key={record.id} style={panel}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 10, alignItems: "start" }}>
                <div><div style={{ color: "#83d6ca", fontSize: 12, fontWeight: 800 }}>{labels[record.type]} · {record.organization?.name || "منظمة مشاركة"}</div><h3 style={{ fontSize: 18, margin: "6px 0" }}>{record.title}</h3></div>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid #385763", borderRadius: 99, padding: "6px 10px", fontSize: 12 }}>{record.verificationStatus === "VERIFIED" ? <CheckCircle2 size={14} color="#68d9a9" /> : <Clock3 size={14} color="#f0c477" />}{statusLabels[record.verificationStatus] || record.verificationStatus}</span>
              </div>
              <p style={{ color: "#c5d5da", lineHeight: 1.9, margin: "8px 0" }}>{record.description}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, color: "#9eb6c0", fontSize: 12 }}>
                <span>الموقع العام: {[record.area, record.city, record.country].filter(Boolean).join("، ")}</span><span>المصدر: {record.sourceName}</span><span>تاريخ الرصد: {new Date(record.observedAt).toLocaleDateString("ar-EG")}</span>
              </div>
              {record.sourceUrl && <a href={record.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", color: "#80dacf", marginTop: 8, fontSize: 12 }}>فتح مصدر البيانات</a>}
              {isAdmin && record.verificationStatus === "PENDING" && <div style={{ borderTop: "1px solid #294653", marginTop: 12, paddingTop: 12, display: "grid", gap: 8 }}>
                <label style={{ display: "grid", gap: 5, fontSize: 13 }}>ملاحظة التحقق<input value={notes[record.id] || ""} onChange={e => setNotes({ ...notes, [record.id]: e.target.value })} placeholder="اكتب كيف تم فحص المصدر والبيانات (5 أحرف على الأقل)" style={field} /></label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}><button type="button" disabled={(notes[record.id] || "").trim().length < 5} onClick={() => void verifyRecord(record.id, "VERIFIED")} style={{ ...primary, background: "#16765d" }}>اعتماد السجل</button><button type="button" disabled={(notes[record.id] || "").trim().length < 5} onClick={() => void verifyRecord(record.id, "REJECTED")} style={{ ...primary, background: "#8b4141" }}>رفض السجل</button></div>
              </div>}
              {ownRecord && record.verificationStatus === "VERIFIED" && <div style={{ borderTop: "1px solid #294653", marginTop: 12, paddingTop: 12, display: "grid", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#83d6ca", fontWeight: 800, fontSize: 13 }}><Share2 size={16} /> صلاحيات المشاركة</div>
                <select value={mode} onChange={e => setShareModes({ ...shareModes, [record.id]: e.target.value as SharingMode })} style={field}>
                  <option value="PRIVATE">خاص بالمنظمة المالكة</option><option value="SHARED">مشاركة مع منظمات محددة</option>{isAdmin && <option value="NETWORK">مشاركة مع شبكة المنظمات</option>}
                </select>
                {mode === "SHARED" && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 7, maxHeight: 180, overflow: "auto", padding: 8, border: "1px solid #385763", borderRadius: 9 }}>
                  {organizations.filter(o => o.id !== record.organizationId).map(org => <label key={org.id} style={{ display: "flex", gap: 7, alignItems: "center", fontSize: 12 }}><input type="checkbox" checked={targets.includes(org.id)} onChange={e => setShareTargets({ ...shareTargets, [record.id]: e.target.checked ? [...targets, org.id] : targets.filter(id => id !== org.id) })} />{org.name}</label>)}
                </div>}
                <button type="button" onClick={() => void updateSharing(record)} disabled={mode === "SHARED" && targets.length === 0} style={primary}>حفظ إعدادات المشاركة</button>
                <small style={{ color: "#9eb6c0" }}><Lock size={12} style={{ display: "inline", verticalAlign: "middle" }} /> المشاركة لا تتم إلا بعد اعتماد السجل.</small>
              </div>}
              {record.verificationNote && <p style={{ color: "#a9c0c9", fontSize: 12, marginBottom: 0 }}>ملاحظة المراجعة: {record.verificationNote}</p>}
            </article>;
          })}
        </div>}
      </section>

      <section style={{ ...panel, marginTop: 14, display: "flex", gap: 10, alignItems: "start", borderColor: "#765b32", background: "#2a2419" }}>
        <ShieldCheck size={20} color="#f3c879" style={{ flexShrink: 0, marginTop: 2 }} /><div style={{ color: "#e8d7b5", fontSize: 12, lineHeight: 1.9 }}><b>حماية البيانات:</b> تبدأ السجلات خاصة وبانتظار التحقق. مشاركة السجلات تتطلب اعتماد الإدارة. لا نجمع إحداثيات دقيقة في نموذج الإدخال، ولا نعرض مواقع المستفيدين الشخصية. الإدارة المركزية وحدها تملك صلاحية اعتماد السجلات ونشرها على مستوى الشبكة.</div>
      </section>
    </div>
  </main>;
}
