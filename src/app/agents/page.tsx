"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Bot, BookOpen, GraduationCap, HeartHandshake, Sprout, BriefcaseBusiness, FlaskConical, ShieldCheck, LoaderCircle, Send, Users } from "lucide-react";

const domains = [
  { id: "general", label: "عام", icon: Bot },
  { id: "education", label: "التعليم", icon: GraduationCap },
  { id: "health", label: "التوعية الصحية", icon: HeartHandshake },
  { id: "agriculture", label: "الزراعة", icon: Sprout },
  { id: "humanitarian", label: "الخدمات الإنسانية", icon: Users },
  { id: "career", label: "العمل والمهن", icon: BriefcaseBusiness },
  { id: "science", label: "العلوم", icon: FlaskConical },
  { id: "research", label: "البحث", icon: BookOpen },
] as const;

type Result = { answer: string; plan: string; agents: { id: string; label: string; status: string }[]; model: string; limitations: string[] };

export default function AgentsPage() {
  const [domain, setDomain] = useState<(typeof domains)[number]["id"]>("general");
  const [task, setTask] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  async function runTask(event: React.FormEvent) {
    event.preventDefault();
    if (busy || task.trim().length < 3) return;
    setBusy(true); setError(""); setResult(null);
    try {
      const response = await fetch("/api/agents/run", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: task.trim(), domain }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذر تنفيذ المهمة");
      setResult(data);
    } catch (e) { setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع"); }
    finally { setBusy(false); }
  }

  return <main dir="rtl" style={{ minHeight: "100vh", padding: "28px 18px", background: "var(--background, #0b1220)", color: "var(--foreground, #eef4ff)" }}>
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "inherit", opacity: .8, marginBottom: 24 }}><ArrowRight size={18}/> العودة للرئيسية</Link>
      <header style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={{ padding: 12, borderRadius: 14, background: "#183b4b" }}><Bot size={26}/></span><div><h1 style={{ fontSize: 30, fontWeight: 800 }}>فريق وكلاء HUMANITY ONE</h1><p style={{ opacity: .7 }}>منسق مهمة، وكيل متخصص، ومراجع سلامة يعملون في مسار واحد.</p></div></div>
      </header>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 24 }}>
        {domains.map(d => { const Icon = d.icon; return <button key={d.id} type="button" onClick={() => setDomain(d.id)} aria-pressed={domain === d.id} style={{ display: "flex", alignItems: "center", gap: 10, textAlign: "right", padding: 14, borderRadius: 14, border: domain === d.id ? "1px solid #53c7d8" : "1px solid #ffffff22", background: domain === d.id ? "#153847" : "#ffffff08", color: "inherit", cursor: "pointer" }}><Icon size={20}/><span>{d.label}</span></button>; })}
      </section>
      <form onSubmit={runTask} style={{ border: "1px solid #ffffff22", borderRadius: 18, padding: 18, background: "#ffffff08" }}>
        <label htmlFor="agent-task" style={{ display: "block", fontWeight: 700, marginBottom: 10 }}>ما المهمة التي تريد من الفريق إنجازها؟</label>
        <textarea id="agent-task" value={task} onChange={e => setTask(e.target.value)} maxLength={6000} rows={5} placeholder="اكتب هدفك أو المشكلة التي تريد العمل عليها..." style={{ width: "100%", resize: "vertical", padding: 14, borderRadius: 12, color: "inherit", background: "#07101d", border: "1px solid #ffffff26" }}/>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 12, flexWrap: "wrap" }}><small style={{ opacity: .65 }}>حتى 6000 حرف · لا ينفذ الفريق إجراءات خارجية بعد.</small><button disabled={busy || task.trim().length < 3} type="submit" style={{ display: "inline-flex", alignItems: "center", gap: 8, border: 0, borderRadius: 12, padding: "12px 20px", background: "#1c9ab0", color: "white", fontWeight: 700, cursor: busy ? "wait" : "pointer" }}>{busy ? <LoaderCircle size={18} className="animate-spin"/> : <Send size={18}/>} {busy ? "الفريق يعمل..." : "ابدأ تنفيذ المهمة"}</button></div>
      </form>
      {error && <p role="alert" style={{ marginTop: 18, color: "#ff9c9c" }}>{error}</p>}
      {busy && <p aria-live="polite" style={{ marginTop: 18, opacity: .8 }}>يعمل المنسق ثم الوكيل المتخصص ثم مراجع السلامة. قد يستغرق ذلك بعض الوقت.</p>}
      {result && <section aria-live="polite" style={{ marginTop: 24, display: "grid", gap: 16 }}>
        <div style={{ border: "1px solid #ffffff22", borderRadius: 16, padding: 18 }}><h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>مسار العمل</h2><p style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>{result.plan}</p><div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>{result.agents.map(a => <span key={a.id} style={{ borderRadius: 99, padding: "6px 10px", background: "#174b3c", fontSize: 13 }}><ShieldCheck size={13} style={{ display: "inline", marginLeft: 5 }}/>{a.label}: اكتمل</span>)}</div></div>
        <div style={{ border: "1px solid #ffffff22", borderRadius: 16, padding: 18 }}><h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>النتيجة بعد المراجعة</h2><div style={{ whiteSpace: "pre-wrap", lineHeight: 1.9 }}>{result.answer}</div><small style={{ display: "block", opacity: .6, marginTop: 16 }}>النموذج: {result.model}</small></div>
        <div style={{ border: "1px solid #c58b342e", borderRadius: 14, padding: 14, background: "#9a6b1510" }}><b>حدود النسخة التجريبية</b><ul style={{ marginTop: 8, paddingRight: 20, lineHeight: 1.8 }}>{result.limitations.map(x => <li key={x}>{x}</li>)}</ul></div>
      </section>}
    </div>
  </main>;
}
