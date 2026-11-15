'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage, translateText } from '../components/LanguageProvider';
import { Home, Bot, FolderKanban, CheckSquare, BookOpen, BarChart3, Settings, Search, Bell, Mail, Sun, Leaf, CheckCircle2, Users, Lightbulb, Send, ShieldCheck, HeartHandshake, BadgeInfo } from 'lucide-react';

export default function Dashboard() {
  const tx = (value: string) => translateText(value, language);
  const router = useRouter();
  const { language } = useLanguage();
  const tr = (ar: string, en: string) => language === 'ar' ? ar : en;
  const [searchQuery, setSearchQuery] = useState('');
  const [assistantQuery, setAssistantQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [lightMode, setLightMode] = useState(false);

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
      <aside className="ho-sidebar">
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
        <nav className="ho-nav">
          <Link href="/" className="active"><Home size={18} />{tr("الرئيسية","Home")}</Link>
          <Link href="/ai-core"><Bot size={18} />{tr("المساعد الذكي","AI Assistant")}</Link>
          <Link href="/ai-core"><Bot size={18} />{tr("مركز الذكاء والعمل الإنساني","Humanitarian AI & Action Hub")}</Link>
          <Link href="/agents"><Users size={18} />{tr("فريق الوكلاء","Agent Team")}</Link>
          <Link href="/memory"><BookOpen size={18} />{tr("الذاكرة والخصوصية","Memory & Privacy")}</Link>
          <Link href="/admin"><ShieldCheck size={18} />{tr("إدارة المنظومة","Administration")}</Link>
          <Link href="/opportunities"><HeartHandshake size={18} />{tr("مركز الفرص الإنسانية","Humanitarian Opportunities")}</Link>
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
            <div className="ho-breadcrumb">{tr("الرئيسية","Home")} <b>{tr("لوحة التحكم","Dashboard")}</b></div>
          </div>
          <div className="ho-top-actions">
            <Link href="/admin" aria-label={tr("لوحة المدير","Admin dashboard")} title={tr("لوحة المدير","Admin dashboard")} style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 36, padding: "0 12px", border: "1px solid rgba(83,211,205,.35)", borderRadius: 10, background: "rgba(56,185,183,.12)", color: "#69e0d7", fontSize: 11, fontWeight: 800, textDecoration: "none", whiteSpace: "nowrap" }}><ShieldCheck size={16} />{tr("لوحة المدير","Admin")}</Link>
            <form className="ho-search" onSubmit={handleSearch}>
              <Search size={16} />
              <input 
                placeholder={tr("البحث في المنظومة...","Search the platform...")} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <div className="ho-top-control">
              <button type="button" className="ho-icon-btn" aria-label={tr("الإشعارات","Notifications")} aria-expanded={notificationsOpen} onClick={() => { setNotificationsOpen((open) => !open); setMessagesOpen(false); }}><Bell size={18} />{!notificationsOpen && <i />}</button>
              {notificationsOpen && <div className="ho-top-popover"><b>{tr("الإشعارات","Notifications")}</b><p>{tr("لا توجد إشعارات جديدة حاليًا.","There are no new notifications.")}</p><small>{tr("ستظهر هنا التنبيهات الفعلية عند تفعيل نظام الإشعارات.","Actual alerts will appear here when notifications are enabled.")}</small></div>}
            </div>
            <div className="ho-top-control">
              <button type="button" className="ho-icon-btn" aria-label={tr("الرسائل","Messages")} aria-expanded={messagesOpen} onClick={() => { setMessagesOpen((open) => !open); setNotificationsOpen(false); }}><Mail size={18} /></button>
              {messagesOpen && <div className="ho-top-popover"><b>{tr("الرسائل","Messages")}</b><p>{tr("صندوق الرسائل المباشر لم يتم تفعيله بعد.","Direct messaging is not enabled yet.")}</p><Link href="/ai-core" onClick={() => setMessagesOpen(false)}>{tr("افتح المساعد الذكي للتواصل الآن","Open the AI assistant to continue")}</Link></div>}
            </div>
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

          {/* ركائز العمل الإنساني */}
          <section className="ho-stats">
            <article>
              <div className="stat-icon blue"><Leaf size={20} /></div>
              <div><small>{tr("الاستدامة","Sustainability")}</small><b>{tr("أثر طويل الأمد","Long-term impact")}</b></div>
            </article>
            <article>
              <div className="stat-icon violet"><ShieldCheck size={20} /></div>
              <div><small>{tr("السلامة والكرامة","Safety & dignity")}</small><b>{tr("الإنسان أولًا","People first")}</b></div>
            </article>
            <article>
              <div className="stat-icon mint"><Users size={20} /></div>
              <div><small>{tr("التعاون","Collaboration")}</small><b>{tr("العمل معًا","Working together")}</b></div>
            </article>
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
            <span><span className="status-dot"></span> {tr("نسخة تجريبية — بعض الخدمات قيد التطوير","Beta version — some services are still in development")}</span>
          </footer>
        </div>
      </main>
    </div>
  );
                }
