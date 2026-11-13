import Link from "next/link";
import {ArrowRight,BookOpen,ExternalLink} from "lucide-react";
const sources=[
 {name:"منظمة العمل الدولية",area:"العمل اللائق وحقوق العمال والتدريب",url:"https://www.ilo.org/"},
 {name:"منظمة الأغذية والزراعة",area:"الزراعة والأمن الغذائي والتنمية الريفية",url:"https://www.fao.org/"},
 {name:"منظمة الصحة العالمية",area:"المعلومات الصحية العامة والصحة المجتمعية",url:"https://www.who.int/"},
 {name:"اليونيسف",area:"تعليم الأطفال وحمايتهم ورفاههم",url:"https://www.unicef.org/"},
 {name:"برنامج الأمم المتحدة الإنمائي",area:"التنمية والحد من الفقر وبناء القدرات",url:"https://www.undp.org/"},
 {name:"مفوضية الأمم المتحدة لشؤون اللاجئين",area:"الحماية والمساعدة للاجئين والنازحين",url:"https://www.unhcr.org/"},
 {name:"مكتب الأمم المتحدة لتنسيق الشؤون الإنسانية",area:"تنسيق الاستجابة الإنسانية ومعلومات الأزمات",url:"https://www.unocha.org/"},
 {name:"البنك الدولي",area:"بيانات التنمية والفقر والاقتصاد",url:"https://www.worldbank.org/"},
];
export default function KnowledgePage(){return <main dir="rtl" style={{minHeight:"100vh",padding:"clamp(18px,4vw,44px)",background:"linear-gradient(145deg,#07131d,#0b1d2b 58%,#102a34)",color:"#e8f1f5"}}><div style={{maxWidth:1000,margin:"0 auto"}}><Link href="/" style={{color:"#8bded2",display:"inline-flex",gap:8,alignItems:"center"}}><ArrowRight size={17}/> العودة للرئيسية</Link><header style={{margin:"24px 0"}}><BookOpen size={24}/><h1 style={{fontSize:32,fontWeight:800}}>مكتبة مصادر المعرفة</h1><p style={{color:"#a9bdc8",lineHeight:1.9}}>روابط مباشرة إلى جهات دولية رسمية. هذه مكتبة مصادر وليست محرك بحث حيًا؛ راجع تاريخ كل مادة وشروط استخدامها عند الاستشهاد بها.</p></header><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:12}}>{sources.map(s=><a key={s.name} href={s.url} target="_blank" rel="noreferrer" style={{display:"block",padding:17,border:"1px solid #31505d",borderRadius:14,background:"#102333",color:"inherit",textDecoration:"none"}}><strong style={{fontSize:17}}>{s.name}</strong><p style={{color:"#a9bdc8",lineHeight:1.7}}>{s.area}</p><span style={{color:"#83d9ce",display:"inline-flex",gap:6,alignItems:"center"}}>فتح المصدر <ExternalLink size={14}/></span></a>)}</div><p style={{marginTop:18,color:"#9fb3c0"}}>لم نضف محتوى منسوبًا لهذه الجهات أو نتائج بحث آلية. المصادر تفتح مواقعها الرسمية مباشرة.</p></div></main>}