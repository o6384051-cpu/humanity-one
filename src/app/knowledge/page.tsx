"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, ExternalLink, GraduationCap, Lightbulb, Sparkles, Target } from "lucide-react";
import { useLanguage } from "../../components/LanguageProvider";

const sources = [
  { name: "منظمة العمل الدولية", en: "International Labour Organization", url: "https://www.ilo.org/" },
  { name: "منظمة الأغذية والزراعة", en: "Food and Agriculture Organization", url: "https://www.fao.org/" },
  { name: "منظمة الصحة العالمية", en: "World Health Organization", url: "https://www.who.int/" },
  { name: "اليونيسف", en: "UNICEF", url: "https://www.unicef.org/" },
  { name: "برنامج الأمم المتحدة الإنمائي", en: "United Nations Development Programme", url: "https://www.undp.org/" },
  { name: "مفوضية الأمم المتحدة لشؤون اللاجئين", en: "UN Refugee Agency", url: "https://www.unhcr.org/" },
  { name: "مكتب الأمم المتحدة لتنسيق الشؤون الإنسانية", en: "UN Office for the Coordination of Humanitarian Affairs", url: "https://www.unocha.org/" },
  { name: "البنك الدولي", en: "World Bank", url: "https://www.worldbank.org/" },
];

const learningPaths = [
  {
    icon: BookOpen,
    title: "اقرأ وافهم",
    en: "Read and understand",
    description: "أرسل نصًا أو كتابًا، وساعدك على فهمه وتلخيصه وشرح الكلمات الصعبة.",
    descriptionEn: "Share a passage or book and get help understanding it, summarizing it, and explaining difficult words.",
    prompt: "كن رفيق قراءتي. ساعدني على فهم النص أو الكتاب الذي سأرسله، واشرح الكلمات والأفكار الصعبة بلغة بسيطة، ثم لخّصه دون اختلاق معلومات واسألني سؤالًا واحدًا للتأكد من الفهم.",
  },
  {
    icon: GraduationCap,
    title: "تعلّم من البداية",
    en: "Learn from the beginning",
    description: "تعلّم القراءة والكتابة والحساب واللغات والمهارات الرقمية خطوة بخطوة.",
    descriptionEn: "Learn reading, writing, numeracy, languages, and digital skills step by step.",
    prompt: "كن معلمي الصبور. أريد أن أتعلم من مستواي الحالي. اسألني عما أريد تعلمه ومستواي، ثم قدّم دروسًا قصيرة وبسيطة مع أمثلة وتمارين عملية، ولا تنتقل قبل التأكد من فهمي.",
  },
  {
    icon: Target,
    title: "تدرّب واختبر نفسك",
    en: "Practice and check yourself",
    description: "تدرّب بأسئلة قصيرة، واحصل على تصحيح واضح وشرح يساعدك على التقدم.",
    descriptionEn: "Practice with short questions and receive clear feedback that helps you improve.",
    prompt: "أنشئ لي تدريبًا قصيرًا حول الموضوع الذي أحدده. اطرح سؤالًا واحدًا في كل مرة، وانتظر إجابتي، ثم صححها واشرح السبب بلطف، وعدّل مستوى الأسئلة حسب إجاباتي.",
  },
];

