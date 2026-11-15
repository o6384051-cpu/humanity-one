"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AppLanguage = "ar" | "en";

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const LANGUAGE_KEY = "humanity-one-language-v1";

const ENGLISH_COPY: Record<string, string> = {
  "عام": "General",
  "التعليم": "Education",
  "التوعية الصحية": "Health awareness",
  "الزراعة": "Agriculture",
  "الخدمات الإنسانية": "Humanitarian services",
  "العمل والمهن": "Work & careers",
  "العلوم": "Science",
  "البحث": "Search",
  "منصة المستفيدين": "Beneficiary portal",
  "ملفك واحتياجاتك وطلباتك في مساحة خاصة.": "Your profile, needs, and requests in one private space.",
  "إنشاء حساب": "Create account",
  "دخول": "Sign in",
  "حساب مجاني جديد": "Create a free account",
  "تسجيل الدخول": "Sign in",
  "الاسم": "Name",
  "البريد الإلكتروني": "Email address",
  "كلمة المرور": "Password",
  "إخفاء كلمة المرور": "Hide password",
  "إظهار كلمة المرور": "Show password",
  "نسيت كلمة المرور؟": "Forgot password?",
  "الاسم الكامل": "Full name",
  "رقم هاتف للتواصل": "Contact phone number",
  "المحافظة / المدينة": "Governorate / City",
  "المنطقة": "Area",
  "أبحث عن عمل": "Looking for work",
  "عمل حر": "Self-employed",
  "غير قادر حاليًا": "Unable to work currently",
  "طالب": "Student",
  "إعدادي": "Preparatory",
  "ثانوي / دبلوم": "Secondary / Diploma",
  "جامعي": "University",
  "دراسات عليا": "Postgraduate",
  "أفضل عدم الإفصاح": "Prefer not to say",
  "الدخل الشهري التقريبي بالجنيه (اختياري)": "Approximate monthly income in EGP (optional)",
  "أهدافك وما تحتاج إليه": "Your goals and what you need",
  "مركز الإشعارات": "Notifications",
  "تحديد الكل كمقروء": "Mark all as read",
  "لا توجد إشعارات حتى الآن. سننبهك هنا عند استلام طلبك أو تحديثه.": "No notifications yet. We will notify you here when your request is received or updated.",
  "جديد": "New",
  "لا توجد طلبات بعد.": "No requests yet.",
  "رقم المتابعة:": "Tracking number:",
  "تاريخ الإرسال:": "Submitted:",
  "آخر تحديث:": "Last updated:",
  "عاجل": "Urgent",
  "عادي": "Normal",
  "قيد المراجعة": "Under review",
  "تحت الدراسة": "In review",
  "تمت الموافقة": "Approved",
  "لم تتم الموافقة": "Not approved",
  "مغلق": "Closed",
  "غذاء واحتياجات أساسية": "Food and basic needs",
  "سكن أو إيجار": "Housing or rent",
  "احتياج صحي": "Health needs",
  "تعليم وتدريب": "Education and training",
  "عمل ودخل": "Work and income",
  "تعثر مالي": "Financial hardship",
  "احتياج آخر": "Other need",
  "نوع الاحتياج": "Type of need",
  "الأولوية": "Priority",
  "المدينة": "City",
  "اشرح احتياجك": "Describe your need",
  "أوافق على استخدام البيانات لمراجعة الطلب والتواصل بشأنه.": "I agree to the use of my data to review this request and contact me about it.",
  "جارٍ التنفيذ…": "Processing…",
  "تم تسجيل الخروج.": "You have been signed out.",
  "تم حفظ ملفك.": "Your profile has been saved.",
  "تعذر تحميل بياناتك.": "Could not load your information.",
  "تعذر رفع الملف.": "Could not upload the file.",
  "تم رفع الملف وحفظه بأمان وربطه بطلبك.": "The file was securely uploaded, saved, and linked to your request.",
  "تعذر تحميل الوظائف.": "Could not load jobs.",
  "ابحث عن وظيفة أو حرفة أو منشأة": "Search for a job, trade, or employer",
  "عامل إنتاج، كهربائي، نقاش...": "Production worker, electrician, painter...",
  "الأجر:": "Pay:",
  "جنيه": "EGP",
  "لم يحدد صاحب العمل الأجر": "The employer did not specify pay",
  "إخفاء نموذج التقديم": "Hide application form",
  "قدّم على الوظيفة مجانًا": "Apply for free",
  "اسمك": "Your name",
  "خبرتك العملية أو الحرفة التي تتقنها (اختياري)": "Your work experience or trade (optional)",
  "رسالة لصاحب العمل (اختياري)": "Message to the employer (optional)",
  "جارٍ الإرسال...": "Sending...",
  "إرسال طلب التقديم": "Submit application",
  "تم إرسال طلبك بنجاح.": "Your application was submitted successfully.",
  "تعذر إرسال الطلب.": "Could not submit your application.",
  "محادثة جديدة": "New chat",
  "جاهز للمحادثة": "Ready to chat",
  "يتم تجهيز الرد...": "Preparing response...",
  "تعذر الاتصال بالمساعد": "Could not connect to the assistant",
  "حدث خطأ غير متوقع": "An unexpected error occurred",
  "اكتب رسالتك هنا...": "Type your message here...",
  "رسالتك": "Your message",
  "مسح المحادثة": "Clear conversation",
  "إرسال الرسالة": "Send message",
  "حذف المحادثة": "Delete conversation",
  "فتح القائمة": "Open menu",
  "إغلاق القائمة": "Close menu",
  "تصدير المحادثة": "Export conversation",
  "نسخ الرد": "Copy response",
  "تم النسخ": "Copied",
  "نسخ": "Copy",
  "تم حذف المحادثة": "Conversation deleted",
  "تم تفريغ المحادثة": "Conversation cleared",
  "النتيجة بعد المراجعة": "Reviewed result",
  "مسار العمل": "Workflow",
  "الفريق يعمل...": "The team is working...",
  "ابدأ تنفيذ المهمة": "Start task",
  "اكتب هدفك أو المشكلة التي تريد العمل عليها...": "Describe your goal or the problem you want to work on...",
  "لا توجد ذاكرة مفعّلة": "No memory is enabled",
  "استخدام الملاحظات التي حفظتها بموافقتك": "Use notes you saved with your consent",
  "الملاحظات المحفوظة": "Saved notes",
  "حذف المعلومة": "Delete note",
  "تصدير": "Export",
  "المهام": "Tasks",
  "المتبقية": "Remaining",
  "المكتملة": "Completed",
  "الكل": "All",
  "منخفضة": "Low",
  "متوسطة": "Medium",
  "عالية": "High",
  "لا توجد مهام بعد": "No tasks yet",
  "لا توجد مهام في هذا العرض": "No tasks in this view",
  "جارٍ تحميل المهام...": "Loading tasks...",
  "إعادة فتح المهمة": "Reopen task",
  "إكمال المهمة": "Complete task",
  "حذف المهمة": "Delete task",
  "مثال: إعداد قائمة احتياجات المبادرة": "Example: Prepare an initiative needs list",
  "اسم المبادرة (اختياري)": "Initiative name (optional)",
  "كل المبادرات": "All initiatives",
  "أفكار أولية": "Initial ideas",
  "قيد التنفيذ": "In progress",
  "إغلاق النموذج": "Close form",
  "مثال: دروس دعم مجانية للطلاب": "Example: Free tutoring for students",
  "ما المشكلة التي تريد المبادرة المساهمة في حلها؟": "What problem will this initiative help solve?",
  "من سيستفيد؟": "Who will benefit?",
  "المدينة أو الحي أو عبر الإنترنت": "City, neighborhood, or online",
  "متطوعون، أدوات، مكان، تمويل، خبرات...": "Volunteers, tools, venue, funding, expertise...",
  "ابحث في مبادراتك...": "Search your initiatives...",
  "تصفية حسب الحالة": "Filter by status",
  "لا توجد نتائج مطابقة": "No matching results",
  "ابدأ أول مبادرة": "Start your first initiative",
  "جرّب تغيير كلمات البحث أو حالة المبادرة.": "Try changing your search terms or initiative status.",
  "حذف المبادرة": "Delete initiative",
  "حالة المبادرة": "Initiative status",
  "نبذة مهنية": "Professional summary",
  "المهارات": "Skills",
  "الخبرات العملية": "Work experience",
  "الدورات والشهادات": "Courses and certificates",
  "مثال: خدمة عملاء، فني صيانة، مساعد إداري": "Example: Customer service, maintenance technician, administrative assistant",
  "اكتب ما تجيده ونوع العمل الذي تبحث عنه.": "Describe your skills and the type of work you are seeking.",
  "اسمك الكامل": "Your full name",
  "المسمى الوظيفي المستهدف": "Target job title",
  "بيانات التواصل الاختيارية": "Optional contact details",
  "مواد خام أو بضاعة": "Raw materials or goods",
  "تغليف وتجهيز": "Packaging and preparation",
  "وحدة": "Unit",
  "خدمات منزلية أو صيانة": "Home services or maintenance",
  "بيع منتجات حسب الطلب": "Made-to-order products",
  "أطعمة منزلية": "Homemade food",
  "خدمات رقمية": "Digital services",
  "إنتاج حرفي بسيط": "Small-scale craft production",
  "تجارة محلية صغيرة": "Small local trade",
  "ابدأ بخدمة واحدة ونطاق جغرافي صغير، واختبر الطلب قبل شراء معدات إضافية.": "Start with one service in a small area and test demand before buying more equipment.",
  "مثال: 5000 جنيه": "Example: 5,000 EGP",
  "سعر موثق أو افتراضي": "Verified or estimated price",
  "إيجار، نقل، إنترنت...": "Rent, transport, internet...",
  "اسم البند": "Item name",
  "الكمية": "Quantity",
  "الوحدة": "Unit",
  "تكلفة الوحدة": "Unit cost",
  "إجمالي البنود المدخلة": "Total entered items",
  "الإيراد الشهري التقديري": "Estimated monthly revenue",
  "المتبقي الحسابي": "Calculated remainder",
  "سجّل اسم المورد وتاريخ العرض وما يشمله السعر، ولا تضع بيانات شخصية حساسة.": "Record the supplier, quote date, and what the price includes. Do not enter sensitive personal data.",
  "ثانوي أو ما يعادله": "Secondary or equivalent",
  "الحصول على عمل أو دخل": "Get a job or income",
  "أي فرصة مناسبة": "Any suitable opportunity",
  "متاح": "Available",
  "مهاراتك الحالية": "Your current skills",
  "مشروع صغير": "Small business",
  "مشروع صغير بتكلفة منخفضة": "Low-cost small business",
  "عمل رقمي": "Digital work",
  "حرفة أو عمل يدوي": "Trade or manual work",
  "فرص العمل المناسبة": "Suitable job opportunities",
  "غير متاح بانتظام": "Not regularly available",
  "جرد المهارات والإمكانات": "Inventory your skills and resources",
  "اختيار مسار واحد": "Choose one path",
  "تعلم مهارة صغيرة قابلة للتطبيق": "Learn a practical skill",
  "إنشاء نموذج عمل": "Create a work sample",
  "تجهيز ملف التقديم": "Prepare your application profile",
  "التواصل مع جهات موثوقة": "Contact trusted organizations",
  "تنفيذ محاولات واقعية": "Take practical steps",
  "مراجعة النتائج وتعديل المسار": "Review results and adjust your path",
  "خطوات مكتملة": "Completed steps",
  "مركز تحكم HUMANITY ONE": "HUMANITY ONE Control Center",
  "تحديث البيانات": "Refresh data",
  "جارٍ التحديث...": "Refreshing...",
  "آخر قراءة:": "Last read:",
  "إجمالي الحسابات": "Total accounts",
  "فريق الإدارة": "Administration team",
  "المبادرات": "Initiatives",
  "الوكلاء": "Agents",
  "طلبات التقديم": "Applications",
  "طلبات المساعدة": "Assistance requests",
  "إدارة حسابات المستفيدين": "Manage beneficiary accounts",
  "إدارة حسابات الفريق والصلاحيات": "Manage team accounts and permissions",
  "طلبات المستفيدين والمساعدات": "Beneficiary and assistance requests",
  "مراجعة الطلبات وتحديث حالتها وإرسال إشعار لصاحب الطلب.": "Review requests, update their status, and notify the requester.",
  "مراجعة الوظائف وطلبات التقديم": "Review jobs and applications",
  "المبادرات والمشروعات": "Initiatives and projects",
  "مساعد الذكاء الاصطناعي": "AI assistant",
  "المؤسس": "Founder",
  "إداري": "Administrator",
  "مشرف": "Moderator",
  "رمز التأسيس السري": "Secret setup code",
  "كلمة المرور (12 حرفًا على الأقل عند التأسيس)": "Password (at least 12 characters for setup)",
  "إنشاء حساب المؤسس": "Create founder account",
  "دخول آمن": "Secure sign in",
  "صلاحيتك:": "Your role:",
  "المؤسس — صلاحية عليا": "Founder — highest privilege",
  "تغيير الدور": "Change role",
  "إلغاء صلاحية الإدارة": "Revoke admin access",
  "حذف الحساب.": "Account deleted.",
  "الرسوم والخدمات المجانية": "Fees and free services",
  "مركز الفرص الإنسانية": "Humanitarian opportunities",
  "سوق العمل": "Job marketplace",
  "خطتي الشخصية": "My personal plan",
  "إنشاء سيرة ذاتية": "Build a resume",
  "تخطيط مشروع صغير": "Small business planner",
  "المشاريع": "Projects",
  "محرك المعرفة": "Knowledge hub",
  "التقارير": "Analytics",
  "الإعدادات": "Settings",
  "الرئيسية": "Home",
  "العودة للرئيسية": "Back to home",
  "بحث": "Search",
  "إلغاء": "Cancel",
  "حفظ": "Save",
  "حذف": "Delete",
  "تحديث": "Update",
  "إرسال": "Submit",
  "تنزيل": "Download",
  "التالي": "Next",
  "السابق": "Previous",
  "لا توجد نتائج": "No results",
  "جارٍ التحميل...": "Loading...",
  "تعذر تحميل البيانات.": "Could not load data."
};

export function translateText(value: string, language: AppLanguage): string {
  return language === "ar" ? value : (ENGLISH_COPY[value] ?? value);
}


export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<AppLanguage>("ar");

  useEffect(() => {
    const saved = window.localStorage.getItem(LANGUAGE_KEY);
    if (saved === "ar" || saved === "en") setLanguage(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    window.localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage: () => setLanguage((current) => current === "ar" ? "en" : "ar"),
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}

export function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();
  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={language === "ar" ? "Switch language to English" : "تغيير اللغة إلى العربية"}
      title={language === "ar" ? "English" : "العربية"}
      className="ho-language-switcher"
    >
      <span aria-hidden="true">文</span>
      {language === "ar" ? "English" : "العربية"}
    </button>
  );
}
