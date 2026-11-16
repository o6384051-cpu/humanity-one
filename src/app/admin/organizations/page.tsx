"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, RefreshCw, ShieldCheck } from "lucide-react";

type Application = { id: string; senderName: string; senderEmail: string | null; subject: string; body: string; status: string; createdAt: string };
const panel: React.CSSProperties = { background: "#0d202b", border: "1px solid #29414d", borderRadius: 16, padding: 16 };
const button: React.CSSProperties = { border: "1px solid #3a626b", borderRadius: 9, padding: "10px 13px", background: "#12313a", color: "#e8f2f5", cursor: "pointer" };
const statusLabels: Record<string,string> = { NEW: "طلب جديد", IN_REVIEW: "قيد المراجعة", APPROVED: "مقبول بعد التحقق", REJECTED: "مرفوض", CLOSED: "مغلق" };

export default function AdminOrganizationsPage() {
  const [items,setItems] = useState<Application[]>([]);
  const [selected,setSelected] = useState("");
  const [error,setError] = useState("");
  const [busy,setBusy] = useState(false);
  const [pendingStatus,setPendingStatus] = useState("");
  const [notice,setNotice] = useState("");
  const [actorRole,setActorRole] = useState("");
  const [verification,setVerification] = useState({ legalIdentityVerified:false, officialChannelsVerified:false, writtenConsentVerified:false });
  const [verificationNote,setVerificationNote] = useState("");
  async function load() {
    setError("");
    try {
      const r = await fetch("/api/admin/organizations",{cache:"no-store",credentials:"same-origin"});
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "تعذر تحميل الطلبات.");
      setItems(d.applications || []);
      setActorRole(d.actorRole || "");
      setSelected(current => current || d.applications?.[0]?.id || "");
    } catch(e) { setError(e instanceof Error ? e.message : "حدث خطأ."); }
  }
  useEffect(()=>{ void load(); },[]);
  const active = items.find(x=>x.id===selected);
  const canApprove = actorRole==="SUPER_ADMIN" && verification.legalIdentityVerified && verification.officialChannelsVerified && verification.writtenConsentVerified && verificationNote.trim().length>=10;
  async function update(status:string) {
    if (!active || busy) return;
    setBusy(true); setPendingStatus(status); setError(""); setNotice("");
    try {
      const r=await fetch("/api/admin/organizations",{method:"PATCH",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:active.id,status,...(status==="APPROVED"?{verification:{...verification,verificationNote}}:{})})});
      const d=await r.json().catch(()=>({}));
      if(!r.ok || !d.ok) throw new Error(d.error || `تعذر تحديث الحالة (HTTP ${r.status}).`);
      setItems(current=>current.map(item=>item.id===active.id?{...item,status:d.status||status}:item));
      setNotice(`تم تحديث حالة الطلب إلى: ${statusLabels[d.status||status]||status}`);
    } catch(e) { setError(e instanceof Error ? e.message : "حدث خطأ."); }
    finally { setBusy(false); setPendingStatus(""); }
  }
  return <main dir="rtl" style={{minHeight:"100vh",background:"#07131d",color:"#e8f2f5",padding:22,fontFamily:"Cairo,system-ui,sans-serif"}}>
    <div style={{maxWidth:1150,margin:"0 auto",display:"grid",gap:16}}>
      <Link href="/admin" style={{color:"#83d9ce",textDecoration:"none"}}>← لوحة الإدارة</Link>
      <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        <div><h1 style={{fontSize:28,margin:"8px 0"}}><Building2 style={{verticalAlign:"middle",marginLeft:8}}/>طلبات انضمام المنظمات</h1><p style={{color:"#a9bec7",margin:0}}>طلبات محفوظة داخل قاعدة البيانات، خاصة بفريق الإدارة.</p></div>
        <button type="button" onClick={()=>void load()} style={button}><RefreshCw size={16} style={{verticalAlign:"middle",marginLeft:6}}/> تحديث الطلبات</button>
      </header>
      {error&&<p role="alert" style={{color:"#ffaaaa",background:"#351d25",padding:12,borderRadius:9}}>{error}</p>}
      <div style={{display:"grid",gridTemplateColumns:"minmax(240px,.8fr) minmax(300px,1.4fr)",gap:14}}>
        <section style={panel}>
          <h2 style={{marginTop:0,fontSize:18}}>قائمة الطلبات ({items.length})</h2>
          {items.map(item=><button type="button" key={item.id} onClick={()=>setSelected(item.id)} style={{display:"block",width:"100%",textAlign:"right",marginTop:9,padding:13,borderRadius:10,border:item.id===selected?"1px solid #64d2c6":"1px solid #29414d",background:item.id===selected?"#15343c":"#091b25",color:"#e8f2f5",cursor:"pointer"}}><b>{item.senderName}</b><small style={{display:"block",color:"#9fb6bf",marginTop:5}}>{new Date(item.createdAt).toLocaleString("ar-EG")}</small><small style={{display:"block",color:"#83d9ce",marginTop:4}}>{statusLabels[item.status]||item.status}</small></button>)}
          {!items.length&&<p style={{color:"#a9bec7"}}>لا توجد طلبات منظمات حتى الآن.</p>}
        </section>
        <section style={panel}>
          {active?<><div style={{display:"flex",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}><h2 style={{marginTop:0}}>{active.senderName}</h2><span style={{color:"#83d9ce"}}>{statusLabels[active.status]||active.status}</span></div><p style={{color:"#9fb6bf"}}>{active.senderEmail||"لا يوجد بريد"}</p><article style={{whiteSpace:"pre-wrap",lineHeight:1.9,background:"#071923",border:"1px solid #29414d",borderRadius:12,padding:16}}>{active.body}</article>{active.status!=="APPROVED"&&<div style={{marginTop:16,padding:14,border:"1px solid #52606b",borderRadius:10,background:"#091b25"}}>
        <h3 style={{margin:"0 0 10px",fontSize:16}}>قائمة التحقق قبل الاعتماد النهائي</h3>
        <p style={{color:"#a9bec7",fontSize:13,lineHeight:1.7}}>لا تعتمد الطلب إلا بعد مراجعة الأدلة فعليًا. وضع علامة هنا يعني أنك تؤكد إتمام التحقق، وليس مجرد استلام البيانات.</p>
        <label style={{display:"flex",gap:9,alignItems:"flex-start",marginTop:10}}><input type="checkbox" checked={verification.legalIdentityVerified} onChange={e=>setVerification(v=>({...v,legalIdentityVerified:e.target.checked}))}/> تم التحقق من الهوية القانونية ومستندات التسجيل أو الترخيص حيث ينطبق.</label>
        <label style={{display:"flex",gap:9,alignItems:"flex-start",marginTop:10}}><input type="checkbox" checked={verification.officialChannelsVerified} onChange={e=>setVerification(v=>({...v,officialChannelsVerified:e.target.checked}))}/> تم التحقق من الموقع ووسائل الاتصال الرسمية عبر مصادر موثوقة.</label>
        <label style={{display:"flex",gap:9,alignItems:"flex-start",marginTop:10}}><input type="checkbox" checked={verification.writtenConsentVerified} onChange={e=>setVerification(v=>({...v,writtenConsentVerified:e.target.checked}))}/> توجد موافقة مكتوبة واضحة على التعاون وشروطه.</label>
        <label style={{display:"grid",gap:7,marginTop:12,color:"#c7d6dc"}}>ملاحظة التحقق (10 أحرف على الأقل)<textarea value={verificationNote} onChange={e=>setVerificationNote(e.target.value)} rows={3} maxLength={1200} style={{width:"100%",padding:10,borderRadius:8,border:"1px solid #38515c",background:"#071923",color:"#f0f7f8"}} placeholder="اذكر باختصار مصادر التحقق والوثائق التي تمت مراجعتها."/></label>
        {actorRole!=="SUPER_ADMIN"&&<p style={{color:"#f5d98b",fontSize:13}}>الاعتماد النهائي متاح لحساب المؤسس فقط. يمكن لفريق الإدارة متابعة المراجعة.</p>}
      </div>}<div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:16}}><button type="button" disabled={busy} aria-busy={pendingStatus==="IN_REVIEW"} onClick={()=>void update("IN_REVIEW")} style={{...button,opacity:busy ? 0.65 : 1,cursor:busy?"wait":"pointer"}}>{pendingStatus==="IN_REVIEW"?"جارٍ الحفظ…":"بدء المراجعة"}</button><button type="button" disabled={busy || !canApprove} aria-busy={pendingStatus==="APPROVED"} onClick={()=>void update("APPROVED")} style={{...button,background:"#174438",opacity:busy ? 0.65 : 1,cursor:busy?"wait":"pointer"}}><ShieldCheck size={15} style={{verticalAlign:"middle",marginLeft:5}}/>{pendingStatus==="APPROVED"?"جارٍ الحفظ…":"اعتماد بعد التحقق"}</button><button type="button" disabled={busy} aria-busy={pendingStatus==="REJECTED"} onClick={()=>void update("REJECTED")} style={{...button,background:"#492832",opacity:busy ? 0.65 : 1,cursor:busy?"wait":"pointer"}}>{pendingStatus==="REJECTED"?"جارٍ الحفظ…":"رفض الطلب"}</button><button type="button" disabled={busy} aria-busy={pendingStatus==="CLOSED"} onClick={()=>void update("CLOSED")} style={{...button,opacity:busy ? 0.65 : 1,cursor:busy?"wait":"pointer"}}>{pendingStatus==="CLOSED"?"جارٍ الحفظ…":"إغلاق"}</button></div>{(busy||notice)&&<p role="status" aria-live="polite" style={{color:busy?"#f5d98b":"#a8f0d0",background:busy?"#332b18":"#12372e",padding:12,borderRadius:9,marginTop:12}}>{busy?"جارٍ حفظ التغيير في قاعدة البيانات…":notice}</p>}<small style={{display:"block",color:"#a9bec7",marginTop:12}}>الاعتماد النهائي متاح للمؤسس فقط، ولا يتم إلا بعد تأكيد عناصر التحقق الثلاثة وتسجيل الملاحظة. تغيير الحالة وحده لا ينشئ شراكة أو يثبت صحة مستندات غير مفحوصة.</small></>:<p style={{color:"#a9bec7"}}>اختر طلبًا من القائمة لعرض بياناته ومراجعته.</p>}
        </section>
      </div>
    </div>
  </main>;
}