export default function KnowledgePage() {
  const { language } = useLanguage();
  const tr = (ar: string, en: string) => language === "ar" ? ar : en;

  return (
    <main dir={language === "ar" ? "rtl" : "ltr"} lang={language} style={{ minHeight: "100vh", padding: "clamp(18px,4vw,44px)", background: "linear-gradient(145deg,#07131d,#0b1d2b 58%,#102a34)", color: "#e8f1f5" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#8bded2", display: "inline-flex", gap: 8, alignItems: "center" }}><ArrowRight size={17} />{tr("العودة للرئيسية", "Back to home")}</Link>

        <header style={{ margin: "26px 0 30px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 9, color: "#8bded2" }}><BookOpen size={23} /><span>{tr("المعرفة حق للجميع", "Knowledge belongs to everyone")}</span></div>
          <h1 style={{ fontSize: "clamp(28px,5vw,40px)", fontWeight: 850, margin: "12px 0" }}>{tr("مركز القراءة والتعلّم", "Reading & Learning Center")}</h1>
          <p style={{ color: "#b4c6d0", lineHeight: 1.9, maxWidth: 760 }}>{tr("مكان بسيط ومجاني قدر الإمكان يساعدك على القراءة والفهم والتعلم من مستواك الحالي. اختر ما تحتاجه وابدأ.", "A simple learning space, free wherever possible, that helps you read, understand, and learn at your own pace. Choose what you need and begin.")}</p>
          <Link href="/ai-core?prompt=ساعدني%20في%20اختيار%20ما%20أتعلمه%20وابن%20لي%20خطة%20بسيطة" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 14, padding: "11px 16px", borderRadius: 10, background: "#8bded2", color: "#09202a", fontWeight: 750, textDecoration: "none" }}><Sparkles size={17} />{tr("ساعدني أبدأ", "Help me get started")}</Link>
        </header>

        <section aria-labelledby="learning-paths-title">
          <h2 id="learning-paths-title" style={{ fontSize: 23, fontWeight: 800, marginBottom: 14 }}>{tr("كيف يمكننا مساعدتك؟", "How can we help you?")}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 13 }}>
            {learningPaths.map((path) => {
              const Icon = path.icon;
              return (
                <article key={path.title} style={{ padding: 19, border: "1px solid #31505d", borderRadius: 15, background: "#102333", display: "flex", flexDirection: "column", gap: 11 }}>
                  <span style={{ width: 42, height: 42, borderRadius: 12, display: "grid", placeItems: "center", background: "#173b49", color: "#8bded2" }}><Icon size={21} /></span>
                  <h3 style={{ fontSize: 18, fontWeight: 800 }}>{tr(path.title, path.en)}</h3>
                  <p style={{ color: "#b4c6d0", lineHeight: 1.8, flex: 1 }}>{tr(path.description, path.descriptionEn)}</p>
                  <Link href={`/ai-core?prompt=${encodeURIComponent(path.prompt)}`} style={{ color: "#8bded2", fontWeight: 750, textDecoration: "none" }}>{tr("ابدأ هنا ←", "Start here →")}</Link>
                </article>
              );
            })}
          </div>
        </section>

        <section style={{ marginTop: 30, padding: 19, borderRadius: 16, border: "1px solid #31505d", background: "#0d202d" }}>
          <h2 style={{ fontSize: 21, fontWeight: 800, marginBottom: 8 }}>{tr("خطوات صغيرة تصنع فرقًا", "Small steps make a difference")}</h2>
          <p style={{ color: "#c2d1d8", lineHeight: 1.9, margin: 0 }}>{tr("ابدأ بموضوع واحد، اطلب شرحًا بسيطًا، جرّب تمرينًا، وواصل بالسرعة التي تناسبك. لا توجد أسئلة محرجة ولا حاجة إلى خبرة سابقة.", "Start with one topic, ask for a simple explanation, try an exercise, and continue at your own pace. No question is embarrassing, and no prior experience is needed.")}</p>
          <p style={{ color: "#91aaaf", fontSize: 13, lineHeight: 1.7, marginTop: 12 }}>{tr("تعتمد أدوات الشرح والتلخيص على توفر المساعد الذكي. راجع المعلومات المهمة من مصادر موثوقة، ولا ترفع مستندات تحتوي على بيانات شخصية أو حساسة.", "AI explanations and summaries depend on assistant availability. Verify important information with trusted sources, and do not upload documents containing personal or sensitive data.")}</p>
        </section>

        <details style={{ marginTop: 26, padding: 17, border: "1px solid #31505d", borderRadius: 14, background: "#102333" }}>
          <summary style={{ cursor: "pointer", color: "#8bded2", fontWeight: 750 }}>{tr("مصادر معرفة موثوقة (اختياري)", "Trusted knowledge sources (optional)")}</summary>
          <p style={{ color: "#a9bdc8", lineHeight: 1.8 }}>{tr("روابط مباشرة إلى مواقع جهات دولية رسمية. هذه قائمة مصادر وليست محرك بحث حيًا.", "Direct links to official international organizations. This is a source list, not a live search engine.")}</p>
          <ul style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10, paddingInlineStart: 22 }}>
            {sources.map((source) => <li key={source.name}><a href={source.url} target="_blank" rel="noreferrer" style={{ color: "#c2d1d8" }}>{language === "ar" ? source.name : source.en} <ExternalLink size={12} style={{ display: "inline" }} /></a></li>)}
          </ul>
        </details>
      </div>
    </main>
  );
}
