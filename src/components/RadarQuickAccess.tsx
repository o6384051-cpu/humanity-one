"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Home, MapPinned, Menu, X } from "lucide-react";

export default function RadarQuickAccess() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // The home dashboard already has its full sidebar navigation.
  if (pathname === "/") return null;

  return (
    <div style={{ position: "fixed", right: 16, bottom: 16, zIndex: 130, direction: "rtl", fontFamily: "inherit" }}>
      {open && (
        <nav aria-label="التنقل السريع" style={{ display: "grid", gap: 6, minWidth: 210, marginBottom: 8, padding: 8, border: "1px solid rgba(105,216,209,.3)", borderRadius: 14, background: "rgba(10,17,30,.97)", boxShadow: "0 12px 36px rgba(0,0,0,.35)" }}>
          <Link href="/radar" onClick={() => setOpen(false)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 12px", borderRadius: 9, color: "#75e2d8", background: "rgba(56,185,183,.13)", textDecoration: "none", fontSize: 13, fontWeight: 800 }}>
            <MapPinned size={18} /> الرادار الإنساني
          </Link>
          <Link href="/" onClick={() => setOpen(false)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 12px", borderRadius: 9, color: "#d8e5f3", textDecoration: "none", fontSize: 12 }}>
            <Home size={17} /> الصفحة الرئيسية
          </Link>
        </nav>
      )}
      <button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-label={open ? "إغلاق قائمة التنقل" : "فتح قائمة التنقل"} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 44, padding: "0 15px", border: "1px solid rgba(105,216,209,.4)", borderRadius: 999, background: "#102b38", color: "#83e5dc", boxShadow: "0 8px 24px rgba(0,0,0,.3)", font: "inherit", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>
        {open ? <X size={17} /> : <Menu size={17} />}
        القائمة
      </button>
    </div>
  );
}
