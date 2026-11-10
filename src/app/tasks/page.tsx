"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckSquare, Plus, Trash2, CalendarDays, Circle, CheckCircle2, ListTodo } from "lucide-react";

type Task = { id: string; title: string; initiative: string; dueDate: string; priority: "low" | "medium" | "high"; completed: boolean; createdAt: string };
const STORAGE_KEY = "humanity-one-tasks-v1";
const priorityLabels = { low: "منخفضة", medium: "متوسطة", high: "عالية" };

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ready, setReady] = useState(false);
  const [title, setTitle] = useState("");
  const [initiative, setInitiative] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setTasks(parsed.filter((task) => task && typeof task.id === "string" && typeof task.title === "string"));
      }
    } catch { localStorage.removeItem(STORAGE_KEY); }
    setReady(true);
  }, []);

  useEffect(() => { if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }, [tasks, ready]);

  const visible = useMemo(() => tasks.filter((task) => filter === "all" || (filter === "done" ? task.completed : !task.completed)), [tasks, filter]);
  const completed = tasks.filter((task) => task.completed).length;

  function addTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `task-${Date.now()}`;
    setTasks((current) => [{ id, title: title.trim(), initiative: initiative.trim(), dueDate, priority, completed: false, createdAt: new Date().toISOString() }, ...current]);
    setTitle(""); setInitiative(""); setDueDate(""); setPriority("medium");
  }

  function removeTask(id: string) {
    if (!window.confirm("هل تريد حذف هذه المهمة؟")) return;
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  const panel: React.CSSProperties = { background: "rgba(17,38,52,.9)", border: "1px solid rgba(132,177,190,.18)", borderRadius: 16, padding: 18 };
  const input: React.CSSProperties = { width: "100%", minWidth: 0, border: "1px solid #294454", borderRadius: 10, padding: "11px 12px", background: "#0a1b27", color: "#eef7f8", font: "inherit" };
  const button: React.CSSProperties = { border: "1px solid #3b7f78", borderRadius: 10, padding: "10px 14px", background: "#174c49", color: "#eafff9", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7, font: "inherit" };

  return <main dir="rtl" style={{ minHeight: "100vh", padding: "clamp(18px,4vw,48px)", color: "#e8f1f5", background: "linear-gradient(145deg,#07131d,#0b1d2b 58%,#102a34)" }}>
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#8bded2", textDecoration: "none", marginBottom: 24 }}><ArrowRight size={17} /> العودة إلى HUMANITY ONE</Link>
      <header style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, color: "#83d9ce", fontSize: 13 }}><ListTodo size={18} /> من التخطيط إلى التنفيذ</div>
        <h1 style={{ fontSize: "clamp(27px,4vw,38px)", margin: "9px 0" }}>متابعة المهام الإنسانية</h1>
        <p style={{ color: "#a9bdc8", lineHeight: 1.9, margin: 0 }}>قسّم المبادرات إلى خطوات صغيرة، وحدد الأولويات والمواعيد، وتابع ما تم إنجازه.</p>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))", gap: 12, marginBottom: 18 }}>
        <div style={panel}><div style={{ color: "#a9bdc8", fontSize: 12 }}>كل المهام</div><strong style={{ fontSize: 26 }}>{tasks.length}</strong></div>
        <div style={panel}><div style={{ color: "#a9bdc8", fontSize: 12 }}>قيد التنفيذ</div><strong style={{ fontSize: 26 }}>{tasks.length - completed}</strong></div>
        <div style={panel}><div style={{ color: "#a9bdc8", fontSize: 12 }}>مكتملة</div><strong style={{ fontSize: 26, color: "#83d9ce" }}>{completed}</strong></div>
      </section>

      <form onSubmit={addTask} style={{ ...panel, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 11, marginBottom: 18 }}>
        <label style={{ display: "grid", gap: 6, color: "#c5d6dd", fontSize: 13 }}>المهمة *
          <input required maxLength={140} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: إعداد قائمة احتياجات المبادرة" style={input} />
        </label>
        <label style={{ display: "grid", gap: 6, color: "#c5d6dd", fontSize: 13 }}>المبادرة المرتبطة
          <input maxLength={100} value={initiative} onChange={(e) => setInitiative(e.target.value)} placeholder="اسم المبادرة (اختياري)" style={input} />
        </label>
        <label style={{ display: "grid", gap: 6, color: "#c5d6dd", fontSize: 13 }}>تاريخ الاستحقاق
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={input} />
        </label>
        <label style={{ display: "grid", gap: 6, color: "#c5d6dd", fontSize: 13 }}>الأولوية
          <select value={priority} onChange={(e) => setPriority(e.target.value as Task["priority"])} style={input}>
            <option value="low">منخفضة</option><option value="medium">متوسطة</option><option value="high">عالية</option>
          </select>
        </label>
        <div style={{ display: "flex", alignItems: "end" }}><button type="submit" style={button}><Plus size={16} /> إضافة المهمة</button></div>
      </form>

      <section style={{ ...panel, marginBottom: 16, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>قائمة العمل</h2>
        <div style={{ display: "flex", gap: 6 }}>
          {([{value:"all",label:"الكل"},{value:"open",label:"المتبقية"},{value:"done",label:"المكتملة"}] as const).map((item) => <button key={item.value} type="button" onClick={() => setFilter(item.value)} style={{ border: "1px solid " + (filter === item.value ? "#4a9d91" : "#355365"), background: filter === item.value ? "#174c49" : "transparent", color: "#d8e7eb", borderRadius: 9, padding: "7px 10px", cursor: "pointer", font: "inherit", fontSize: 12 }}>{item.label}</button>)}
        </div>
      </section>

      {!ready ? <p style={{ color: "#a9bdc8" }}>جارٍ تحميل المهام...</p> : visible.length === 0 ? <section style={{ ...panel, textAlign: "center", padding: 34 }}>
        <CheckSquare size={30} color="#83d9ce" style={{ margin: "0 auto 10px" }} />
        <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>{tasks.length ? "لا توجد مهام في هذا العرض" : "لا توجد مهام بعد"}</h2>
        <p style={{ color: "#a9bdc8", margin: 0, lineHeight: 1.8 }}>أضف أول خطوة عملية لتبدأ متابعة التقدم.</p>
      </section> : <div style={{ display: "grid", gap: 9 }}>
        {visible.map((task) => <article key={task.id} style={{ ...panel, display: "flex", alignItems: "center", gap: 12, opacity: task.completed ? .7 : 1 }}>
          <button type="button" onClick={() => setTasks((current) => current.map((item) => item.id === task.id ? { ...item, completed: !item.completed } : item))} aria-label={task.completed ? "إعادة فتح المهمة" : "إكمال المهمة"} style={{ background: "transparent", border: 0, color: task.completed ? "#83d9ce" : "#8fa8b5", cursor: "pointer", padding: 0 }}><>{task.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}</></button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: task.completed ? "#91aab6" : "#edf6f7", textDecoration: task.completed ? "line-through" : "none", fontWeight: 600 }}>{task.title}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 6, color: "#91aab6", fontSize: 12 }}>
              {task.initiative && <span>{task.initiative}</span>}
              {task.dueDate && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><CalendarDays size={13} /> {task.dueDate}</span>}
              <span>الأولوية: {priorityLabels[task.priority]}</span>
            </div>
          </div>
          <button type="button" onClick={() => removeTask(task.id)} aria-label="حذف المهمة" style={{ background: "transparent", border: 0, color: "#91aab6", cursor: "pointer" }}><Trash2 size={16} /></button>
        </article>)}
      </div>}

      <p style={{ ...panel, marginTop: 18, color: "#91aab6", fontSize: 12, lineHeight: 1.9 }}><b style={{ color: "#bfe9e3" }}>الخصوصية:</b> تُحفظ المهام على هذا الجهاز والمتصفح فقط حاليًا. ليست متاحة لفريق أو مستخدمين آخرين حتى تفعيل الحسابات والمزامنة السحابية.</p>
    </div>
  </main>;
}
