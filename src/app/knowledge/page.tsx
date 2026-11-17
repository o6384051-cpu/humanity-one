"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, ExternalLink, GraduationCap, Headphones, Lightbulb, NotebookPen, Search, Sparkles, Target } from "lucide-react";
import { useLanguage } from "../../components/LanguageProvider";

const sources: { name: string; en: string; area: string; areaEn: string; url: string }[] = [
  { name: "منظمة العمل الدولية", en: "International Labour Organization", area: "العمل اللائق وحقوق العمال والتدريب", areaEn: "Decent work, workers’ rights, and training", url: "https://www.ilo.org/" },
  { name: "منظمة الأغذية والزراعة", en: "Food and Agriculture Organization", area: "الزراعة والأمن الغذائي والتنمية الريفية", areaEn: "Agriculture, food security, and rural development", url: "https://www.fao.org/" },
  { name: "منظمة الصحة العالمية", en: "World Health Organization", area: "المعلومات الصحية العامة والصحة المجتمعية", areaEn: "Public health information and community health", url: "https://www.who.int/" },
  { name: "اليونيسف", en: "UNICEF", area: "تعليم الأطفال وحمايتهم ورفاههم", areaEn: "Children’s education, protection, and well-being", url: "https://www.unicef.org/" },
  { name: "برنامج الأمم المتحدة الإنمائي", en: "United Nations Development Programme", area: "التنمية والحد من الفقر وبناء القدرات", areaEn: "Development, poverty reduction, and capacity building", url: "https://www.undp.org/" },
  { name: "مفوضية الأمم المتحدة لشؤون اللاجئين", en: "UN Refugee Agency", area: "الحماية والمساعدة للاجئين والنازحين", areaEn: "Protection and assistance for refugees and displaced people", url: "https://www.unhcr.org/" },
  { name: "مكتب الأمم المتحدة لتنسيق الشؤون الإنسانية", en: "UN Office for the Coordination of Humanitarian Affairs", area: "تنسيق الاستجابة الإنسانية ومعلومات الأزمات", areaEn: "Humanitarian response coordination and crisis information", url: "https://www.unocha.org/" },
  { name: "البنك الدولي", en: "World Bank", area: "بيانات التنمية والفقر والاقتصاد", areaEn: "Development, poverty, and economic data", url: "https://www.worldbank.org/" },
];

const learningTools = [
  {
    icon: BookOpen,
    title: "رفيق القراءة",
    en: "Reading companion",
    description: "اقرأ نصًا أو فصلًا، واسأل عن معاني الكلمات والأفكار الصعبة خطوة بخطوة.",
    descriptionEn: "Read a passage or chapter and ask about difficult words and ideas, step by step.",
    prompt: "كن رفيق قراءتي. سأرسل لك نصًا أو فقرة. اشرحها بلغة عربية سهلة، ووضح الكلمات الصعبة، واسألني سؤالًا واحدًا للتأكد من الفهم. لا تفترض أنني أعرف المصطلحات مسبقًا.",
  },
  {
    icon: NotebookPen,
    title: "تلخيص كتاب أو ملف",
    en: "Book and document summaries",
    description: "احصل على ملخص منظم، وأهم الأفكار، ومفردات جديدة، وأسئلة للمراجعة.",
    descriptionEn: "Get a structured summary, key ideas, new vocabulary, and review questions.",
    prompt: "ساعدني في فهم كتاب أو ملف سأقدمه لك. لخّص المحتوى دون اختلاق معلومات، وافصل بين ما ورد في النص وأي شرح إضافي، ثم استخرج أهم الأفكار وأسئلة للمراجعة.",
  },
  {
    icon: GraduationCap,
    title: "معلم يشرح ببساطة",
    en: "Simple step-by-step tutor",
    description: "تعلّم الرياضيات والعلوم واللغات والمهارات، مع أمثلة تناسب مستواك.",
    descriptionEn: "Learn math, science, languages, and practical skills with level-appropriate examples.",
    prompt: "تصرف كمعلم صبور. اسألني أولًا عن الموضوع الذي أريد تعلمه ومستواي، ثم اشرح لي خطوة بخطوة بأمثلة بسيطة، ولا تنتقل إلى الخطوة التالية قبل التأكد من فهمي.",
  },
  {
    icon: Target,
    title: "اختبر فهمك",
    en: "Check your understanding",
    description: "تدرب بأسئلة قصيرة، واحصل على تصحيح يشرح سبب الإجابة.",
    descriptionEn: "Practice with short questions and receive explanations for each answer.",
    prompt: "أنشئ لي اختبارًا تعليميًا قصيرًا حول الموضوع الذي أحدده. اطرح سؤالًا واحدًا في كل مرة، وانتظر إجابتي، ثم صححها واشرح السبب بلطف.",
  },
  {
    icon: Lightbulb,
    title: "ابدأ من الصفر",
    en: "Start from the basics",
    description: "مسار تدريجي للمبتدئين في القراءة والكتابة والحساب والمهارات الرقمية.",
    descriptionEn: "A gradual path for beginners in reading, writing, numeracy, and digital skills.",
    prompt: "أريد أن أبدأ التعلم من الصفر وبأسلوب يحترم وقتي ومستواي. ساعدني في تحديد هدفي، ثم ضع دروسًا قصيرة ومتدرجة في القراءة أو الكتابة أو الحساب أو المهارات الرقمية. استخدم لغة بسيطة وتدريبات عملية، وشجعني دون إحراج.",
  },
  {
    icon: Search,
    title: "ابحث عن مصادر موثوقة",
    en: "Find reliable learning sources",
    description: "ساعدني في تحديد جهات تعليمية ومراجع مجانية، مع توضيح ما يحتاج إلى تحقق.",
    descriptionEn: "Identify educational organizations and free references, noting what needs verification.",
    prompt: "ساعدني في العثور على مصادر تعليمية مجانية وموثوقة حول الموضوع الذي سأحدده. ميّز بين المصادر الرسمية والمصادر العامة، ولا تخترع روابط أو تنسب معلومات إلى مصدر دون تحقق.",
  },
];

