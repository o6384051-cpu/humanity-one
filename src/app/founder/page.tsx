'use client';

import { useEffect, useState } from "react";

type User = { id: string; name: string | null; email: string; role: string; createdAt?: string };
type SessionUser = { id: string; name: string | null; email: string; role: string };

export default function FounderAdminPage() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [mode, setMode] = useState<"login" | "setup">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", setupSecret: "" });
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "MODERATOR" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadUsers() {
    const response = await fetch("/api/admin/users");
    const data = await response.json();
    if (response.ok) setUsers(data.users || []);
  }
  useEffect(() => {
    fetch("/api/auth/session").then(async r => {
      if (r.ok) { const d = await r.json(); setSession(d.user); await loadUsers(); }
    }).catch(() => undefined);
  }, []);

  async function submitAuth(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      if (mode === "setup") {
        const setup = await fetch("/api/admin/bootstrap", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        const result = await setup.json();
        if (!setup.ok) throw new Error(result.error || "تعذر تأسيس الحساب");
        setMessage("تم إنشاء حساب المؤسس. سجّل الدخول الآن.");
        setMode("login");
      } else {
        const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "فشل تسجيل الدخول");
        setSession(result.user); await loadUsers(); setMessage("تم تسجيل الدخول.");
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : "حدث خطأ."); }
    finally { setBusy(false); }
  }

  async function addUser(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newUser) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذر إضافة المشرف");
      setNewUser({ name: "", email: "", password: "", role: "MODERATOR" }); await loadUsers(); setMessage("تمت إضافة الحساب.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "حدث خطأ."); }
    finally { setBusy(false); }
  }

  async function changeRole(id: string, role: string) {
    const response = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, role }) });
    const data = await response.json(); setMessage(response.ok ? "تم تحديث الصلاحية." : data.error); if (response.ok) await loadUsers();
  }
  async function removeUser(id: string) {
    if (!window.confirm("هل تريد حذف هذا الحساب نهائيًا؟")) return;
    const response = await fetch("/api/admin/users?id=" + encodeURIComponent(id), { method: "DELETE" });
    const data = await response.json(); setMessage(response.ok ? "تم حذف الحساب." : data.error); if (response.ok) await loadUsers();
  }
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }); setSession(null); setUsers([]); setMessage("تم تسجيل الخروج.");
  }

  return <main dir="rtl" style={{ minHeight: "100vh", padding: 24, background: "#080d18", color: "#e8edf7", fontFamily: "Cairo, sans-serif" }}>
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <a href="/" style={{ color: "#63d8d0" }}>← العودة للرئيسية</a>
      <h1 style={{ marginTop: 22 }}>إدارة HUMANITY ONE</h1>
      <p style={{ color: "#9aabc0" }}>إدارة حسابات المشرفين والصلاحيات — حساب المؤسس هو صاحب السلطة العليا.</p>
      {message && <p role="status" style={{ padding: 12, borderRadius: 10, background: "#14283a", border: "1px solid #315568" }}>{message}</p>}
      {!session ? <form onSubmit={submitAuth} style={{ maxWidth: 480, display: "grid", gap: 12, padding: 20, background: "#101a2b", borderRadius: 14 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => setMode("login")} style={tabStyle(mode === "login")}>تسجيل الدخول</button>
          <button type="button" onClick={() => setMode("setup")} style={tabStyle(mode === "setup")}>تأسيس حساب المؤسس</button>
        </div>
        {mode === "setup" && <><p style={{ color: "#f2c879" }}>يعمل التأسيس مرة واحدة فقط، ويتطلب FOUNDER_SETUP_SECRET مضبوطًا في إعدادات Vercel.</p><Field label="اسم المؤسس" value={form.name} onChange={v => setForm({ ...form, name: v })} /><Field label="رمز التأسيس السري" value={form.setupSecret} onChange={v => setForm({ ...form, setupSecret: v })} type="password" /></>}
        <Field label="البريد الإلكتروني" value={form.email} onChange={v => setForm({ ...form, email: v })} type="email" />
        <Field label="كلمة المرور (12 حرفًا على الأقل عند التأسيس)" value={form.password} onChange={v => setForm({ ...form, password: v })} type="password" />
        <button disabled={busy} style={primaryStyle}>{busy ? "جارٍ التنفيذ..." : mode === "setup" ? "إنشاء حساب المؤسس" : "دخول آمن"}</button>
      </form> : <section style={{ display: "grid", gap: 18 }}>
        <div style={{ padding: 16, background: "#101a2b", borderRadius: 12, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div><b>{session.name || session.email}</b><p style={{ margin: 4, color: "#65d9d0" }}>صلاحيتك: {session.role === "SUPER_ADMIN" ? "المؤسس — صلاحية عليا" : session.role}</p></div>
          <button onClick={logout} style={tabStyle(false)}>تسجيل الخروج</button>
        </div>
        {session.role === "SUPER_ADMIN" && <form onSubmit={addUser} style={{ padding: 20, background: "#101a2b", borderRadius: 14, display: "grid", gap: 10 }}>
          <h2>إضافة مشرف أو إداري</h2>
          <Field label="الاسم" value={newUser.name} onChange={v => setNewUser({ ...newUser, name: v })} />
          <Field label="البريد الإلكتروني" value={newUser.email} onChange={v => setNewUser({ ...newUser, email: v })} type="email" />
          <Field label="كلمة مرور مؤقتة (12 حرفًا على الأقل)" value={newUser.password} onChange={v => setNewUser({ ...newUser, password: v })} type="password" />
          <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} style={fieldStyle}><option value="MODERATOR">مشرف</option><option value="ADMIN">إداري</option></select>
          <button disabled={busy} style={primaryStyle}>إضافة الحساب</button>
        </form>}
        <div style={{ padding: 20, background: "#101a2b", borderRadius: 14, overflowX: "auto" }}>
          <h2>فريق الإدارة</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
            <thead><tr><th style={cellStyle}>الاسم</th><th style={cellStyle}>البريد</th><th style={cellStyle}>الدور</th>{session.role === "SUPER_ADMIN" && <th style={cellStyle}>الإجراءات</th>}</tr></thead>
            <tbody>{users.map(user => <tr key={user.id}><td style={cellStyle}>{user.name || "—"}</td><td style={cellStyle}>{user.email}</td><td style={cellStyle}>{user.role === "SUPER_ADMIN" ? "المؤسس" : user.role === "ADMIN" ? "إداري" : "مشرف"}</td>{session.role === "SUPER_ADMIN" && <td style={cellStyle}>{user.role !== "SUPER_ADMIN" && <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}><select aria-label="تغيير الدور" value={user.role} onChange={e => changeRole(user.id, e.target.value)} style={fieldStyle}><option value="MODERATOR">مشرف</option><option value="ADMIN">إداري</option><option value="USER">إلغاء صلاحية الإدارة</option></select><button onClick={() => removeUser(user.id)} style={{ ...tabStyle(false), color: "#ff9c9c" }}>حذف</button></div>}</td>}</tr>)}</tbody>
          </table>
        </div>
      </section>}
    </div>
  </main>;
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label style={{ display: "grid", gap: 5, color: "#cbd7e7", fontSize: 13 }}>{label}<input required value={value} type={type} onChange={e => onChange(e.target.value)} style={fieldStyle} /></label>;
}
const fieldStyle: React.CSSProperties = { width: "100%", padding: 11, color: "#edf5ff", background: "#0b1422", border: "1px solid #304359", borderRadius: 8 };
const primaryStyle: React.CSSProperties = { padding: 12, border: 0, borderRadius: 9, background: "#55d3ca", color: "#08212a", fontWeight: 800, cursor: "pointer" };
const tabStyle = (active: boolean): React.CSSProperties => ({ padding: "9px 12px", border: "1px solid #304359", borderRadius: 8, background: active ? "#1b3948" : "#0b1422", color: "#e8edf7", cursor: "pointer" });
const cellStyle: React.CSSProperties = { padding: 10, textAlign: "right", borderBottom: "1px solid #2a3b50", fontSize: 13 };
