"use client";
import {useEffect,useState} from "react";
type Data={organization:{id:string;name:string;email:string};actor:{type:string;memberId:string|null;role:string;permissions:string[]}};
export default function OrganizationSupervisorPage(){
 const [data,setData]=useState<Data|null>(null),[error,setError]=useState("");
 useEffect(()=>{fetch("/api/organization/session",{cache:"no-store"}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||"تعذر التحقق من الجلسة");setData(d);}).catch(e=>setError(e.message));},[]);
 async function logout(){await fetch("/api/organization/auth/logout",{method:"POST"});location.href="/organization/login";}
 return <main dir="rtl" style={{minHeight:"100vh",padding:24,background:"#07131d",color:"#e8f2f5",fontFamily:"Cairo,sans-serif"}}><div style={{maxWidth:900,margin:"auto"}}><a href="/" style={{color:"#83d9ce"}}>HUMANITY ONE</a><h1>لوحة مشرف المنظمة المستقلة</h1>{error&&<p role="alert">{error}</p>}{data&&<><section style={panel}><h2>{data.organization.name}</h2><p>{data.actor.role} · {data.organization.email}</p><p style={{color:"#a9bec7"}}>صلاحياتك محصورة في منظمتك، ويحتفظ مؤسس HUMANITY ONE بحق الإشراف الأعلى وإلغاء أي عضوية.</p></section><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>{data.actor.permissions.includes("VIEW_DATA")||data.actor.permissions.includes("*")?<a href="/organization/messages" style={tile}>مركز المراسلات والتعاون</a>:null}{data.actor.permissions.includes("MANAGE_MEMBERS")||data.actor.permissions.includes("*")?<a href="/organization/team" style={tile}>إدارة مشرفي المنظمة</a>:null}{data.actor.permissions.includes("MANAGE_RECORDS")||data.actor.permissions.includes("*")?<a href="/radar" style={tile}>إدارة سجلات الرادار</a>:null}</div><button onClick={logout} style={button}>تسجيل الخروج</button></>}</div></main>;
}
const panel:React.CSSProperties={padding:20,background:"#0d202b",border:"1px solid #29414d",borderRadius:14,margin:"18px 0"};
const tile:React.CSSProperties={display:"block",padding:20,background:"#102b37",border:"1px solid #31535c",borderRadius:12,color:"#e8f2f5",textDecoration:"none",fontWeight:700};
const button:React.CSSProperties={marginTop:20,padding:12,border:0,borderRadius:8,background:"#17685f",color:"white",fontWeight:700,cursor:"pointer"};
