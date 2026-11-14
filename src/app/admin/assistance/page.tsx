"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Item = {
  id: string;
  category: string;
  urgency: string;
  description: string;
  city: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  files: { id: string; originalName: string; mimeType: string; size: number; createdAt: string }[];
  user: { name: string | null; email: string; beneficiaryProfile: { phone: string | null; area: string | null } | null };
};

const categoryNames: Record<string, string> = {
  FOOD: "غذاء", HOUSING: "سكن", HEALTH: "صحة", EDUCATION: "تعليم",
  EMPLOYMENT: "عمل", DEBT: "تعثر مالي", OTHER: "أخرى",
};
const statusNames: Record<string, string> = {
  PENDING: "جديد", IN_REVIEW: "تحت الدراسة", APPROVED: "تمت الموافقة",
  REJECTED: "لم تتم الموافقة", CLOSED: "مغلق",
};
const statusOptions = [
  ["IN_REVIEW", "تحت الدراسة"], ["APPROVED", "موافقة"],
  ["REJECTED", "عدم موافقة"], ["CLOSED", "إغلاق"],
] as const;

export default function AssistanceAdmin() {
  const [items, setItems] = useState<Item[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/assistance", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذر تحميل الطلبات.");
      setItems(data.requests || []);
      setNotes((current) => {
        const next = { ...current };
        for (const item of data.requests || []) {
          if (next[item.id] === undefined) next[item.id] = item.adminNote || "";
        }
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function update(id: string, status: string) {
    setSavingId(id);
    setError("");
    try {
      const response = await fetch("/api/admin/assistance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, adminNote: notes[id] || "" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذر تحديث الطلب.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تحديث الطلب.");
    } finally {
      setSavingId("");
    }
  }

  const counts = useMemo(() => ({
    total: items.length,
    pending: items.filter((x) => x.status === "PENDING").length,
    review: items.filter((x) => x.status === "IN_REVIEW").length,
    approved: items.filter((x) => x.status === "APPROVED").length,
    rejected: items.filter((x) => x.status === "REJECTED").length,
  }), [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("ar");
    return items.filter((x) => {
      const matchesStatus = statusFilter === "ALL" || x.status === statusFilter;
      const haystack = [x.description, x.city, x.user.name || "", x.user.email,
        x.user.beneficiaryProfile?.phone || "", categoryNames[x.category] || x.category]
        .join(" ").toLocaleLowerCase("ar");
      return matchesStatus && (!q || haystack.includes(q));
    });
  }, [items, query, statusFilter]);

  const panel = { background: "#102333", border: "1px solid #294454", borderRadius: 13, padding: 16 };
  const input = { width: "100%", padding: 11, background: "#0b1b29", color: "white", border: "1px solid #30495a", borderRadius: 8 };

  return (
    <main dir="rtl" style={{ minHeight: "100vh", background: "#08131f", color: "#e8f1f5", padding: 22 }}>
      <div style={{ maxWidth: 1100, margin: "auto" }}>
        <Link href="/" style={{ color: "#83d9ce" }}>← الرئيسية</Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div><h1 style={{ fontSize: 28, fontWeight: 700 }}>مراجعة طلبات المساعدة</h1>
            <p style={{ color: "#a9bdc9" }}>لوحة داخلية لفريق المراجعة المخوّل. حافظ على سرية بيانات المستفيدين.</p></div>
          <button onClick={() => void load()} disabled={loading} style={{ padding: "10px 15px", border: 0, borderRadius: 8, background: "#287c73", color: "white" }}>
            {loading ? "جارٍ التحديث..." : "تحديث القائمة"}
          </button>
        </div>

        {error && <p role="alert" style={{ color: "#ffb4a9", background: "#3b2025", padding: 10, borderRadius: 8 }}>{error}</p>}

        <section aria-label="ملخص الطلبات" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(135px,1fr))", gap: 10, margin: "18px 0" }}>
          {[
            ["إجمالي المعروض", counts.total], ["طلبات جديدة", counts.pending],
            ["تحت الدراسة", counts.review], ["تمت الموافقة", counts.approved], ["غير موافق عليها", counts.rejected],
          ].map(([label, value]) => <div key={label} style={panel}><div style={{ color: "#a9bdc9", fontSize: 13 }}>{label}</div><strong style={{ fontSize: 25 }}>{value}</strong></div>)}
        </section>

        <section style={{ ...panel, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 12 }}>
          <label>بحث في الطلبات
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="اسم المستفيد أو الهاتف أو المدينة أو التفاصيل" style={{ ...input, display: "block", marginTop: 6 }} />
          </label>
          <label>تصفية حسب الحالة
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...input, display: "block", marginTop: 6 }}>
              <option value="ALL">كل الحالات</option>
              {Object.entries(statusNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </section>

        <p style={{ color: "#a9bdc9", marginTop: 14 }}>عدد النتائج: {filtered.length}</p>
        {loading ? <p>جارٍ تحميل الطلبات...</p> : filtered.length === 0 ? <div style={{ ...panel, marginTop: 12 }}>لا توجد طلبات تطابق البحث والتصفية.</div> :
          filtered.map((x) => (
            <article key={x.id} style={{ ...panel, marginTop: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                <b>{categoryNames[x.category] || x.category} · {x.urgency === "URGENT" ? "عاجل" : "عادي"}</b>
                <span style={{ color: "#83d9ce" }}>{statusNames[x.status] || x.status}</span>
              </div>
              <p style={{ whiteSpace: "pre-wrap" }}>{x.description}</p>
              <p style={{ color: "#a9bdc9", fontSize: 13 }}>
                المستفيد: {x.user.name || "بدون اسم"} · {x.user.email} · {x.user.beneficiaryProfile?.phone || "لا يوجد هاتف"} · {x.city}
                {x.user.beneficiaryProfile?.area ? " · " + x.user.beneficiaryProfile.area : ""}
              </p>
              <p style={{ color: "#a9bdc9", fontSize: 12 }}>تاريخ التقديم: {new Date(x.createdAt).toLocaleString("ar-EG")}</p>

              {x.files?.length > 0 && <section style={{ margin: "12px 0", padding: 12, background: "#0b1b29", borderRadius: 8 }}>
                <b>المستندات المرفقة ({x.files.length})</b>
                <ul style={{ marginTop: 8, paddingRight: 20 }}>{x.files.map((file) => (
                  <li key={file.id} style={{ marginBottom: 6 }}>
                    <a href={`/api/admin/assistance/files/${encodeURIComponent(file.id)}`} style={{ color: "#83d9ce", textDecoration: "underline" }}>{file.originalName}</a>
                    <span style={{ color: "#a9bdc9", fontSize: 12 }}> · {(file.size / 1024).toFixed(0)} كيلوبايت</span>
                  </li>
                ))}</ul>
              </section>}

              <label style={{ display: "block", marginTop: 12 }}>ملاحظة المراجعة
                <textarea value={notes[x.id] ?? x.adminNote ?? ""} onChange={(e) => setNotes({ ...notes, [x.id]: e.target.value })}
                  maxLength={1500} placeholder="ملاحظة أو توجيه للمستفيد" style={{ ...input, display: "block", minHeight: 75, marginTop: 6 }} />
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                {statusOptions.map(([status, label]) => <button key={status} disabled={savingId === x.id}
                  onClick={() => void update(x.id, status)}
                  style={{ padding: "9px 13px", border: 0, borderRadius: 8, background: savingId === x.id ? "#42515b" : "#287c73", color: "white", cursor: savingId === x.id ? "wait" : "pointer" }}>
                  {savingId === x.id ? "جارٍ الحفظ..." : label}
                </button>)}
              </div>
            </article>
          ))
        }
      </div>
    </main>
  );
}
