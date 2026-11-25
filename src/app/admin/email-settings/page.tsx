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
  try{const r=await fetch("/api/admin/email-settings",{cache:"no-store",credentials:"same-origin"});const d=await r.json();if(!r.ok)throw new Error(d.error||"Unable to load email settings.");setStatus(d);}
  catch(e){setError(e instanceof Error?e.message:"An unexpected error occurred.");}finally{setLoading(false);}
 }
 useEffect(()=>{void load()},[]);
 async function test(e:React.FormEvent){
  e.preventDefault();setSending(true);setError("");setNotice("");
  try{const r=await fetch("/api/admin/email-settings",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({recipient,confirm:true})});const d=await r.json();if(!r.ok)throw new Error(d.error||"The email test failed.");setNotice(d.message||"The test message was accepted.");}
  catch(e){setError(e instanceof Error?e.message:"An unexpected error occurred.");}finally{setSending(false);}
 }
 return <main lang="en" dir="ltr" style={{minHeight:"100vh",background:"#07131d",color:"#e8f2f5",padding:20,fontFamily:"Arial,system-ui,sans-serif"}}><div style={{maxWidth:850,margin:"0 auto",display:"grid",gap:16}}>
  <Link href="/admin" style={{color:"#83d9ce",textDecoration:"none"}}>← Back to Admin Dashboard</Link>
  <header><h1 style={{fontSize:27,margin:"8px 0"}}>Email Service Setup & Test</h1><p style={{color:"#a9bec7",lineHeight:1.8}}>Securely configure Resend and send one test email to an address you choose. This page does not send organization invitations.</p></header>
  {error&&<p role="alert" style={{background:"#3a2028",color:"#ffb9b9",padding:12,borderRadius:9}}>{error}</p>}
  {notice&&<p role="status" style={{background:"#12372e",color:"#a8f0d0",padding:12,borderRadius:9}}>{notice}</p>}
  <section style={{...panel,display:"grid",gap:12}}>
   <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,flexWrap:"wrap"}}><h2 style={{margin:0}}>Current Configuration Status</h2><button type="button" onClick={()=>void load()} style={button}>Refresh Status</button></div>
   {loading?<p>Checking configuration...</p>:status&&<>
    <p>Email provider: <b>Resend</b></p>
    <p>RESEND_API_KEY: <b style={{color:status.apiKeyConfigured?"#8fe3cb":"#f2c879"}}>{status.apiKeyConfigured?"Configured — value hidden":"Not configured"}</b></p>
    <p>RESEND_FROM_EMAIL sender address: <b style={{color:status.senderConfigured?"#8fe3cb":"#f2c879"}}>{status.senderEmail||"Not configured"}</b></p>
    <p style={{color:status.ready?"#8fe3cb":"#f2c879"}}>{status.ready?"The service is ready for testing.":"Server configuration must be completed before sending."}</p>
   </>}
  </section>
  <section style={{...panel,display:"grid",gap:10}}>
   <h2 style={{margin:0}}>Complete Service Setup</h2>
   <ol style={{paddingLeft:22,lineHeight:2.0,color:"#c3d2d9",margin:0}}>
    <li>Open the HUMANITY ONE project settings in Vercel.</li>
    <li>Add <b>RESEND_API_KEY</b> using the secret API key from your Resend account.</li>
    <li>Add <b>RESEND_FROM_EMAIL</b> with a sender address verified by Resend, such as HUMANITY ONE using a verified domain.</li>
    <li>Save both variables for the environment you are testing, then redeploy that environment.</li>
    <li>Return to this page and select “Refresh Status.”</li>
   </ol>
   <p style={{color:"#f2c879",fontSize:13,lineHeight:1.8,margin:0}}>Security: Never enter your Resend API key here or share it in chat. Store it as a secret environment variable in Vercel. It is never displayed in the browser.</p>
  </section>
  <section style={{...panel,display:"grid",gap:12}}>
   <h2 style={{margin:0}}>Send a Test Email</h2>
   <form onSubmit={test} style={{display:"grid",gap:10}}>
    <label style={{display:"grid",gap:6}}>Recipient email address<input type="email" required maxLength={254} value={recipient} onChange={e=>setRecipient(e.target.value)} placeholder="example@email.com" style={field}/></label>
    <p style={{color:"#a9bec7",fontSize:13,lineHeight:1.8,margin:0}}>Exactly one test email will be sent to this address. No organization invitations will be sent, and no organization data will be changed.</p>
    <button type="submit" disabled={sending||!recipient.trim()} aria-label="Send a Test Email" style={{...button,minHeight:48,minWidth:190,opacity:sending||!recipient.trim()?0.55:1,display:"inline-flex",alignItems:"center",justifyContent:"center",appearance:"none",WebkitAppearance:"none"}}>{sending?"Sending test email...":"Send a Test Email"}</button>
   </form>
  </section>
  <p style={{color:"#9fb6bf",fontSize:12,lineHeight:1.8}}>A successful test means Resend accepted the message. Check the recipient’s inbox and the provider logs to confirm delivery. Organization invitations remain a separate action requiring explicit confirmation.</p>
 </div></main>;
}
