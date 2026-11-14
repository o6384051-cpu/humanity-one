"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Overview = {
  generatedAt: string;
  actor: { name: string | null; email: string; role: string };
  stats: {
    users: number; administrators: number; projects: number; tasks: number; agents: number;
    jobs: { pending: number; approved: number; rejected: number };
    applications: number;
  };
  capabilities: {
    database: string; aiConfigured: boolean; aiModel: string | null;
    beneficiaryRequests: { available: boolean; reason: string };
    auditLog: { available: boolean; reason: string };
  };
};

const panel: React.CSSProperties = { background: "#101a2b", border: "1px solid #263b52", borderRadius: 14, padding: 18 };
const linkStyle: React.CSSProperties = { display: "block", padding: 14, background: "#122438", border: "1px solid #29445b", borderRadius: 10, color: "#e8f2ff", textDecoration: "none" };

export default function AdminDashboardPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/overview", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "تعذر تحميل لوحة التحكم.");
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const number = (value: number) => new Intl.NumberFormat("ar-EG").format(value);
  const roleName = (role: string) => role === "SUPER_ADMIN" ? "المؤسس" : role === "ADMIN" ? "إداري" : "مشرف";

  return <main dir="rtl" style={{ minHeight: "100vh", padding: 20, background: "#080d18", color: "#e8edf7", fontFamily: "Cairo, sans-serif" }}>
    <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gap: 18 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div><Link href="/" style={{ color: "#63d8d0", textDecoration: "none" }}>← الرئيسية</Link><h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 12 }}>مركز تحكم HUMANITY ONE</h1><p style={{ color: "#9aabc0" }}>متابعة تشغيل المنظومة من بياناتها الفعلية.</p></div>
        <button onClick={() => void load()} disabled={loading} style={{ padding: "10px 15px", borderRadius: 9, border: "1px solid #36536b", background: "#14283a", color: "#e8edf7" }}>{loading ? "جارٍ التحديث..." : "تحديث البيانات"}</button>
      </header>

      {loading && <p style={{ color: "#b8c8d9" }}>جارٍ قراءة بيانات النظام...</p>}
      {error && <section role="alert" style={{ ...panel, borderColor: "#75414a" }}><p style={{ color: "#ffb2b2" }}>{error}</p><p style={{ color: "#b8c8d9", marginTop: 8 }}>إذا لم تكن قد سجلت الدخول، افتح صفحة المؤسس أولًا.</p><Link href="/founder" style={{ color: "#63d8d0" }}>فتح تسجيل دخول الإدارة</Link></section>}

      {data && <>
        <section style={{ ...panel, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div><b>{data.actor.name || data.actor.email}</b><p style={{ color: "#63d8d0", marginTop: 4 }}>الصلاحية: {roleName(data.actor.role)}</p></div>
          <div style={{ color: "#9aabc0", fontSize: 12 }}>آخر قراءة: {new Date(data.generatedAt).toLocaleString("ar-EG")}</div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))", gap: 10 }}>
          {[
            ["إجمالي الحسابات", data.stats.users], ["فريق الإدارة", data.stats.administrators],
            ["المبادرات", data.stats.projects], ["المهام", data.stats.tasks],
            ["الوكلاء", data.stats.agents], ["طلبات التقديم", data.stats.applications],
          ].map(([label, value]) => <article key={String(label)} style={panel}><p style={{ color: "#9aabc0", fontSize: 13 }}>{label}</p><strong style={{ display: "block", fontSize: 27, marginTop: 7 }}>{number(Number(value))}</strong></article>)}
        </section>

        <section style={panel}>
          <h2 style={{ fontSize: 19, fontWeight: 800, marginBottom: 12 }}>حالة فرص العمل</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10 }}>
            <div><p style={{ color: "#f2c879" }}>بانتظار المراجعة</p><b style={{ fontSize: 24 }}>{number(data.stats.jobs.pending)}</b></div>
            <div><p style={{ color: "#8fe3cb" }}>معتمدة</p><b style={{ fontSize: 24 }}>{number(data.stats.jobs.approved)}</b></div>
            <div><p style={{ color: "#ffaaaa" }}>مرفوضة</p><b style={{ fontSize: 24 }}>{number(data.stats.jobs.rejected)}</b></div>
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
          <Link href="/founder" style={linkStyle}><b>إدارة حسابات الفريق والصلاحيات</b><p style={{ color: "#9aabc0", marginTop: 5, fontSize: 13 }}>إضافة المشرفين وتعديل أدوارهم وإدارتهم.</p></Link>
          <Link href="/admin/jobs" style={linkStyle}><b>مراجعة الوظائف وطلبات التقديم</b><p style={{ color: "#9aabc0", marginTop: 5, fontSize: 13 }}>اعتماد الإعلانات أو رفضها ومراجعة طلبات التقديم.</p></Link>
          <Link href="/projects" style={linkStyle}><b>المبادرات والمشروعات</b><p style={{ color: "#9aabc0", marginTop: 5, fontSize: 13 }}>فتح مساحة المبادرات الحالية.</p></Link>
          <Link href="/tasks" style={linkStyle}><b>المهام</b><p style={{ color: "#9aabc0", marginTop: 5, fontSize: 13 }}>فتح مساحة متابعة المهام.</p></Link>
          <Link href="/ai-core" style={linkStyle}><b>مساعد الذكاء الاصطناعي</b><p style={{ color: "#9aabc0", marginTop: 5, fontSize: 13 }}>فتح واجهة المساعد واختبارها يدويًا.</p></Link>
        </section>

        <section style={panel}>
          <h2 style={{ fontSize: 19, fontWeight: 800, marginBottom: 12 }}>سلامة الخدمات والوظائف غير المكتملة</h2>
          <p style={{ marginBottom: 8 }}>قاعدة البيانات: <b style={{ color: "#8fe3cb" }}>تم الاتصال وقراءة الإحصاءات</b></p>
          <p style={{ marginBottom: 8 }}>إعداد الذكاء الاصطناعي: <b style={{ color: data.capabilities.aiConfigured ? "#8fe3cb" : "#f2c879" }}>{data.capabilities.aiConfigured ? "مفتاح مضبوط في بيئة الخادم" : "لم يتم ضبط مفتاح"}</b>{data.capabilities.aiModel ? " — النموذج: " + data.capabilities.aiModel : ""}</p>
          <p style={{ color: "#f2c879", marginTop: 12 }}>طلبات المستفيدين: لم يتم إنشاء صندوق طلبات حقيقي بعد. {data.capabilities.beneficiaryRequests.reason}</p>
          <p style={{ color: "#f2c879", marginTop: 8 }}>سجل تدقيق المديرين: غير متاح بعد. {data.capabilities.auditLog.reason}</p>
          <p style={{ color: "#9aabc0", fontSize: 12, marginTop: 12 }}>وجود مفتاح الذكاء الاصطناعي لا يثبت نجاح الاتصال بالمزود؛ يلزم اختبار محادثة فعلية.</p>
        </section>
      </>}
    </div>
  </main>;
}
