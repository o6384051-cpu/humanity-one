"use client";
import { useState } from "react";
import { Bot, BookOpen, HeartHandshake, GraduationCap, Sprout, ShieldCheck, Send, Trash2 } from "lucide-react";
import "./ai-core.css";

type Msg={role:"user"|"assistant";content:string};
const roles=[
 {id:"coordinator",name:"منسق المبادرات",prompt:"أنت منسق HUMANITY ONE. ساعد على تحويل طلبات الخير إلى خطوات عملية آمنة."},
 {id:"education",name:"المعلم",prompt:"أنت معلم HUMANITY ONE. اشرح ببساطة، وراع اختلاف المستويات واللغات."},
 {id:"humanitarian",name:"المساعد الإنساني",prompt:"أنت مساعد إنساني. لا تختلق جهات أو مساعدات أو أرقامًا. احمِ كرامة الناس وخصوصيتهم."},
 {id:"research",name:"الباحث",prompt:"أنت باحث. ميّز الحقائق عن التحليل والاقتراح، واذكر المصادر أو حدود المعرفة."},
 {id:"review",name:"مراجع السلامة",prompt:"راجع الإجابة بحثًا عن المخاطر والخصوصية والمعلومات غير المؤكدة."}
] as const;
export default function AICorePage(){
 const [role,setRole]=useState<(typeof roles)[number]["id"]>("coordinator");
 const [messages,setMessages]=useState<Msg[]>([]);
 const [input,setInput]=useState("");
 const [busy,setBusy]=useState(false);
 const [status,setStatus]=useState("جاهز — يلزم ضبط مفتاح مزود الذكاء الاصطناعي");
 async function send(e?:React.FormEvent){
  e?.preventDefault(); const text=input.trim(); if(!text||busy)return;
  const next=[...messages,{role:"user" as const,content:text}];setMessages(next);setInput("");setBusy(true);setStatus("جارٍ الاتصال");
  try{const r=await fetch("/api/ai/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:next.slice(-12),role})});const d=await r.json();if(!r.ok)throw new Error(d.error||"تعذر الاتصال");setMessages(v=>[...v,{role:"assistant",content:d.reply}]);setStatus("متصل · "+d.model);}
  catch(err){setMessages(v=>[...v,{role:"assistant",content:"لم تكتمل العملية: "+(err instanceof Error?err.message:"خطأ غير معروف")}]);setStatus("تحقق من إعدادات الاتصال");}
  finally{setBusy(false);}
 }
 const active=roles.find(x=>x.id===role)!;
 return <main className="humanity-ai" dir="rtl">
  <header><a href="/">HUMANITY ONE</a><span>مركز الذكاء والعمل الإنساني · المرحلة الأولى</span></header>
  <section className="welcome"><div><small>التقنية في خدمة الإنسان</small><h1>معًا نصنع أثرًا إنسانيًا</h1><p>مساعد ذكي لدعم التعليم والبحث والمبادرات الإنسانية، مع احترام الخصوصية والتحقق من المعلومات.</p><div className="status">{status}</div></div><div className="mark"><HeartHandshake size={48}/></div></section>
  <section className="pillars">
   <article><HeartHandshake/><b>خدمة إنسانية</b><span>تنظيم المبادرات والاحتياجات دون اختلاق بيانات.</span></article>
   <article><GraduationCap/><b>تعليم للجميع</b><span>شرح وتدريب ومسارات تعلم متدرجة.</span></article>
   <article><Sprout/><b>زراعة وغذاء</b><span>معرفة زراعية ومصادر موثوقة.</span></article>
   <article><BookOpen/><b>علم ومعرفة</b><span>بحث وتلخيص مع توثيق المصادر.</span></article>
  </section>
  <section className="workspace">
   <aside><h2><Bot/> فريق المساعدة</h2>{roles.map(x=><button key={x.id} className={role===x.id?"chosen":""} onClick={()=>setRole(x.id)}>{x.name}</button>)}<p><ShieldCheck/> لا ينفذ هذا الإصدار تحويلات مالية أو إجراءات خارجية.</p></aside>
   <section className="chat"><div className="chathead"><b>مساحة العمل الذكية</b><span>{active.name}</span><button onClick={()=>setMessages([])} aria-label="مسح المحادثة"><Trash2 size={16}/></button></div>
    <div className="messages">{messages.length===0?<div className="empty"><HeartHandshake size={34}/><h3>كيف نساعد الإنسان اليوم؟</h3><p>اطلب إعداد مبادرة تعليمية، أو خطة دعم مجتمعي، أو بحثًا موثقًا.</p></div>:messages.map((m,i)=><article key={i} className={m.role}><b>{m.role==="user"?"أنت":"HUMANITY ONE"}</b><p>{m.content}</p></article>)}{busy&&<p className="loading">يفكر المساعد...</p>}</div>
    <form onSubmit={send}><textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="اكتب كيف يمكننا المساعدة..." rows={2}/><button disabled={busy||!input.trim()}><Send size={18}/></button></form>
    <small>لا ترسل كلمات مرور أو بيانات شخصية أو معلومات صحية حساسة.</small>
   </section>
  </section>
  <footer>HUMANITY ONE · منظومة مستقلة لخدمة البشر</footer>
 </main>
}