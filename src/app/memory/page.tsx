"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Brain, Plus, Trash2, ShieldCheck, Download } from "lucide-react";

type Note = { id: string; text: string; createdAt: string };
const KEY = "humanity-one-approved-memory-v1";

export default function MemoryPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState("");
  const [ready, setReady] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    try {
      setNotes(JSON.parse(localStorage.getItem(KEY) || "[]"));
      setEnabled(localStorage.getItem(KEY + ":enabled") === "true");
    } catch { setNotes([]); }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify(notes));
    localStorage.setItem(KEY + ":enabled", String(enabled));
  }, [notes, enabled, ready]);

  function addNote(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || text.length > 500) return;
    setNotes(current => [{ id: crypto.randomUUID(), text, createdAt: new Date().toISOString() }, ...current].slice(0, 50));
    setDraft("");
  }

  function exportNotes() {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), notes }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "humanity-one-memory.json"; a.click(); URL.revokeObjectURL(url);
  }

  function clearAll() {
    if (!window.confirm("هل تريد حذف كل الملاحظات المحفوظة في هذا المتصفح؟")) return;
    setNotes([]);
  }

  return <main dir="rtl" style={{ minHeight: "100vh", padding: "28px 18px", background: "var(--background, #0b1220)", color: "var(--foreground, #eef4ff)" }}>
    <div style={{ maxWidth: 780, margin: "0 auto" }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "inherit", opacity: .8, marginBottom: 24 }}><ArrowRight size={18}/> العودة للرئيسية</Link>
      <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}><Brain size={30}/><div><h1 style={{ fontSize: 28, fontWeight: 800 }}>ذاكرة HUMANITY ONE</h1><p style={{ opacity: .7 }}>أنت تختار ما يُحفظ، ويمكنك مراجعته وتصديره أو حذفه.</p></div></header>
      <section style={{ border: "1px solid #ffffff22", borderRadius: 16, padding: 16, marginBottom: 18 }}>
        <label style={{ display: "flex", gap: 12, alignItems: "center", fontWeight: 700 }}><input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)}/> تفعيل استخدام هذه الملاحظات في تجارب الذاكرة المحلية</label>
        <p style={{ marginTop: 10, opacity: .7, lineHeight: 1.7 }}><ShieldCheck size={15} style={{ display: "inline", marginLeft: 5 }}/> هذه النسخة تحفظ البيانات داخل تخزين المتصفح على هذا الجهاز فقط. لا توجد مزامنة سحابية أو تشفير مخصص لهذه الملاحظات. لا تحفظ كلمات مرور أو بيانات صحية أو أسرارًا.</p>
      </section>
      <form onSubmit={addNote} style={{ border: "1px solid #ffffff22", borderRadius: 16, padding: 16 }}>
        <label htmlFor="memory-note" style={{ display: "block", fontWeight: 700, marginBottom: 8 }}>معلومة تريد تذكرها</label>
        <textarea id="memory-note" value={draft} onChange={e => setDraft(e.target.value)} maxLength={500} rows={3} placeholder="مثال: أفضل أن تكون الشروحات التقنية باللغة العربية..." style={{ width: "100%", padding: 12, borderRadius: 10, background: "#07101d", color: "inherit", border: "1px solid #ffffff26" }}/>
        <button type="submit" disabled={!draft.trim()} style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 10, border: 0, background: "#1c9ab0", color: "white" }}><Plus size={17}/> حفظ المعلومة</button>
      </form>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, margin: "22px 0 12px" }}><h2 style={{ fontWeight: 800 }}>الملاحظات المحفوظة ({notes.length}/50)</h2><div style={{ display: "flex", gap: 8 }}><button onClick={exportNotes} disabled={!notes.length} style={{ padding: "8px 12px", borderRadius: 9, border: "1px solid #ffffff30", background: "transparent", color: "inherit" }}><Download size={15} style={{ display: "inline", marginLeft: 5 }}/>تصدير</button><button onClick={clearAll} disabled={!notes.length} style={{ padding: "8px 12px", borderRadius: 9, border: "1px solid #a44", background: "transparent", color: "inherit" }}><Trash2 size={15} style={{ display: "inline", marginLeft: 5 }}/>حذف الكل</button></div></div>
      {notes.length ? <ul style={{ display: "grid", gap: 10, padding: 0, listStyle: "none" }}>{notes.map(n => <li key={n.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, border: "1px solid #ffffff20", borderRadius: 12, padding: 14 }}><div><p style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{n.text}</p><small style={{ opacity: .55 }}>{new Date(n.createdAt).toLocaleString("ar-EG")}</small></div><button aria-label="حذف المعلومة" onClick={() => setNotes(current => current.filter(x => x.id !== n.id))} style={{ alignSelf: "start", background: "transparent", border: 0, color: "#ff9999" }}><Trash2 size={17}/></button></li>)}</ul> : <p style={{ opacity: .65, padding: 20, textAlign: "center" }}>لا توجد ملاحظات محفوظة بعد.</p>}
    </div>
  </main>;
}
