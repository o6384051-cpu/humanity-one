"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Status = { provider:string; apiKeyConfigured:boolean; senderConfigured:boolean; senderEmail:string|null; ready:boolean };
const panel:React.CSSProperties={background:"#10232e",border:"1px solid #29414d",borderRadius:14,padding:18};
const field:React.CSSProperties={width:"100%",padding:12,borderRadius:9,border:"1px solid #38515d",background:"#071923",color:"#e8f2f5"};
const button:React.CSSProperties={padding:"12px 16px",borderRadius:9,border:"1px solid #39716b",background:"#12343a",color:"#e8f2f5",cursor:"pointer",fontWeight:700};

export default function AdminEmailSettingsPage(){
 const [status,setStatus]=useState<Status|null>(null);
 const [recipient,setRecipient]=useState("");
 const [loading,setLoading]=useState(true);
 const [sending,setSending]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 async function load(){
  setLoading(true);setError("");
  try{const r=await fetch("/api/admin/email-settings",{cache:"no-store",credentials:"same-origin"});const d=await r.json();if(!r.ok)throw new Error(d.error||"تعذر قراءة إعدادات البريد");setStatus(d);}
  catch(e){setError(e instanceof Error?e.message:"حدث خطأ");}finally{setLoading(false);}
 }
 useEffect(()=>{void load()},[]);
 async function test(e:React.FormEvent){
  e.preventDefault();setSending(true);setError("");setNotice("");
  try{const r=await fetch("/api/admin/email-settings",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({recipient,confirm:true})});const d=await r.json();if(!r.ok)throw new Error(d.error||"فشل اختبار البريد");setNotice(d.message||"تم قبول رسالة الاختبار.");}
  catch(e){setError(e instanceof Error?e.message:"حدث خطأ");}finally{setSending(false);}
 }
 return <main dir="rtl" style={{minHeight:"100vh",background:"#07131d",color:"#e8f2f5",padding:20,fontFamily:"Cairo,system-ui,sans-serif"}}><div style={{maxWidth:850,margin:"0 auto",display:"grid",gap:16}}>
  <Link href="/admin" style={{color:"#83d9ce",textDecoration:"none"}}>← العودة إلى لوحة الإدارة</Link>
  <header><h1 style={{fontSize:27,margin:"8px 0"}}>إعداد واختبار خدمة البريد</h1><p style={{color:"#a9bec7",lineHeight:1.8}}>إعداد آمن لخدمة Resend واختبار إرسال رسالة واحدة إلى بريد تحدده. هذه الصفحة لا ترسل دعوات المنظمات.</p></header>
  {error&&<p role="alert" style={{background:"#3a2028",color:"#ffb9b9",padding:12,borderRadius:9}}>{error}</p>}
  {notice&&<p role="status" style={{background:"#12372e",color:"#a8f0d0",padding:12,borderRadius:9}}>{notice}</p>}
  <section style={{...panel,display:"grid",gap:12}}>
   <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,flexWrap:"wrap"}}><h2 style={{margin:0}}>حالة الإعداد الحالي</h2><button type="button" onClick={()=>void load()} style={button}>تحديث الحالة</button></div>
   {loading?<p>جارٍ فحص الإعدادات...</p>:status&&<>
    <p>مزود البريد: <b>Resend</b></p>
    <p>مفتاح الخدمة RESEND_API_KEY: <b style={{color:status.apiKeyConfigured?"#8fe3cb":"#f2c879"}}>{status.apiKeyConfigured?"موجود — لا يتم عرض قيمته":"غير مضبوط"}</b></p>
    <p>عنوان المرسل RESEND_FROM_EMAIL: <b style={{color:status.senderConfigured?"#8fe3cb":"#f2c879"}}>{status.senderEmail||"غير مضبوط"}</b></p>
    <p style={{color:status.ready?"#8fe3cb":"#f2c879"}}>{status.ready?"الخدمة جاهزة للاختبار.":"يلزم استكمال إعداد الخادم قبل الإرسال."}</p>
   </>}
  </section>
  <section style={{...panel,display:"grid",gap:10}}>
   <h2 style={{margin:0}}>إكمال إعداد الخدمة</h2>
   <ol style={{paddingRight:22,lineHeight:2.0,color:"#c3d2d9",margin:0}}>
    <li>افتح إعدادات مشروع HUMANITY ONE في Vercel.</li>
    <li>أضف <b>RESEND_API_KEY</b> بقيمة المفتاح السري من حساب Resend.</li>
    <li>أضف <b>RESEND_FROM_EMAIL</b> بعنوان مرسل موثّق لدى Resend، مثل اسم HUMANITY ONE مع نطاق موثّق.</li>
    <li>احفظ المتغيرين لبيئة Production ثم أعد النشر.</li>
    <li>ارجع إلى هذه الصفحة واضغط «تحديث الحالة».</li>
   </ol>
   <p style={{color:"#f2c879",fontSize:13,lineHeight:1.8,margin:0}}>للحماية، لا تكتب مفتاح Resend هنا ولا ترسله في المحادثة. المفتاح يُحفظ كمتغير سري في Vercel ولا يظهر في المتصفح.</p>
  </section>
  <section style={{...panel,display:"grid",gap:12}}>
   <h2 style={{margin:0}}>إرسال رسالة اختبار</h2>
   <form onSubmit={test} style={{display:"grid",gap:10}}>
    <label style={{display:"grid",gap:6}}>البريد الإلكتروني الذي سيستقبل الاختبار<input type="email" required maxLength={254} value={recipient} onChange={e=>setRecipient(e.target.value)} placeholder="example@email.com" style={field}/></label>
    <p style={{color:"#a9bec7",fontSize:13,lineHeight:1.8,margin:0}}>ستُرسل رسالة اختبار واحدة فقط إلى هذا العنوان. لن تُرسل دعوات للمنظمات ولن تتغير بياناتها.</p>
    <button type="submit" disabled={sending||!recipient.trim()} aria-label="إرسال رسالة اختبار" style={{...button,minHeight:48,minWidth:190,opacity:sending||!recipient.trim()?0.55:1,display:"inline-flex",alignItems:"center",justifyContent:"center",appearance:"none",WebkitAppearance:"none"}}>{sending?"جارٍ إرسال الاختبار...":"إرسال رسالة اختبار"}</button>
   </form>
  </section>
  <p style={{color:"#9fb6bf",fontSize:12,lineHeight:1.8}}>نجاح الاختبار يعني أن Resend قبل الرسالة؛ يجب التأكد من وصولها فعليًا إلى صندوق البريد ومراجعة تقارير المزود. إرسال دعوات المنظمات يظل إجراءً منفصلًا يتطلب تأكيدًا صريحًا.</p>
 </div></main>;
}
