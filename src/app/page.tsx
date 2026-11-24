'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage, translateText } from '../components/LanguageProvider';
import { Home, Bot, FolderKanban, CheckSquare, BookOpen, BarChart3, Settings, Search, Bell, Mail, Sun, Leaf, CheckCircle2, Users, Lightbulb, Send, ShieldCheck, HeartHandshake, BadgeInfo, Menu, X, MapPinned } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { language } = useLanguage();
  const tx = (value: string) => translateText(value, language);
  const tr = (ar: string, en: string) => language === 'ar' ? ar : en;
  const [searchQuery, setSearchQuery] = useState('');
  const [assistantQuery, setAssistantQuery] = useState('');
  const [lightMode, setLightMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const openAssistant = (query: string) => {
    const value = query.trim();
    router.push(value ? `/ai-core?prompt=${encodeURIComponent(value)}` : '/ai-core');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    openAssistant(searchQuery);
  };

  return (
    <div className={`ho-shell${lightMode ? " ho-light" : ""}`}>
      {/* الشريط الجانبي */}
      {mobileMenuOpen && <button type="button" className="ho-overlay" aria-label={tr("إغلاق القائمة","Close menu")} onClick={() => setMobileMenuOpen(false)} />}
      <aside id="main-navigation" className={`ho-sidebar${mobileMenuOpen ? " is-open" : ""}`}>
        <button type="button" className="ho-close" aria-label={tr("إغلاق القائمة","Close menu")} onClick={() => setMobileMenuOpen(false)}><X size={21} /></button>
        <div className="ho-brand">
          <div className="ho-brand-mark"><span>∞</span><i></i></div>
          <div><strong>HUMANITY <b>ONE</b></strong><small>Together for a Better Tomorrow</small></div>
        </div>
        <div className="ho-workspace">
          <div className="ho-avatar">{tx("أ")}</div>
          <div><b>{tr("مساحة العمل","Workspace")}</b><small>{tr("ابدأ مبادرتك الإنسانية","Start your humanitarian initiative")}</small></div>
        </div>
        <div className="ho-nav-label">{tr("القائمة الرئيسية","MAIN MENU")}</div>
        
        {/* القائمة المحدثة بالروابط */}
        <nav className="ho-nav" aria-label={tr("القائمة الرئيسية","Main navigation")} onClick={() => setMobileMenuOpen(false)}>
          <Link href="/" className="active"><Home size={18} />{tr("الرئيسية","Home")}</Link>
          <Link href="/ai-core"><Bot size={18} />{tr("المساعد الذكي","AI Assistant")}</Link>
          <Link href="/ai-core"><Bot size={18} />{tr("مركز الذكاء والعمل الإنساني","Humanitarian AI & Action Hub")}</Link>
          <Link href="/agents"><Users size={18} />{tr("فريق الوكلاء","Agent Team")}</Link>
          <Link href="/memory"><BookOpen size={18} />{tr("الذاكرة والخصوصية","Memory & Privacy")}</Link>
          <Link href="/admin"><ShieldCheck size={18} />{tr("إدارة المنظومة","Administration")}</Link>
          <Link href="/mail"><Mail size={18} />{tr("مركز المراسلات","Internal Mail")}</Link>
          <Link href="/radar"><MapPinned size={18} />{tr("الرادار الإنساني","Humanity Radar")}</Link>
          <Link href="/opportunities"><HeartHandshake size={18} />{tr("مركز الفرص الإنسانية","Humanitarian Opportunities")}</Link>
          <Link href="/verified-sources"><BookOpen size={18} />{tr("دليل المصادر الموثوقة","Verified Resources")}</Link>
          <Link href="/organizations"><HeartHandshake size={18} />{tr("شبكة المنظمات والشراكات","Organizations & Partnerships")}</Link>
          <Link href="/beneficiary"><HeartHandshake size={18} />{tr("منصة المستفيدين وطلبات المساعدة","Beneficiary Support Requests")}</Link>
          <Link href="/fees"><BadgeInfo size={18} />{tr("الرسوم والخدمات المجانية","Fees & Free Services")}</Link>
          <Link href="/jobs"><Users size={18} />{tr("سوق العمل","Job Marketplace")}</Link>
          <Link href="/personal-plan"><CheckSquare size={18} />{tr("خطتي الشخصية","My Personal Plan")}</Link>
          <Link href="/resume"><BookOpen size={18} />{tr("إنشاء سيرة ذاتية","Build a Resume")}</Link>
          <Link href="/small-business"><Leaf size={18} />{tr("تخطيط مشروع صغير","Small Business Planner")}</Link>
          <Link href="/projects"><FolderKanban size={18} />{tr("المشاريع","Projects")}</Link>
          <Link href="/tasks"><CheckSquare size={18} />{tr("المهام","Tasks")}</Link>
          <Link href="/knowledge"><BookOpen size={18} />{tr("محرك المعرفة","Knowledge Hub")}</Link>
          <Link href="/analytics"><BarChart3 size={18} />{tr("التقارير","Analytics")}</Link>
        </nav>

        <div className="ho-sidebar-bottom">
          <div className="ho-trust">
            <ShieldCheck size={18} />
            <div><b>{tr("بيانات محمية","Data protected")}</b><small>{tr("خصوصيتك أولويتنا","Your privacy comes first")}</small></div>
          </div>
          <Link href="/settings" className="ho-settings"><Settings size={18} />{tr("الإعدادات","Settings")}</Link>
          <div className="ho-version"><span>{tr("الإصدار 1.0.0","Version 1.0.0")}</span><span>2026</span></div>
        </div>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="ho-main">
        <header className="ho-topbar">
          <div className="ho-top-left">
            <button type="button" className="ho-menu" aria-label={tr("فتح القائمة","Open menu")} aria-controls="main-navigation" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(true)}><Menu size={20} /></button>
            <div className="ho-breadcrumb">{tr("الرئيسية","Home")} <b>{tr("لوحة التحكم","Dashboard")}</b></div>
          </div>
          <div className="ho-top-actions">
            <Link href="/mail" aria-label={tr("مركز المراسلات","Internal Mail")} title={tr("مركز المراسلات","Internal Mail")} style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 36, padding: "0 12px", border: "1px solid rgba(83,211,205,.35)", borderRadius: 10, background: "rgba(56,185,183,.12)", color: "#69e0d7", fontSize: 11, fontWeight: 800, textDecoration: "none", whiteSpace: "nowrap" }}><Mail size={16} />{tr("المراسلات","Mail")}</Link>
            <a href="https://t.me/HumanityOneConnectBot" target="_blank" rel="noopener noreferrer" aria-label={tr("تواصل معنا عبر تيليجرام","Contact us on Telegram")} title={tr("تواصل معنا عبر تيليجرام","Contact us on Telegram")} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, minHeight: 36, padding: "0 12px", border: "1px solid rgba(83,211,205,.45)", borderRadius: 10, background: "rgba(56,185,183,.18)", color: "#69e0d7", fontSize: 11, fontWeight: 800, textDecoration: "none", whiteSpace: "nowrap" }}><Send size={16} />{tr("تيليجرام","Telegram")}</a>
            <Link href="/admin" aria-label={tr("لوحة المدير","Admin dashboard")} title={tr("لوحة المدير","Admin dashboard")} style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 36, padding: "0 12px", border: "1px solid rgba(83,211,205,.35)", borderRadius: 10, background: "rgba(56,185,183,.12)", color: "#69e0d7", fontSize: 11, fontWeight: 800, textDecoration: "none", whiteSpace: "nowrap" }}><ShieldCheck size={16} />{tr("لوحة المدير","Admin")}</Link>
            <form className="ho-search" onSubmit={handleSearch}>
              <Search size={16} />
              <input 
                placeholder={tr("البحث في المنظومة...","Search the platform...")} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <Link href="/beneficiary" className="ho-icon-btn" aria-label={tr("فتح الإشعارات وطلبات المساعدة","Open notifications and assistance requests")} title={tr("الإشعارات وطلبات المساعدة","Notifications and assistance requests")} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}><Bell size={18} /></Link>
            <Link href="/mail" className="ho-icon-btn" aria-label={tr("مركز الرسائل","Message center")} title={tr("مركز الرسائل","Message center")} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",textDecoration:"none"}}><Mail size={18} /></Link>
            <button type="button" className="ho-icon-btn" aria-label={lightMode ? tr("تفعيل الوضع الداكن","Enable dark mode") : tr("تفعيل الوضع الفاتح","Enable light mode")} title={lightMode ? tr("الوضع الداكن","Dark mode") : tr("الوضع الفاتح","Light mode")} onClick={() => setLightMode((mode) => !mode)}>{lightMode ? <Sun size={18} /> : <Sun size={18} />}</button>
            <div className="ho-user">{tx("أ")}</div>
          </div>
        </header>

        <div className="ho-content">
          {/* البانر */}
          <section className="ho-welcome">
            <div className="ho-welcome-copy">
              <div className="ho-eyebrow"><span></span> HUMANITY ONE <span className="ho-eyebrow-line"></span></div>
              <h1>{tr("المنظومة الرقمية المستقلة","An independent digital platform")} <em>{tr("للذكاء الاصطناعي","powered by AI")}</em></h1>
              <p>{tr("معاً.. نبني مستقبلاً أكثر إشراقاً للبشرية. منصة تجمع المعرفة، الأدوات، والوكلاء الذكيين في مكان واحد.","Together, we build a brighter future. One place for knowledge, tools, and intelligent agents.")}</p>
              <div className="ho-welcome-actions">
                <Link href="/projects" className="ho-primary">{tr("استكشاف المنصة","Explore the platform")}</Link>
                <Link href="/projects" className="ho-secondary">{tr("ابدأ مبادرة إنسانية","Start an initiative")}</Link>
              </div>
            </div>
            <div className="ho-orbit">
              <div className="ho-orbit-ring ring-one"></div>
              <div className="ho-orbit-ring ring-two"></div>
              <div className="ho-orbit-core">∞</div>
            </div>
          </section>

          {/* الخدمات */}
          <div className="ho-section-head">
            <div>
              <div className="ho-section-kicker">{tr("الخدمات الأساسية","CORE SERVICES")}</div>
              <h2>{tr("ماذا تريد أن تنجز اليوم؟","What would you like to accomplish today?")}</h2>
            </div>
            <Link href="/projects" className="ho-link-btn">{tr("عرض كل المبادرات ←","View all initiatives →")}</Link>
          </div>

          <section className="ho-services">
            <Link href="/projects" className="ho-service-card">
              <div className="ho-service-icon tone-0"><Leaf size={20} /></div>
              <h3>{tr("الطاقة النظيفة","Clean energy")}</h3>
              <p>{tr("خطط مبادرات للاستدامة والبيئة","Plan sustainability and environmental initiatives")}</p>
              <span className="ho-card-arrow">←</span>
            </Link>
            <Link href="/projects" className="ho-service-card">
              <div className="ho-service-icon tone-1"><Lightbulb size={20} /></div>
              <h3>{tr("الزراعة الذكية","Smart agriculture")}</h3>
              <p>{tr("مبادرات زراعية ومائية مستدامة","Sustainable agriculture and water initiatives")}</p>
              <span className="ho-card-arrow">←</span>
            </Link>
            <Link href="/projects" className="ho-service-card">
              <div className="ho-service-icon tone-2"><HeartHandshake size={20} /></div>
              <h3>{tr("الخدمات الإنسانية","Humanitarian services")}</h3>
              <p>{tr("خطط لدعم المجتمع وحفظ الكرامة","Plans that support communities and protect dignity")}</p>
              <span className="ho-card-arrow">←</span>
            </Link>
            <Link href="/knowledge" className="ho-service-card">
              <div className="ho-service-icon tone-3"><BookOpen size={20} /></div>
              <h3>{tr("محرك المعرفة","Knowledge hub")}</h3>
              <p>{tr("مساحة للمعرفة والتعلم","A space for knowledge and learning")}</p>
              <span className="ho-card-arrow">←</span>
            </Link>
          </section>

          {/* مسارات المنصة — تصميم مستوحى من التصور المعتمد */}
          <section className="ho-pathways" aria-labelledby="ho-pathways-title">
            <div className="ho-section-head">
              <div>
                <div className="ho-section-kicker">{tr("مسارات المنصة","PLATFORM PATHWAYS")}</div>
                <h2 id="ho-pathways-title">{tr("اختر المسار الذي يخدم هدفك","Choose the path that serves your goal")}</h2>
                <p>{tr("مساران متكاملان: أدوات تساعدك على التخطيط، ومجتمع يحول المبادرات إلى أثر.","Two connected paths: tools for planning and a community that turns initiatives into impact.")}</p>
              </div>
            </div>
            <div className="ho-path-grid">
              <article className="ho-path-card ho-path-ai">
                <div className="ho-path-art" aria-hidden="true"><div className="ho-path-globe"><span>AI</span></div><i className="ho-path-orbit orbit-a"></i><i className="ho-path-orbit orbit-b"></i></div>
                <div className="ho-path-body">
                  <span className="ho-path-kicker">{tr("المسار الأول","PATH 01")}</span>
                  <h3>{tr("الأدوات الذكية وتخطيط المبادرات","Smart tools & initiative planning")}</h3>
                  <p>{tr("حوّل فكرتك إلى خطة واضحة، واستفد من أدوات إعداد السيرة الذاتية وتخطيط المشروعات وصياغة مقترحات الدعم.","Turn an idea into a clear plan with tools for resumes, small projects, and support proposals.")}</p>
                  <div className="ho-path-actions">
                    <Link href="/small-business" className="ho-path-action">{tr("مولّد خطط المشاريع","Project planner")} <span>←</span></Link>
                    <Link href="/resume" className="ho-path-action">{tr("مساعد السيرة الذاتية","Resume assistant")} <span>←</span></Link>
                    <Link href="/ai-core" className="ho-path-action">{tr("المساعد الذكي","AI assistant")} <span>←</span></Link>
                  </div>
                </div>
              </article>
              <article className="ho-path-card ho-path-community">
                <div className="ho-path-art" aria-hidden="true"><div className="ho-community-globe">♡</div><i className="ho-community-node node-a">♡</i><i className="ho-community-node node-b">•</i><i className="ho-community-node node-c">♡</i></div>
                <div className="ho-path-body">
                  <span className="ho-path-kicker">{tr("المسار الثاني","PATH 02")}</span>
                  <h3>{tr("المجتمع والتطوع والنشرات","Community, volunteering & alerts")}</h3>
                  <p>{tr("اكتشف فرص التعاون، وتابع الاحتياجات والمبادرات الموثقة، وتواصل مع شبكة المنظمات.","Find ways to collaborate, follow verified needs and initiatives, and connect with organizations.")}</p>
                  <div className="ho-path-actions">
                    <Link href="/opportunities" className="ho-path-action">{tr("الفرص الإنسانية","Humanitarian opportunities")} <span>←</span></Link>
                    <Link href="/organizations" className="ho-path-action">{tr("دليل المنظمات","Organization directory")} <span>←</span></Link>
                    <Link href="/radar" className="ho-path-action">{tr("الرادار الإنساني","Humanity radar")} <span>←</span></Link>
                    <Link href="/mail" className="ho-path-action">{tr("التواصل والمراسلات","Messages & contact")} <span>←</span></Link>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <section className="ho-quick-access" aria-label={tr("أقسام سريعة","Quick access")}>
            <div className="ho-section-head"><div><div className="ho-section-kicker">{tr("وصول سريع","QUICK ACCESS")}</div><h2>{tr("أقسام تحتاجها باستمرار","Your essential shortcuts")}</h2></div></div>
            <div className="ho-quick-grid">
              <Link href="/radar"><MapPinned size={19}/><span>{tr("الرادار الإنساني","Humanity radar")}</span></Link>
              <Link href="/opportunities"><HeartHandshake size={19}/><span>{tr("الفرص الإنسانية","Humanitarian opportunities")}</span></Link>
              <Link href="/organizations"><Users size={19}/><span>{tr("دليل المنظمات","Organization directory")}</span></Link>
              <Link href="/beneficiary"><Bell size={19}/><span>{tr("طلبات المساعدة","Assistance requests")}</span></Link>
              <Link href="/mail"><Mail size={19}/><span>{tr("مركز المراسلات","Message center")}</span></Link>
              <a href="https://t.me/HumanityOneConnectBot" target="_blank" rel="noopener noreferrer"><Send size={19}/><span>{tr("تيليجرام","Telegram")}</span></a>
            </div>
          </section>

          {/* المساعد الذكي */}
          <div className="ho-lower-grid">
            <section className="ho-assistant-panel">
              <div className="ho-panel-head">
                <div className="ho-panel-symbol"><Bot size={20} /></div>
                <div><h3>{tr("المساعد الذكي","AI Assistant")}</h3><p>{tr("جاهز لمساعدتك في أي وقت","Ready to help whenever you need")}</p></div>
                <span className="ho-beta">BETA</span>
              </div>
              <div className="ho-prompt-box">
                <form onSubmit={(e) => { e.preventDefault(); openAssistant(assistantQuery); }}>
                  <textarea value={assistantQuery} onChange={(e) => setAssistantQuery(e.target.value)} placeholder={tr("اكتب طلبك هنا...","Type your request here...")} />
                  <div className="ho-prompt-tools">
                    <span>{tr("سيتم فتح مساحة المحادثة الذكية","Your AI workspace will open")}</span>
                    <button className="ho-send" type="submit" aria-label={tr("ابدأ المحادثة","Start conversation")} disabled={!assistantQuery.trim()}><Send size={14} /></button>
                  </div>
                </form>
              </div>
            </section>

            {/* المبادئ */}
            <section className="ho-principles">
              <div className="ho-principles-title">
                <div><span className="ho-section-kicker">{tr("مبادئنا","OUR PRINCIPLES")}</span><h3>{tr("قيم المنصة","Platform values")}</h3></div>
              </div>
              <div className="ho-principle">
                <span><CheckCircle2 size={16} /></span>
                <div><b>{tr("الشفافية","Transparency")}</b><small>{tr("نوضح كيف نستخدم بياناتك","We explain how your data is used")}</small></div>
              </div>
              <div className="ho-principle">
                <span><CheckCircle2 size={16} /></span>
                <div><b>{tr("التحقق البشري","Human review")}</b><small>{tr("المحتوى الحساس يراجعه خبراء","Sensitive content is reviewed by people")}</small></div>
              </div>
            </section>
          </div>
          
          <footer className="ho-footer">
            <span>HUMANITY ONE © 2026</span>
            <Link href="/mail" aria-label="Open HUMANITY ONE internal mail" style={{display:"inline-flex",alignItems:"center",gap:7,color:"#80dacf",textDecoration:"none"}}><Mail size={15} /> {tr("مركز المراسلات","Internal Mail")}</Link>
            <a href="https://t.me/HumanityOneConnectBot" target="_blank" rel="noopener noreferrer" aria-label="Contact HUMANITY ONE on Telegram" style={{display:"inline-flex",alignItems:"center",gap:7,color:"#80dacf",textDecoration:"none"}}><Send size={15} /> {tr("تواصل معنا عبر تيليجرام","Contact us on Telegram")}</a>
            <a href="mailto:humanityone.contact@gmail.com" aria-label="Email HUMANITY ONE" style={{display:"inline-flex",alignItems:"center",gap:7,color:"#80dacf",textDecoration:"none",direction:"ltr"}}>
              <Mail size={15} /> humanityone.contact@gmail.com
            </a>
            <span><span className="status-dot"></span> {tr("نسخة تجريبية — بعض الخدمات قيد التطوير","Beta version — some services are still in development")}</span>
          </footer>
        </div>
      </main>
    </div>
  );
                }
