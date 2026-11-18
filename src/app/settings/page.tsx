"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "../../components/LanguageProvider";
import { restoreWorkspaceData } from "@/lib/workspace-restore.mjs";

const KEYS = [
  "humanity-one-initiatives-v1",
  "humanity-one-tasks-v1",
  "humanity-one-approved-memory-v1",
  "humanity-one-approved-memory-v1:enabled",
  "humanity-one-chat-v2",
] as const;

type Workspace = {
  data: Partial<Record<(typeof KEYS)[number], string | null>>;
  language: "ar" | "en";
  theme: "dark" | "light" | "system";
  updatedAt: string;
};

export default function SettingsPage() {
  const { language, setLanguage } = useLanguage();
  const tr = (ar: string, en: string) => language === "ar" ? ar : en;
  const [bytes, setBytes] = useState(0);
  const [message, setMessage] = useState("");
  const [account, setAccount] = useState<{ name: string | null; email: string } | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = () => {
    let total = 0;
    for (const key of KEYS) {
      const value = localStorage.getItem(key);
      if (value) total += new Blob([value]).size;
    }
    setBytes(total);
  };

  async function loadWorkspace() {
    try {
      const response = await fetch("/api/beneficiary/workspace", { cache: "no-store" });
      if (response.status === 401) return;
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || tr("تعذر الاتصال بالمزامنة.", "Could not connect to sync."));
      setAccount(body.user);
      setWorkspace(body.workspace);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : tr("تعذر تحميل بيانات الحساب.", "Could not load account data."));
    }
  }

  useEffect(() => {
    refresh();
    void loadWorkspace();
  }, []);

  function currentData() {
    return Object.fromEntries(KEYS.map((key) => [key, localStorage.getItem(key)])) as Record<(typeof KEYS)[number], string | null>;
  }

  function downloadBackup(data: Record<string, string | null>, filename: string): boolean {
    try {
      const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), data }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
      return true;
    } catch {
      return false;
    }
  }

  function exportData() {
    const started = downloadBackup(currentData(), "humanity-one-local-backup.json");
    setMessage(started
      ? tr("بدأ تنزيل النسخة الاحتياطية. تحقق من مجلد التنزيلات للتأكد من حفظ الملف.", "Backup download started. Check your Downloads folder to confirm the file was saved.")
      : tr("تعذر بدء تنزيل النسخة الاحتياطية.", "Could not start the backup download."));
  }

  async function uploadToCloud() {
    if (!account) {
      setMessage(tr("أنشئ حسابًا أو سجّل الدخول أولًا.", "Create an account or sign in first."));
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/beneficiary/workspace", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: currentData(), language }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || tr("تعذر رفع النسخة.", "Could not upload backup."));
      setWorkspace(body.workspace);
      setMessage(tr("تم حفظ نسخة بياناتك في حسابك. يمكنك استعادتها من جهاز آخر بعد تسجيل الدخول.", "Your data is saved to your account and can be restored on another signed-in device."));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : tr("فشلت المزامنة.", "Sync failed."));
    } finally {
      setBusy(false);
    }
  }

  async function restoreFromCloud() {
    if (!account || !workspace?.data) {
      setMessage(tr("لا توجد نسخة سحابية محفوظة لهذا الحساب بعد.", "There is no cloud backup for this account yet."));
      return;
    }
    if (workspace.language !== "ar" && workspace.language !== "en") {
      setMessage(tr("لغة النسخة السحابية غير صالحة؛ لم تتغير بيانات هذا الجهاز.", "The cloud backup language is invalid. This device was not changed."));
      return;
    }
    if (!window.confirm(tr("ستبدأ الآن عملية تنزيل نسخة احتياطية من بيانات هذا الجهاز. لن يتم استبدال أي بيانات قبل تأكيدك أن الملف ظهر في مجلد التنزيلات. هل تريد المتابعة؟", "A backup of this device will be downloaded now. No local data will be replaced until you confirm that the file appears in Downloads. Continue?"))) return;

    const backupStarted = downloadBackup(currentData(), "humanity-one-before-cloud-restore.json");
    if (!backupStarted) {
      setMessage(tr("تعذر بدء تنزيل النسخة المحلية؛ لم تتغير بيانات هذا الجهاز.", "Could not start the local backup download. This device was not changed."));
      return;
    }
    if (!window.confirm(tr("تحقق من مجلد التنزيلات: هل ظهر ملف humanity-one-before-cloud-restore.json ويمكنك فتحه؟ إذا لم تجده، اختر إلغاء. لن نتابع دون تأكيدك.", "Check Downloads: does humanity-one-before-cloud-restore.json appear and can you open it? Choose Cancel if you cannot find it. We will not continue without your confirmation."))) {
      setMessage(tr("أُلغيت الاستعادة، ولم تتغير بيانات هذا الجهاز.", "Restore cancelled. This device was not changed."));
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      restoreWorkspaceData(localStorage, KEYS, workspace.data);
      setLanguage(workspace.language);
      refresh();
      setMessage(tr("اكتملت الاستعادة. تم التحقق من البيانات قبل التغيير، مع آلية تراجع عند فشل الحفظ.", "Restore completed. Data was validated before changes, with rollback if a write failed."));
    } catch (error) {
      const rollbackComplete = error instanceof Error && "rollbackComplete" in error
        ? Boolean((error as Error & { rollbackComplete?: boolean }).rollbackComplete)
        : false;
      setMessage(rollbackComplete
        ? tr("فشلت الاستعادة، لكن تمت إعادة البيانات المحلية السابقة. لم تُستبدل النسخة المحلية.", "Restore failed, but the previous local data was restored. The local copy was not replaced.")
        : tr("فشلت الاستعادة، ولم نتمكن من تأكيد إعادة كل البيانات السابقة. لا تحذف ملف النسخة الاحتياطية؛ احتفظ به واطلب المساعدة قبل أي محاولة أخرى.", "Restore failed, and we could not confirm that all previous data was rolled back. Keep the backup file and seek help before trying again."));
    } finally {
      setBusy(false);
    }
  }

  function clearData() {
    if (!window.confirm(tr("سيؤدي هذا إلى حذف مبادراتك ومهامك وذاكرتك ومحادثاتك المحفوظة محليًا في هذا المتصفح فقط. لن تُحذف النسخة السحابية. هل تريد المتابعة؟", "This deletes initiatives, tasks, memory, and chats from this browser only. Your cloud backup will not be deleted. Continue?"))) return;
    KEYS.forEach((key) => localStorage.removeItem(key));
    refresh();
    setMessage(tr("تم حذف البيانات المحلية من هذا الجهاز فقط. النسخة السحابية لم تتأثر.", "Local data on this device was deleted. The cloud backup is unchanged."));
  }

  const panel: React.CSSProperties = { marginTop: 16, padding: 18, border: "1px solid #294454", borderRadius: 14, background: "#102333" };
  const button: React.CSSProperties = { padding: "10px 14px", border: 0, borderRadius: 9, background: "#1b766e", color: "white", cursor: "pointer", font: "inherit" };

  return <main dir={language === "ar" ? "rtl" : "ltr"} style={{ minHeight: "100vh", padding: 24, background: "#08131f", color: "#e8f1f5" }}>
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <Link href="/" style={{ color: "#80dacf" }}>{tr("← الرئيسية", "← Home")}</Link>
      <h1 style={{ fontSize: 30, fontWeight: 800, marginTop: 22 }}>{tr("الإعدادات والخصوصية", "Settings & privacy")}</h1>

      <section style={panel}>
        <h2 style={{ fontSize: 19, fontWeight: 700 }}>{tr("حسابك والمزامنة السحابية", "Your account & cloud sync")}</h2>
        {account ? <>
          <p style={{ color: "#b5c7d0" }}>{tr("مسجل الدخول باسم", "Signed in as")} <b>{account.name || account.email}</b></p>
          <p style={{ lineHeight: 1.8, color: "#b5c7d0" }}>{tr("ارفع نسخة من مهامك ومبادراتك وذاكرتك ومحادثاتك إلى حسابك، ثم استعدها على هاتف أو حاسوب آخر. لا يحدث أي استبدال تلقائي؛ أنت تتحكم في الرفع والاستعادة.", "Back up tasks, initiatives, memory, and chats to your account, then restore them on another phone or computer. Nothing is overwritten automatically; you control upload and restore.")}</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button disabled={busy} onClick={uploadToCloud} style={button}>{busy ? tr("جارٍ التنفيذ…", "Working…") : tr("حفظ نسخة في حسابي", "Back up to my account")}</button>
            <button disabled={busy || !workspace?.data} onClick={restoreFromCloud} style={{ ...button, background: "#28506a", opacity: !workspace?.data ? .55 : 1 }}>{tr("استعادة النسخة السحابية", "Restore cloud backup")}</button>
          </div>
          <p style={{ color: "#9fb7c3", fontSize: 12 }}>{workspace?.updatedAt ? tr("آخر نسخة محفوظة: ", "Last backup: ") + new Date(workspace.updatedAt).toLocaleString(language === "ar" ? "ar-EG" : "en-EG") : tr("لم تُحفظ نسخة سحابية بعد.", "No cloud backup saved yet.")}</p>
        </> : <>
          <p style={{ color: "#b5c7d0", lineHeight: 1.8 }}>{tr("المزامنة السحابية تتطلب حساب مستفيد مجانيًا. أنشئ حسابًا أو سجّل الدخول، ثم ارجع إلى هذه الصفحة.", "Cloud sync requires a free beneficiary account. Create an account or sign in, then return here.")}</p>
          <Link href="/beneficiary" style={{ color: "#8fe1cf", textDecoration: "underline" }}>{tr("فتح حساب المستفيدين / تسجيل الدخول", "Open beneficiary account / sign in")}</Link>
        </>}
      </section>

      <section style={panel}>
        <h2 style={{ fontSize: 19, fontWeight: 700 }}>{tr("بيانات هذا الجهاز", "Data on this device")}</h2>
        <p style={{ lineHeight: 1.9, color: "#b5c7d0" }}>{tr("الحجم التقريبي للبيانات المحلية: ", "Approximate local data size: ")}{Math.ceil(bytes / 1024)} {tr("كيلوبايت", "KB")}</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={exportData} style={button}>{tr("تصدير نسخة محلية", "Export local backup")}</button>
          <button onClick={clearData} style={{ ...button, background: "transparent", border: "1px solid #a44", color: "#ffb2b2" }}>{tr("حذف بيانات هذا الجهاز", "Delete this device's data")}</button>
        </div>
      </section>

      {message && <p role="status" style={{ ...panel, borderColor: "#287d69", color: "#b9f3df" }}>{message}</p>}
      <section style={panel}>
        <h2 style={{ fontSize: 19, fontWeight: 700 }}>{tr("الإشعارات", "Notifications")}</h2>
        <p style={{ lineHeight: 1.8, color: "#b5c7d0" }}>{tr("إشعارات طلبات المساعدة محفوظة في حسابك، وتُحدّث داخل صفحة المستفيدين تلقائيًا كل 30 ثانية أثناء فتح الصفحة. لا تتطلب رسومًا أو خدمة رسائل مدفوعة.", "Assistance notifications are stored in your account and refresh in the beneficiary page every 30 seconds while it is open. No paid messaging service is required.")}</p>
        <Link href="/beneficiary" style={{ color: "#8fe1cf", textDecoration: "underline" }}>{tr("فتح مركز الإشعارات", "Open notification center")}</Link>
      </section>
    </div>
  </main>;
}
