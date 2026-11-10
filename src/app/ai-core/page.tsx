"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot, BookOpen, HeartHandshake, GraduationCap, Sprout, ShieldCheck,
  Send, Trash2, Plus, MessageSquare, Sparkles, Copy, Check, Menu,
  X, PanelRightClose, ChevronDown, RotateCcw
} from "lucide-react";
import "./ai-core.css";

type Msg = { id: string; role: "user" | "assistant"; content: string };
type ChatSession = { id: string; title: string; messages: Msg[]; updatedAt: number };

const STORAGE_KEY = "humanity-one-chat-v2";
const roles = [
  { id: "coordinator", name: "منسق المبادرات", description: "تحويل الأفكار إلى خطط عملية", icon: HeartHandshake },
  { id: "education", name: "المعلم", description: "التعليم والتدريب المبسط", icon: GraduationCap },
  { id: "humanitarian", name: "المساعد الإنساني", description: "المبادرات والدعم المجتمعي", icon: Sprout },
  { id: "research", name: "الباحث", description: "البحث والتحليل والتحقق", icon: BookOpen },
  { id: "review", name: "مراجع السلامة", description: "مراجعة المخاطر والخصوصية", icon: ShieldCheck },
] as const;

const suggestions = [
  "ضع خطة لمبادرة تعليمية مجانية",
  "اقترح مشروعًا لدعم المجتمع المحلي",
  "لخّص موضوعًا علميًا مع مصادر",
  "أنشئ خطة عمل لفريق تطوعي",
];

function makeSession(): ChatSession {
  return { id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, title: "محادثة جديدة", messages: [], updatedAt: Date.now() };
}

