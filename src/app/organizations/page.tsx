import Link from "next/link";
import OrganizationInquiryForm from "./OrganizationInquiryForm";
import { Building2, ShieldCheck, Handshake, GraduationCap, BriefcaseBusiness, HeartHandshake, Globe2, ArrowLeft, MailCheck } from "lucide-react";

const tracks = [
  { icon: HeartHandshake, title: "الإغاثة والمساندة الإنسانية", text: "الجمعيات والمؤسسات التي تقدم دعمًا غذائيًا أو اجتماعيًا أو إغاثيًا للأسر." },
  { icon: GraduationCap, title: "التعليم والتدريب", text: "المؤسسات التعليمية ومبادرات محو الأمية والمنح والتدريب المهني." },
  { icon: BriefcaseBusiness, title: "العمل والتمكين الاقتصادي", text: "جهات التدريب والتوظيف ودعم المشروعات الصغيرة وريادة الأعمال." },
  { icon: Globe2, title: "الصحة والتعافي المجتمعي", text: "الجهات الصحية والتأهيلية المرخصة وبرامج الدعم المجتمعي المتخصصة." },
];

const steps = [
  ["طلب الانضمام", "ترسل المنظمة بياناتها الأساسية ومجالات عملها ووسائل التواصل الرسمية."],
  ["مراجعة وتحقق", "يراجع فريق HUMANITY ONE الهوية والصفة القانونية ومصادر المعلومات قبل اعتماد أي صفة."],
  ["اتفاق وموافقة", "تُحدد الخدمات ونطاق التعاون وآلية الإحالات ومشاركة البيانات كتابةً."],
  ["تفعيل التعاون", "بعد الموافقة، تُفعّل مساحة المنظمة وتبدأ الإحالات المتفق عليها مع متابعة النتائج."],
];

export default function OrganizationsPage() {
  return (
    <main dir="rtl" lang="ar" style={{minHeight:"100vh",background:"#07131d",color:"#e8f2f5",fontFamily:"Cairo,system-ui,sans-serif",padding:"28px 16px 64px"}}>
      <div style={{maxWidth:1080,margin:"0 auto"}}>
        <Link href="/" style={{color:"#83d9ce",textDecoration:"none",display:"inline-flex",alignItems:"center",gap:8}}><ArrowLeft size={17}/> العودة إلى HUMANITY ONE</Link>
        <section style={{marginTop:24,padding:"clamp(24px,5vw,52px)",border:"1px solid #294653",borderRadius:24,background:"radial-gradient(circle at 10% 0%,#17404a 0,transparent 42%),#0c202b"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,color:"#8ce0d5",fontWeight:800,fontSize:13}}><Handshake size={18}/> شبكة التعاون الإنساني</div>
          <h1 style={{fontSize:"clamp(30px,5vw,48px)",lineHeight:1.25,margin:"18px 0 14px"}}>منظمات مستقلة، وجهد إنساني متصل</h1>
          <p style={{fontSize:18,lineHeight:1.9,color:"#c1d2d9",maxWidth:760,margin:0}}>تسعى HUMANITY ONE إلى بناء شبكة تربط المؤسسات والجمعيات الموثوقة بالفرص والاحتياجات الإنسانية، مع احترام استقلال كل منظمة وخصوصية كل مستفيد.</p>
          <div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:26}}>
            <a href="#application-form" style={{background:"#54c8ba",color:"#062027",padding:"13px 20px",borderRadius:11,fontWeight:900,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:9}}><MailCheck size={18}/> تقديم طلب تواصل</a>
            <a href="#verification" style={{border:"1px solid #54717b",color:"#e8f2f5",padding:"13px 20px",borderRadius:11,textDecoration:"none"}}>كيف يتم التحقق؟</a>
          </div>
          <p style={{fontSize:12,color:"#9fb6bf",marginTop:16}}>إرسال طلب التواصل لا يعني قبول المنظمة أو اعتمادها شريكًا.</p>
        </section>

        <section style={{marginTop:42}}>
          <h2 style={{fontSize:26,marginBottom:8}}>من يمكنه الانضمام؟</h2>
          <p style={{color:"#a9bec7",lineHeight:1.8,marginTop:0}}>نرحب بالجهات ذات الصفة الواضحة والأنشطة القابلة للتحقق، في المجالات التالية:</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,230px),1fr))",gap:14,marginTop:18}}>
            {tracks.map(({icon:Icon,title,text})=><article key={title} style={{background:"#0d202b",border:"1px solid #29414d",borderRadius:16,padding:20}}><Icon size={25} color="#83d9ce"/><h3 style={{fontSize:18,margin:"14px 0 8px"}}>{title}</h3><p style={{color:"#a9bec7",lineHeight:1.8,margin:0,fontSize:14}}>{text}</p></article>)}
          </div>
        </section>

        <section id="verification" style={{marginTop:42,padding:24,border:"1px solid #34515c",borderRadius:18,background:"#0b1c26"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}><ShieldCheck color="#83d9ce" size={24}/><h2 style={{fontSize:24,margin:0}}>الثقة والتحقق قبل الشراكة</h2></div>
          <p style={{color:"#b8cbd2",lineHeight:1.9}}>لن تظهر أي جهة على أنها «منظمة شريكة معتمدة» لمجرد إرسال طلب. يلزم التحقق من الاسم القانوني والتسجيل أو الترخيص حيث ينطبق، وموقع الجهة ووسائل اتصالها الرسمية، ومراجعة نطاق خدماتها وموافقتها المكتوبة على التعاون.</p>
          <ul style={{color:"#c7d6dc",lineHeight:2,paddingRight:22}}>
            <li>لا ننشر فرصًا أو مساعدات غير مؤكدة.</li>
            <li>لا نشارك بيانات المستفيدين مع جهة دون موافقتهم الصريحة.</li>
            <li>لا نضمن قبول أي طلب مساعدة أو توفير تمويل.</li>
            <li>تظل كل منظمة مستقلة ومسؤولة عن خدماتها وقراراتها.</li>
          </ul>
        </section>

        <section style={{marginTop:42}}>
          <h2 style={{fontSize:26,marginBottom:18}}>رحلة الانضمام والتعاون</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,220px),1fr))",gap:12}}>
            {steps.map(([title,text],i)=><article key={title} style={{padding:18,borderRadius:14,background:"#0d202b",border:"1px solid #29414d"}}><div style={{color:"#83d9ce",fontWeight:900,fontSize:13}}>المرحلة {i+1}</div><h3 style={{margin:"8px 0",fontSize:18}}>{title}</h3><p style={{margin:0,color:"#a9bec7",fontSize:14,lineHeight:1.8}}>{text}</p></article>)}
          </div>
        </section>

        <OrganizationInquiryForm />
        <footer style={{marginTop:32,textAlign:"center",fontSize:12,color:"#78929d"}}>HUMANITY ONE · شبكة تعاون إنساني قيد التأسيس</footer>
      </div>
    </main>
  );
}
