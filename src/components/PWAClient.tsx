"use client";

import { useEffect, useState } from "react";

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }> };

export default function PWAClient() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setInstalled(standalone);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    const onPrompt = (event: Event) => { event.preventDefault(); setInstallPrompt(event as InstallPromptEvent); };
    const onInstalled = () => { setInstalled(true); setInstallPrompt(null); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", onPrompt); window.removeEventListener("appinstalled", onInstalled); };
  }, []);

  if (installed) return null;
  const install = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setInstallPrompt(null);
      return;
    }
    alert("لتثبيت HUMANITY ONE: افتح قائمة المتصفح (⋮ في Android أو ⋯ في Chrome/Edge على الكمبيوتر)، ثم اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».");
  };

  return <button type="button" onClick={install} aria-label="تثبيت تطبيق HUMANITY ONE" style={{ position: "fixed", left: 16, bottom: 16, zIndex: 80, display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid rgba(98,217,210,.45)", borderRadius: 999, padding: "11px 16px", background: "#123143", color: "#eaffff", boxShadow: "0 8px 28px #0008", fontFamily: "inherit", fontSize: 12, fontWeight: 800 }}><span aria-hidden="true">⬇</span> تثبيت التطبيق</button>;
}