export default function KnowledgePage() {
  const { language } = useLanguage();
  const tr = (ar: string, en: string) => language === "ar" ? ar : en;

  return (
    <main dir={language === "ar" ? "rtl" : "ltr"} lang={language} style={{ minHeight: "100vh", padding: "clamp(18px,4vw,44px)", background: "linear-gradient(145deg,#07131d,#0b1d2b 58%,#102a34)", color: "#e8f1f5" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#8bded2", display: "inline-flex", gap: 8, alignItems: "center" }}><ArrowRight size={17} />{tr("العودة للرئيسية", "Back to home")}</Link>

        <header style={{ margin: "24px 0 30px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 9, color: "#8bded2" }}><BookOpen size={23} /><span>{tr("المعرفة حق للجميع", "Knowledge belongs to everyone")}</span></div>
          <h1 style={{ fontSize: "clamp(28px,5vw,40px)", fontWeight: 850, margin: "12px 0" }}>{tr("مركز القراءة والتعلّم", "Reading & Learning Center")}</h1>
          <p style={{ color: "#b4c6d0", lineHeight: 1.9, maxWidth: 760 }}>{tr("مساحة مجانية قدر الإمكان تساعدك على القراءة والفهم والتعلم من مستواك الحالي، دون إحراج أو تعقيد. اختر ما تحتاجه وابدأ مع المساعد الذكي.", "A learning space, free wherever possible, to help you read, understand, and learn from your current level—without pressure or complexity. Choose a tool and begin with the AI assistant.")}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 18 }}>
            <Link href="/ai-core?prompt=ساعدني%20في%20اختيار%20موضوع%20للتعلم%20وابن%20لي%20خطة%20بسيطة" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 16px", borderRadius: 10, background: "#8bded2", color: "#09202a", fontWeight: 750, textDecoration: "none" }}><Sparkles size={17} />{tr("ابدأ رحلة التعلم", "Start learning")}</Link>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "#b4c6d0", padding: "10px 2px" }}><Headphones size={17} />{tr("تعلم بالسرعة التي تناسبك", "Learn at your own pace")}</span>
          </div>
        </header>

        <section aria-labelledby="learning-tools-title">
          <h2 id="learning-tools-title" style={{ fontSize: 23, fontWeight: 800, marginBottom: 14 }}>{tr("ماذا تريد أن تتعلم اليوم؟", "What would you like to learn today?")}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,285px),1fr))", gap: 13 }}>
            {learningTools.map((tool) => {
              const Icon = tool.icon;
              const title = language === "ar" ? tool.title : tool.en;
              const description = language === "ar" ? tool.description : tool.descriptionEn;
              return (
                <article key={tool.title} style={{ padding: 19, border: "1px solid #31505d", borderRadius: 15, background: "#102333", display: "flex", flexDirection: "column", gap: 11 }}>
                  <span style={{ width: 42, height: 42, borderRadius: 12, display: "grid", placeItems: "center", background: "#173b49", color: "#8bded2" }}><Icon size={21} /></span>
                  <h3 style={{ fontSize: 18, fontWeight: 800 }}>{title}</h3>
                  <p style={{ color: "#b4c6d0", lineHeight: 1.8, flex: 1 }}>{description}</p>
                  <Link href={`/ai-core?prompt=${encodeURIComponent(tool.prompt)}`} style={{ color: "#8bded2", fontWeight: 750, textDecoration: "none" }}>{tr("ابدأ الآن ←", "Start now →")}</Link>
                </article>
              );
            })}
          </div>
        </section>

        <section style={{ marginTop: 34, padding: 20, borderRadius: 16, border: "1px solid #31505d", background: "#0d202d" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 9 }}>{tr("كيف تتعلم بطريقة مريحة؟", "How to learn comfortably")}</h2>
          <ol style={{ color: "#c2d1d8", lineHeight: 2, paddingInlineStart: 22, margin: 0 }}>
            <li>{tr("اختر موضوعًا صغيرًا تريد فهمه.", "Choose one small topic you want to understand.")}</li>
            <li>{tr("اطلب شرحًا بسيطًا، واطلب مثالًا من الحياة اليومية.", "Ask for a simple explanation and an everyday example.")}</li>
            <li>{tr("جرّب سؤالًا أو تمرينًا لتتأكد من فهمك.", "Try a question or exercise to check your understanding.")}</li>
            <li>{tr("كرر التعلم بهدوء، فالخطوات الصغيرة تصنع تقدمًا.", "Keep practicing; small steps create progress.")}</li>
          </ol>
          <p style={{ color: "#91aaaF", fontSize: 13, lineHeight: 1.7, marginTop: 12 }}>{tr("ملاحظة: تعتمد أدوات الشرح والتلخيص على توفر المساعد الذكي واتصاله. راجع المعلومات المهمة من مصادر موثوقة، ولا ترفع مستندات تحتوي على بيانات شخصية أو حساسة.", "Note: AI explanations and summaries depend on assistant availability. Verify important information with trusted sources, and do not upload documents containing personal or sensitive data.")}</p>
        </section>

        <section style={{ marginTop: 36 }}>
          <h2 style={{ fontSize: 23, fontWeight: 800, marginBottom: 8 }}>{tr("مصادر معرفة موثوقة", "Trusted knowledge sources")}</h2>
          <p style={{ color: "#a9bdc8", lineHeight: 1.8, marginBottom: 15 }}>{tr("روابط مباشرة إلى جهات دولية رسمية. هذه مكتبة مصادر وليست محرك بحث حيًا؛ راجع تاريخ كل مادة وشروط استخدامها عند الاستشهاد بها.", "Direct links to official international organizations. This is a source library, not a live search engine; check publication dates and usage terms before citing materials.")}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 12 }}>
            {sources.map((source) => (
              <a key={source.name} href={source.url} target="_blank" rel="noreferrer" style={{ display: "block", padding: 17, border: "1px solid #31505d", borderRadius: 14, background: "#102333", color: "inherit", textDecoration: "none" }}>
                <strong style={{ fontSize: 17 }}>{language === "ar" ? source.name : source.en}</strong>
                <p style={{ color: "#a9bdc8", lineHeight: 1.7 }}>{language === "ar" ? source.area : source.areaEn}</p>
                <span style={{ color: "#83d9ce", display: "inline-flex", gap: 6, alignItems: "center" }}>{tr("فتح المصدر", "Open source")} <ExternalLink size={14} /></span>
              </a>
            ))}
          </div>
          <p style={{ marginTop: 18, color: "#9fb3c0", fontSize: 13 }}>{tr("لم نضف محتوى منسوبًا لهذه الجهات أو نتائج بحث آلية. المصادر تفتح مواقعها الرسمية مباشرة.", "We have not added content attributed to these organizations or automated search results. Links open their official websites directly.")}</p>
        </section>
      </div>
    </main>
  );
}
