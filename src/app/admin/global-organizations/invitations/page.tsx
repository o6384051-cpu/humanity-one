"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Lead = { id:string; organizationName:string; country:string; focusArea:string; contactName:string|null; contactEmail:string|null; website:string|null; status:string; };
const card:React.CSSProperties={background:"#10232e",border:"1px solid #29414d",borderRadius:14,padding:16};
const field:React.CSSProperties={width:"100%",padding:11,borderRadius:9,border:"1px solid #38515d",background:"#071923",color:"#e8f2f5"};
const button:React.CSSProperties={padding:"11px 15px",borderRadius:9,border:"1px solid #39716b",background:"#12343a",color:"#e8f2f5",cursor:"pointer",fontWeight:700};
const defaultBody = `السادة مسؤولي {{organizationName}} المحترمين،

تحية طيبة من فريق HUMANITY ONE.

ندعو منظمتكم للتعرف على منظومة إنسانية مستقلة تهدف إلى ربط المنظمات والأفراد والجهات المتعاونة لتوسيع فرص العمل والتعليم والمشروعات الصغيرة والمساندة الإنسانية.

الانضمام الأساسي مجاني، ولا نعلن أي جهة كشريك إلا بعد موافقتها والتحقق من بياناتها.

للتعرف على المنظومة وتقديم طلب الانضمام:
https://humanity-one-wc35.vercel.app/organizations

للتواصل:
humanityone.contact@gmail.com

مع خالص التقدير،
فريق HUMANITY ONE
الإنسان أولًا، والتعاون يصنع الأثر.

إذا لم ترغب منظمتكم في تلقي دعوات أخرى، يرجى الرد بكلمة إلغاء التواصل.`;