export default function AICorePage() {
  const [sessions, setSessions] = useState<ChatSession[]>([makeSession()]);
  const [activeId, setActiveId] = useState("");
  const [role, setRole] = useState<(typeof roles)[number]["id"]>("coordinator");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("جاهز للمحادثة");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [copiedId, setCopiedId] = useState("");
  const [storageReady, setStorageReady] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ChatSession[];
        if (Array.isArray(parsed) && parsed.length) {
          const safe = parsed.filter((s) => s && typeof s.id === "string" && Array.isArray(s.messages)).slice(0, 40);
          if (safe.length) {
            setSessions(safe);
            setActiveId(safe[0].id);
          }
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setStorageReady(true);
    const prompt = new URLSearchParams(window.location.search).get("prompt");
    if (prompt) setInput(prompt);
  }, []);

  useEffect(() => {
    if (storageReady) localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, 40)));
  }, [sessions, storageReady]);

  const active = useMemo(
    () => sessions.find((session) => session.id === activeId) || sessions[0],
    [sessions, activeId]
  );
  const activeRole = roles.find((item) => item.id === role) || roles[0];
  const messages = active?.messages || [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, busy]);

  function updateActive(updater: (session: ChatSession) => ChatSession) {
    if (!active) return;
    const id = active.id;
    setSessions((current) => current.map((session) => session.id === id ? updater(session) : session));
  }

  function newChat() {
    const session = makeSession();
    setSessions((current) => [session, ...current].slice(0, 40));
    setActiveId(session.id);
    setInput("");
    setStatus("محادثة جديدة");
    setSidebarOpen(false);
    window.setTimeout(() => textareaRef.current?.focus(), 50);
  }

  function chooseChat(id: string) {
    setActiveId(id);
    setSidebarOpen(false);
  }

  async function sendMessage(event?: React.FormEvent, suppliedText?: string) {
    event?.preventDefault();
    const content = (suppliedText ?? input).trim();
    if (!content || busy || !active) return;

    const chatId = active.id;
    const userMessage: Msg = { id: `m-${Date.now()}`, role: "user", content };
    const nextMessages = [...active.messages, userMessage];
    setSessions((current) => current.map((session) => session.id === chatId
      ? { ...session, title: session.messages.length ? session.title : content.slice(0, 42), messages: nextMessages, updatedAt: Date.now() }
      : session));
    setInput("");
    setBusy(true);
    setStatus("يتم تجهيز الرد...");
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-12).map(({ role: messageRole, content: messageContent }) => ({ role: messageRole, content: messageContent })), role }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذر الاتصال بالمساعد");
      const assistantMessage: Msg = { id: `m-${Date.now()}-reply`, role: "assistant", content: data.reply };
      setSessions((current) => current.map((session) => session.id === chatId
        ? { ...session, messages: [...session.messages, assistantMessage], updatedAt: Date.now() }
        : session));
      setStatus(`متصل · ${data.model || "المساعد الذكي"}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ غير متوقع";
      setSessions((current) => current.map((session) => session.id === chatId
        ? { ...session, messages: [...session.messages, { id: `m-${Date.now()}-error`, role: "assistant", content: `تعذر إكمال الطلب: ${message}` }], updatedAt: Date.now() }
        : session));
      setStatus("تعذر الاتصال — راجع إعدادات الخدمة");
    } finally {
      setBusy(false);
    }
  }

  async function copyMessage(message: Msg) {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedId(message.id);
      window.setTimeout(() => setCopiedId(""), 1600);
    } catch {
      setStatus("تعذر النسخ من هذا المتصفح");
    }
  }

  function clearCurrent() {
    if (!active || busy) return;
    updateActive((session) => ({ ...session, title: "محادثة جديدة", messages: [], updatedAt: Date.now() }));
    setStatus("تم تفريغ المحادثة");
  }

  return (
    <main className="humanity-chat" dir="rtl">
      <aside className={`hc-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="hc-side-top">
          <a className="hc-brand" href="/"><span className="hc-brand-icon"><HeartHandshake size={21} /></span><span><b>HUMANITY ONE</b><small>ذكاء يصنع أثرًا</small></span></a>
          <button className="hc-icon-button hc-mobile-close" onClick={() => setSidebarOpen(false)} aria-label="إغلاق القائمة"><X size={19} /></button>
        </div>
        <button className="hc-new-chat" onClick={newChat}><Plus size={18} /> محادثة جديدة</button>
        <div className="hc-history-label">محادثاتك</div>
        <div className="hc-history">
          {sessions.map((session) => (
            <button key={session.id} className={`hc-history-item ${active?.id === session.id ? "active" : ""}`} onClick={() => chooseChat(session.id)}>
              <MessageSquare size={16} /><span>{session.title || "محادثة جديدة"}</span>
            </button>
          ))}
        </div>
        <div className="hc-side-bottom">
          <div className="hc-privacy"><ShieldCheck size={17} /><span><b>الخصوصية أولًا</b><small>لا تشارك كلمات المرور أو البيانات الحساسة</small></span></div>
          <a href="/" className="hc-back-home">العودة إلى المنصة الرئيسية</a>
        </div>
      </aside>

      {sidebarOpen && <button className="hc-overlay" onClick={() => setSidebarOpen(false)} aria-label="إغلاق القائمة" />}

      <section className="hc-main">
        <header className="hc-topbar">
          <div className="hc-topbar-start">
            <button className="hc-icon-button hc-menu-button" onClick={() => setSidebarOpen(true)} aria-label="فتح القائمة"><Menu size={20} /></button>
            <div><span className="hc-breadcrumb">HUMANITY ONE</span><b>المساعد الذكي</b></div>
          </div>
          <div className="hc-topbar-actions">
            <span className="hc-status"><i /> {status}</span>
            <button className="hc-icon-button" onClick={newChat} title="محادثة جديدة" aria-label="محادثة جديدة"><Plus size={18} /></button>
          </div>
        </header>

        <div className="hc-conversation">
          <div className="hc-role-wrap">
            <button className="hc-role-select" onClick={() => setRoleMenuOpen((open) => !open)} aria-expanded={roleMenuOpen}>
              <span className="hc-role-avatar"><activeRole.icon size={18} /></span>
              <span><b>{activeRole.name}</b><small>{activeRole.description}</small></span>
              <ChevronDown size={16} />
            </button>
            {roleMenuOpen && <div className="hc-role-menu">
              {roles.map((item) => <button key={item.id} onClick={() => { setRole(item.id); setRoleMenuOpen(false); }}>
                <item.icon size={17} /><span><b>{item.name}</b><small>{item.description}</small></span>{role === item.id && <Check size={16} />}
              </button>)}
            </div>}
          </div>

          {messages.length === 0 ? (
            <div className="hc-welcome">
              <div className="hc-welcome-symbol"><Sparkles size={25} /></div>
              <p className="hc-eyebrow">معًا نصنع أثرًا إنسانيًا</p>
              <h1>كيف يمكنني مساعدتك <em>اليوم؟</em></h1>
              <p className="hc-welcome-copy">اسأل، خطط، تعلّم، أو ابدأ مبادرة جديدة. اختر أحد الاقتراحات أو اكتب ما تحتاج إليه.</p>
              <div className="hc-suggestions">
                {suggestions.map((suggestion) => <button key={suggestion} onClick={() => sendMessage(undefined, suggestion)}>{suggestion}<span>←</span></button>)}
              </div>
            </div>
          ) : (
            <div className="hc-messages">
              {messages.map((message) => <article key={message.id} className={`hc-message ${message.role}`}>
                <div className="hc-message-avatar">{message.role === "user" ? "أ" : <Bot size={18} />}</div>
                <div className="hc-message-body">
                  <div className="hc-message-name">{message.role === "user" ? "أنت" : "HUMANITY ONE"}</div>
                  <p>{message.content}</p>
                  {message.role === "assistant" && <button className="hc-copy" onClick={() => copyMessage(message)} aria-label="نسخ الرد">{copiedId === message.id ? <Check size={14} /> : <Copy size={14} />}{copiedId === message.id ? "تم النسخ" : "نسخ"}</button>}
                </div>
              </article>)}
              {busy && <div className="hc-thinking"><span /><span /><span /> يكتب المساعد...</div>}
              <div ref={endRef} />
            </div>
          )}

          <div className="hc-composer-area">
            <form className="hc-composer" onSubmit={(event) => sendMessage(event)}>
              <textarea ref={textareaRef} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} placeholder="اكتب رسالتك هنا..." rows={1} aria-label="رسالتك" />
              <div className="hc-composer-bottom">
                <span>Enter للإرسال · Shift + Enter لسطر جديد</span>
                <div>
                  {messages.length > 0 && <button type="button" className="hc-clear" onClick={clearCurrent} disabled={busy} title="مسح المحادثة"><Trash2 size={16} /></button>}
                  <button type="submit" className="hc-send" disabled={busy || !input.trim()} aria-label="إرسال الرسالة">{busy ? <RotateCcw size={17} className="hc-spin" /> : <Send size={17} />}</button>
                </div>
              </div>
            </form>
            <p className="hc-disclaimer">قد يخطئ الذكاء الاصطناعي؛ راجع المعلومات المهمة قبل استخدامها. لا ترسل بيانات شخصية حساسة.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
