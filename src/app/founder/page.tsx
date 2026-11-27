'use client';

import { useEffect, useState } from "react";
import { useLanguage, translateText } from "../../components/LanguageProvider";

type User = { id: string; name: string | null; email: string; role: string; permissions?: string[]; createdAt?: string };
type SessionUser = { id: string; name: string | null; email: string; role: string };

export default function FounderAdminPage() {
  const { language } = useLanguage();
  const tx = (value: string) => translateText(value, language);
  const tr = (value: string) => translateText(value, language);
  const [session, setSession] = useState<SessionUser | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [mode, setMode] = useState<"login" | "setup">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", setupSecret: "" });
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "MODERATOR", permissions: ["VIEW_DASHBOARD"] as string[] });
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
      setNewUser({ name: "", email: "", password: "", role: "MODERATOR", permissions: ["VIEW_DASHBOARD"] }); await loadUsers(); setMessage("تمت إضافة الحساب.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "حدث خطأ."); }
    finally { setBusy(false); }
  }

  async function changePermissions(id: string, permissions: string[]) {
    const response = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, permissions }) });
    const data = await response.json(); setMessage(response.ok ? "تم تحديث صلاحيات المشرف." : data.error); if (response.ok) await loadUsers();
  }
  async function changeRole(id: string, role: string) {
    const response = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, role }) });
    const data = await response.json(); setMessage(response.ok ? "تم تحديث الصلاحية." : data.error); if (response.ok) await loadUsers();
  }
  async function removeUser(id: string) {
    if (!window.confirm(tr("هل تريد حذف هذا الحساب نهائيًا؟"))) return;
    const response = await fetch("/api/admin/users?id=" + encodeURIComponent(id), { method: "DELETE" });
    const data = await response.json(); setMessage(response.ok ? "تم حذف الحساب." : data.error); if (response.ok) await loadUsers();
  }
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }); setSession(null); setUsers([]); setMessage("تم تسجيل الخروج.");
  }

  return <main dir="rtl" style={{ minHeight: "100vh", padding: 24, background: "#080d18", color: "#e8edf7", fontFamily: "Cairo, sans-serif" }}>
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <a href="/" style={{ color: "#63d8d0" }}>{tr("← العودة للرئيسية")}</a>
      <h1 style={{ marginTop: 22 }}>{tr("إدارة HUMANITY ONE")}</h1><p><a href="/founder/organizations" style={{ color: "#63d8d0" }}>إدارة جميع المنظمات ومشرفيها ←</a></p>
      <p style={{ color: "#9aabc0" }}>{tr("إدارة حسابات المشرفين والصلاحيات — حساب المؤسس هو صاحب السلطة العليا.")}</p>
      {message && <p role="status" style={{ padding: 12, borderRadius: 10, background: "#14283a", border: "1px solid #315568" }}>{tr(message)}</p>}
      {!session ? <form onSubmit={submitAuth} style={{ maxWidth: 480, display: "grid", gap: 12, padding: 20, background: "#101a2b", borderRadius: 14 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => setMode("login")} style={tabStyle(mode === "login")}>{tr("تسجيل الدخول")}</button>
          <button type="button" onClick={() => setMode("setup")} style={tabStyle(mode === "setup")}>{tr("تأسيس حساب المؤسس")}</button>
        </div>
        {mode === "setup" && <><p style={{ color: "#f2c879" }}>{tr("يعمل التأسيس مرة واحدة فقط، ويتطلب FOUNDER_SETUP_SECRET مضبوطًا في إعدادات Vercel.")}</p><Field label="اسم المؤسس" value={form.name} onChange={v => setForm({ ...form, name: v })} /><Field label="رمز التأسيس السري" value={form.setupSecret} onChange={v => setForm({ ...form, setupSecret: v })} type="password" /></>}
        <Field label="البريد الإلكتروني" value={form.email} onChange={v => setForm({ ...form, email: v })} type="email" />
        <Field label="كلمة المرور (12 حرفًا على الأقل عند التأسيس)" value={form.password} onChange={v => setForm({ ...form, password: v })} type="password" />
        <button disabled={busy} style={primaryStyle}>{busy ? tr("جارٍ التنفيذ...") : mode === "setup" ? tr("إنشاء حساب المؤسس") : tr("دخول آمن")}</button>
      </form> : <section style={{ display: "grid", gap: 18 }}>
        <div style={{ padding: 16, background: "#101a2b", borderRadius: 12, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div><b>{session.name || session.email}</b><p style={{ margin: 4, color: "#65d9d0" }}>{tr("صلاحيتك:")} {session.role === "SUPER_ADMIN" ? tr("المؤسس — صلاحية عليا") : tr(session.role === "ADMIN" ? "إداري" : "مشرف")}</p></div>
          <button onClick={logout} style={tabStyle(false)}>{tr("تسجيل الخروج")}</button>
        </div>
        {session.role === "SUPER_ADMIN" && <form onSubmit={addUser} style={{ padding: 20, background: "#101a2b", borderRadius: 14, display: "grid", gap: 10 }}>
          <h2>{tr("إضافة مشرف أو إداري")}</h2>
          <Field label="الاسم" value={newUser.name} onChange={v => setNewUser({ ...newUser, name: v })} />
          <Field label="البريد الإلكتروني" value={newUser.email} onChange={v => setNewUser({ ...newUser, email: v })} type="email" />
          <Field label="كلمة مرور مؤقتة (12 حرفًا على الأقل)" value={newUser.password} onChange={v => setNewUser({ ...newUser, password: v })} type="password" />
          <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} style={fieldStyle}><option value="MODERATOR">{tr("مشرف")}</option><option value="ADMIN">{tr("إداري")}</option></select>{newUser.role === "MODERATOR" && <fieldset style={{ border: "1px solid #304359", borderRadius: 8, padding: 10 }}><legend>{tr("صلاحيات المشرف")}</legend>{permissionOptions.map(p => <label key={p.value} style={{ display: "block", padding: 4 }}><input type="checkbox" checked={newUser.permissions.includes(p.value)} onChange={e => setNewUser({ ...newUser, permissions: e.target.checked ? [...newUser.permissions, p.value] : newUser.permissions.filter(x => x !== p.value) })} /> {tr(p.label)}</label>)}</fieldset>}
          <button disabled={busy} style={primaryStyle}>{tr("إضافة الحساب")}</button>
        </form>}
        <div style={{ padding: 20, background: "#101a2b", borderRadius: 14, overflowX: "auto" }}>
          <h2>{tr("فريق الإدارة")}</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
            <thead><tr><th style={cellStyle}>{tr("الاسم")}</th><th style={cellStyle}>{tr("البريد")}</th><th style={cellStyle}>{tr("الدور")}</th>{session.role === "SUPER_ADMIN" && <th style={cellStyle}>{tr("الإجراءات")}</th>}</tr></thead>
            <tbody>{users.map(user => <tr key={user.id}><td style={cellStyle}>{user.name || "—"}</td><td style={cellStyle}>{user.email}</td><td style={cellStyle}>{user.role === "SUPER_ADMIN" ? tr("المؤسس") : user.role === "ADMIN" ? tr("إداري") : tr("مشرف")}</td>{session.role === "SUPER_ADMIN" && <td style={cellStyle}>{user.role !== "SUPER_ADMIN" && <div style={{ display: "grid", gap: 8, minWidth: 220 }}><select aria-label={tr("تغيير الدور")} value={user.role} onChange={e => changeRole(user.id, e.target.value)} style={fieldStyle}><option value="MODERATOR">{tr("مشرف")}</option><option value="ADMIN">{tr("إداري")}</option><option value="USER">{tr("إلغاء صلاحية الإدارة")}</option></select><button onClick={() => removeUser(user.id)} style={{ ...tabStyle(false), color: "#ff9c9c" }}>{tr("حذف")}</button>{user.role === "MODERATOR" && <select multiple size={5} aria-label={tr("صلاحيات المشرف")} value={user.permissions || []} onChange={e => changePermissions(user.id, Array.from(e.target.selectedOptions).map(o => o.value))} style={fieldStyle}>{permissionOptions.map(p => <option key={p.value} value={p.value}>{tr(p.label)}</option>)}</select>}</div>}</td>}</tr>)}</tbody>
          </table>
        </div>
      </section>}
    </div>
  </main>;
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  const { language: fieldLanguage } = useLanguage();
  const fieldLabel = translateText(label, fieldLanguage);
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  return <label style={{ display: "grid", gap: 5, color: "#cbd7e7", fontSize: 13 }}>
    {fieldLabel}
    <span style={{ position: "relative", display: "block" }}>
      <input
        required
        value={value}
        type={isPassword && visible ? "text" : type}
        onChange={e => onChange(e.target.value)}
        autoComplete={isPassword ? "current-password" : type === "email" ? "username" : undefined}
        style={{ ...fieldStyle, paddingLeft: isPassword ? 48 : 11 }}
      />
      {isPassword && <button
        type="button"
        onClick={() => setVisible(current => !current)}
        aria-label={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
        aria-pressed={visible}
        title={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
        style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", border: 0, background: "transparent", color: "#9fb6cc", cursor: "pointer", padding: 6, display: "grid", placeItems: "center" }}
      >
        {visible
          ? <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 8.5 4.5 9.5 7-.4 1-1.2 2.2-2.3 3.3"/><path d="M6.2 6.2C3.9 7.7 2.8 9.7 2.5 12c.7 2 3.8 7 9.5 7 1.2 0 2.3-.2 3.3-.7"/></svg>
          : <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"/><circle cx="12" cy="12" r="3"/></svg>}
      </button>}
    </span>
  </label>;
}
const permissionOptions = [{ value: "VIEW_DASHBOARD", label: "عرض لوحة المتابعة" }, { value: "VIEW_BENEFICIARIES", label: "عرض بيانات المستفيدين" }, { value: "MANAGE_ASSISTANCE", label: "مراجعة طلبات المساعدة والمرفقات" }, { value: "MANAGE_ORGANIZATIONS", label: "إدارة طلبات وسجل المنظمات" }, { value: "MANAGE_MAIL", label: "إدارة المراسلات" }];
const fieldStyle: React.CSSProperties = { width: "100%", padding: 11, color: "#edf5ff", background: "#0b1422", border: "1px solid #304359", borderRadius: 8 };
const primaryStyle: React.CSSProperties = { padding: 12, border: 0, borderRadius: 9, background: "#55d3ca", color: "#08212a", fontWeight: 800, cursor: "pointer" };
const tabStyle = (active: boolean): React.CSSProperties => ({ padding: "9px 12px", border: "1px solid #304359", borderRadius: 8, background: active ? "#1b3948" : "#0b1422", color: "#e8edf7", cursor: "pointer" });
const cellStyle: React.CSSProperties = { padding: 10, textAlign: "right", borderBottom: "1px solid #2a3b50", fontSize: 13 };