export default function OrganizationInvitationsPage(){
 const [leads,setLeads]=useState<Lead[]>([]);
 const [selected,setSelected]=useState<string[]>([]);
 const [subject,setSubject]=useState("دعوة تعاون إنساني من HUMANITY ONE");
 const [body,setBody]=useState(defaultBody);
 const [loading,setLoading]=useState(true);
 const [sending,setSending]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const [result,setResult]=useState<{sent:number;skipped:number;failed:number}|null>(null);
 const [filter,setFilter]=useState("eligible");
 async function load(){
  setLoading(true);setError("");
  try{const r=await fetch("/api/admin/global-organizations/invitations",{cache:"no-store",credentials:"same-origin"});const d=await r.json();if(!r.ok)throw new Error(d.error||"تعذر تحميل السجل");setLeads(d.leads||[]);}
  catch(e){setError(e instanceof Error?e.message:"حدث خطأ");}finally{setLoading(false);}
 }
 useEffect(()=>{void load()},[]);
 const eligible=useMemo(()=>leads.filter(x=>x.contactEmail&&x.status!=="DO_NOT_CONTACT"),[leads]);
 const shown=filter==="all"?leads:eligible;
 const allShownSelected=shown.length>0&&shown.every(x=>selected.includes(x.id));
 function toggle(id:string){setSelected(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id]);}
 function toggleShown(){setSelected(v=>allShownSelected?v.filter(id=>!shown.some(x=>x.id===id)):v.concat(shown.map(x=>x.id).filter(id=>!v.includes(id))).slice(0,100));}
 const chosen=leads.filter(x=>selected.includes(x.id));
 async function send(){
  if(!selected.length||selected.length>100)return;
  if(!window.confirm("تأكيد إرسال دعوة مستقلة إلى "+selected.length+" منظمة؟ سيتم تخطي السجلات التي سبق التواصل معها أو التي لا تملك بريدًا صالحًا."))return;
  setSending(true);setError("");setNotice("");setResult(null);
  try{
   const r=await fetch("/api/admin/global-organizations/invitations",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({ids:selected,subject,body,confirm:true})});
   const d=await r.json();if(!r.ok)throw new Error(d.error||"تعذر إرسال الدعوات");
   setResult(d);setNotice("انتهت محاولة الإرسال. راجع ملخص النتائج وسجل المتابعة.");setSelected([]);await load();
  }catch(e){setError(e instanceof Error?e.message:"حدث خطأ");}finally{setSending(false);}
 }
 return <main dir="rtl" style={{minHeight:"100vh",background:"#07131d",color:"#e8f2f5",padding:20,fontFamily:"Cairo,system-ui,sans-serif"}}><div style={{maxWidth:1100,margin:"0 auto",display:"grid",gap:15}}>
 <Link href="/admin/global-organizations/tracking" style={{color:"#83d9ce",textDecoration:"none"}}>← العودة إلى سجل المنظمات</Link>
 <header><h1 style={{fontSize:27,margin:"8px 0"}}>دعوات المنظمات الجماعية</h1><p style={{color:"#a9bec7",lineHeight:1.8}}>اختر حتى 100 جهة ذات بريد مؤسسي منشور، راجع نص الدعوة، ثم أكد الإرسال. لا تُرسل الدعوة تلقائيًا عند فتح الصفحة.</p></header>
 {error&&<p role="alert" style={{background:"#3a2028",color:"#ffb9b9",padding:12,borderRadius:9}}>{error}</p>}
 {notice&&<p role="status" style={{background:"#12372e",color:"#a8f0d0",padding:12,borderRadius:9}}>{notice}</p>}
 {result&&<section style={card}><b>ملخص الإرسال</b><p style={{marginTop:8}}>تم الإرسال: {result.sent} · تم التخطي: {result.skipped} · فشل: {result.failed}</p></section>}
 <section style={{...card,display:"grid",gap:10}}>
 <h2 style={{margin:0}}>إعداد الرسالة</h2>
 <label style={{display:"grid",gap:5}}>عنوان الرسالة<input value={subject} onChange={e=>setSubject(e.target.value)} maxLength={180} style={field}/></label>
 <label style={{display:"grid",gap:5}}>نص الدعوة<textarea value={body} onChange={e=>setBody(e.target.value)} rows={13} maxLength={10000} style={{...field,lineHeight:1.8}}/></label>
 <small style={{color:"#9fb6bf"}}>يمكن استخدام {{organizationName}} داخل النص لإدراج اسم كل منظمة تلقائيًا.</small>
 </section>
 <section style={{...card,display:"grid",gap:10}}>
 <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,flexWrap:"wrap"}}><h2 style={{margin:0}}>قائمة المنظمات ({leads.length})</h2><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><select value={filter} onChange={e=>setFilter(e.target.value)} style={{...field,width:"auto"}}><option value="eligible">لديها بريد وقابلة للتواصل</option><option value="all">كل السجلات</option></select><button type="button" onClick={toggleShown} style={button}>{allShownSelected?"إلغاء تحديد الظاهر":"تحديد الظاهر"}</button></div></div>
 {loading?<p>جارٍ تحميل المنظمات...</p>:shown.length===0?<p style={{color:"#a9bec7"}}>لا توجد سجلات مؤهلة. أضف بيانات منظمات وبريدها المؤسسي أولًا.</p>:<div style={{display:"grid",gap:8}}>{shown.map(x=><label key={x.id} style={{display:"flex",alignItems:"center",gap:10,padding:10,border:"1px solid #29414d",borderRadius:9,background:"#071923"}}><input type="checkbox" checked={selected.includes(x.id)} onChange={()=>toggle(x.id)} disabled={!x.contactEmail||x.status==="DO_NOT_CONTACT"}/><span style={{flex:1}}><b>{x.organizationName}</b><small style={{display:"block",color:"#a9bec7"}}>{x.country} · {x.focusArea} · {x.contactEmail||"لا يوجد بريد"}</small></span><small style={{color:x.status==="DO_NOT_CONTACT"?"#ffb9b9":"#83d9ce"}}>{x.status}</small></label>)}</div>}
 <div style={{display:"flex",justifyContent:"space-between",gap:8,alignItems:"center",flexWrap:"wrap"}}><b>المحدد: {selected.length} / 100</b><button type="button" onClick={()=>void send()} disabled={sending||selected.length===0||selected.length>100||!subject.trim()||!body.trim()} style={{...button,opacity:sending||selected.length===0?0.55:1}}>{sending?"جارٍ الإرسال...":"تأكيد وإرسال الدعوات المحددة"}</button></div>
 <p style={{color:"#9fb6bf",fontSize:12,lineHeight:1.8,margin:0}}>الإرسال يتطلب إعداد مفتاح مزود البريد وعنوان مرسل موثق في بيئة الخادم. كل منظمة تتلقى رسالة منفصلة، ويتم تسجيل النتيجة. لا تختَر إلا الجهات التي يناسبها التواصل المؤسسي، واحترم أي طلب لإيقاف الرسائل.</p>
 </section>
 </div></main>
}
