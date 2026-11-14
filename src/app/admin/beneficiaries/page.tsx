"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Beneficiary = {
  id: string; name: string | null; email: string; createdAt: string;
  beneficiaryProfile: { phone: string | null; city: string | null; area: string | null; employmentStatus: string | null; educationLevel: string | null } | null;
  _count: { assistanceRequests: number };
};

export default function BeneficiaryManagementPage() {
  const [users, setUsers] = useState<Beneficiary[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (q = "") => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/beneficiaries?q=" + encodeURIComponent(q), { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذر تحميل المستفيدين.");
      setUsers(data.users || []);
    } catch (e) { setError(e instanceof Error ? e.message : "حدث خطأ."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const panel: React.CSSProperties = { background: "#101a2b", border: "1px solid #263b52", borderRadius: 12, padding: 16 };
  const input: React.CSSProperties = { width: "100%", padding: 12, background: "#0b1524", color: "#eef5ff", border: "1px solid #36506a", borderRadius: 9 };

  return <main dir="rtl" style={{ minHeight: "100vh", background: "#080d18", color: "#e8edf7", padding: 20, fontFamily: "Cairo, sans-serif" }}>
    <div style={{ maxWidth: 1050, margin: "0 auto", display: "grid", gap: 16 }}>
      <div><Link href="/admin" style={{ color: "#63d8d0" }}>← مركز التحكم</Link><h1 style={{ fontSize: 27, fontWeight: 800, marginTop: 10 }}>حسابات المستفيدين</h1><p style={{ color: "#9aabc0" }}>عرض وبحث في الحسابات المسجلة. البيانات الشخصية لا تظهر إلا للفريق الإداري المخوّل.</p></div>
      <section style={panel}>
        <form onSubmit={e => { e.preventDefault(); void load(query); }} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="ابحث بالاسم أو البريد أو الهاتف أو المدينة" style={{ ...input, flex: "1 1 260px" }} />
          <button disabled={loading} style={{ padding: "10px 16px", border: 0, borderRadius: 9, background: "#55d3ca", color: "#08212a", fontWeight: 800 }}>بحث</button>
          <button type="button" onClick={() => { setQuery(""); void load(""); }} style={{ padding: "10px 16px", border: "1px solid #36506a", borderRadius: 9, background: "#14283a", color: "#eef5ff" }}>مسح</button>
        </form>
        <p style={{ color: "#9aabc0", marginTop: 10 }}>المعروض: {new Intl.NumberFormat("ar-EG").format(users.length)} حساب (بحد أقصى 200 نتيجة).</p>
      </section>
      {error && <p role="alert" style={{ color: "#ffaaaa" }}>{error}</p>}
      {loading ? <p>جارٍ تحميل البيانات...</p> : users.length === 0 ? <section style={panel}>لا توجد حسابات تطابق البحث.</section> : users.map(user => {
        const profile = user.beneficiaryProfile;
        return <article key={user.id} style={panel}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div><b style={{ fontSize: 17 }}>{user.name || "بدون اسم"}</b><p style={{ color: "#aebdce" }}>{user.email}</p></div>
            <span style={{ color: "#63d8d0" }}>{new Intl.NumberFormat("ar-EG").format(user._count.assistanceRequests)} طلب مساعدة</span>
          </div>
          <p style={{ color: "#aebdce", marginTop: 8 }}>{profile?.phone || "لا يوجد هاتف"} · {profile?.city || "المدينة غير محددة"} {profile?.area ? "· " + profile.area : ""}</p>
          <p style={{ color: "#9aabc0", fontSize: 13 }}>العمل: {profile?.employmentStatus || "غير محدد"} · التعليم: {profile?.educationLevel || "غير محدد"}</p>
          <small style={{ color: "#8499ad" }}>تاريخ التسجيل: {new Date(user.createdAt).toLocaleDateString("ar-EG")}</small>
          <div style={{ marginTop: 12 }}><Link href="/admin/assistance" style={{ color: "#63d8d0" }}>فتح مراجعة طلبات المساعدة ←</Link></div>
        </article>;
      })}
    </div>
  </main>;
}
