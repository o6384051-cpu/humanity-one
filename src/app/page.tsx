'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Home, Bot, FolderKanban, CheckSquare, BookOpen, BarChart3, Settings, Search, Bell, Mail, Sun, Leaf, CheckCircle2, Users, Lightbulb, Send, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      alert(`أنت تبحث عن: ${searchQuery} (هذه نتيجة تجريبية)`);
    }
  };

  return (
    <div className="ho-shell">
      {/* الشريط الجانبي */}
      <aside className="ho-sidebar">
        <div className="ho-brand">
          <div className="ho-brand-mark"><span>∞</span><i></i></div>
          <div><strong>HUMANITY <b>ONE</b></strong><small>Together for a Better Tomorrow</small></div>
        </div>
        <div className="ho-workspace">
          <div className="ho-avatar">أ</div>
          <div><b>أحمد محمد</b><small>مستخدم مميز</small></div>
        </div>
        <div className="ho-nav-label">القائمة الرئيسية</div>
        
        {/* القائمة المحدثة بالروابط */}
        <nav className="ho-nav">
          <Link href="/" className="active"><Home size={18} /> الرئيسية</Link>
          <Link href="/assistant"><Bot size={18} /> المساعد الذكي</Link>
          <Link href="/projects"><FolderKanban size={18} /> المشاريع</Link>
          <Link href="/tasks"><CheckSquare size={18} /> المهام</Link>
          <Link href="/knowledge"><BookOpen size={18} /> محرك المعرفة</Link>
          <Link href="/analytics"><BarChart3 size={18} /> التقارير</Link>
        </nav>

        <div className="ho-sidebar-bottom">
          <div className="ho-trust">
            <ShieldCheck size={18} />
            <div><b>بيانات محمية</b><small>خصوصيتك أولويتنا</small></div>
          </div>
          <Link href="/settings" className="ho-settings"><Settings size={18} /> الإعدادات</Link>
          <div className="ho-version"><span>الإصدار 1.0.0</span><span>2026</span></div>
        </div>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="ho-main">
        <header className="ho-topbar">
          <div className="ho-top-left">
            <div className="ho-breadcrumb">الرئيسية <b>لوحة التحكم</b></div>
          </div>
          <div className="ho-top-actions">
            <form className="ho-search" onSubmit={handleSearch}>
              <Search size={16} />
              <input 
                placeholder="البحث في المنظومة..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <button className="ho-icon-btn"><Bell size={18} /><i></i></button>
            <button className="ho-icon-btn"><Mail size={18} /></button>
            <button className="ho-icon-btn"><Sun size={18} /></button>
            <div className="ho-user">أ</div>
          </div>
        </header>

        <div className="ho-content">
          {/* البانر */}
          <section className="ho-welcome">
            <div className="ho-welcome-copy">
              <div className="ho-eyebrow"><span></span> HUMANITY ONE <span className="ho-eyebrow-line"></span></div>
              <h1>المنظومة الرقمية المستقلة <em>للذكاء الاصطناعي</em></h1>
              <p>معاً.. نبني مستقبلاً أكثر إشراقاً للبشرية. منصة تجمع المعرفة، الأدوات، والوكلاء الذكيين في مكان واحد.</p>
              <div className="ho-welcome-actions">
                <Link href="/projects" className="ho-primary">استكشاف المنصة</Link>
                <button className="ho-secondary">دليل الاستخدام</button>
              </div>
            </div>
            <div className="ho-orbit">
              <div className="ho-orbit-ring ring-one"></div>
              <div className="ho-orbit-ring ring-two"></div>
              <div className="ho-orbit-core">∞</div>
            </div>
          </section>

          {/* الإحصائيات */}
          <section className="ho-stats">
            <article>
              <div className="stat-icon blue"><Leaf size={20} /></div>
              <div><small>مشاريع نشطة</small><b>3</b></div>
            </article>
            <article>
              <div className="stat-icon violet"><CheckCircle2 size={20} /></div>
              <div><small>مهام مكتملة</small><b>10</b></div>
            </article>
            <article>
              <div className="stat-icon mint"><Users size={20} /></div>
              <div><small>مستخدمون نشطون</small><b>125K</b></div>
            </article>
          </section>

          {/* الخدمات */}
          <div className="ho-section-head">
            <div>
              <div className="ho-section-kicker">الخدمات الأساسية</div>
              <h2>ماذا تريد أن تنجز اليوم؟</h2>
            </div>
            <button className="ho-link-btn">عرض الكل ←</button>
          </div>

          <section className="ho-services">
            <button className="ho-service-card">
              <div className="ho-service-icon tone-0"><Leaf size={20} /></div>
              <h3>الطاقة النظيفة</h3>
              <p>حلول مبتكرة لمستقبل مستدام</p>
              <span className="ho-card-arrow">←</span>
            </button>
            <button className="ho-service-card">
              <div className="ho-service-icon tone-1"><Lightbulb size={20} /></div>
              <h3>الزراعة الذكية</h3>
              <p>أنظمة ري ذكية ومستدامة</p>
              <span className="ho-card-arrow">←</span>
            </button>
            <button className="ho-service-card">
              <div className="ho-service-icon tone-2"><HeartHandshake size={20} /></div>
              <h3>الخدمات الإنسانية</h3>
              <p>مبادرات لدعم المجتمع</p>
              <span className="ho-card-arrow">←</span>
            </button>
            <button className="ho-service-card">
              <div className="ho-service-icon tone-3"><BookOpen size={20} /></div>
              <h3>محرك المعرفة</h3>
              <p>مصادر موثقة وموثوقة</p>
              <span className="ho-card-arrow">←</span>
            </button>
          </section>

          {/* المساعد الذكي */}
          <div className="ho-lower-grid">
            <section className="ho-assistant-panel">
              <div className="ho-panel-head">
                <div className="ho-panel-symbol"><Bot size={20} /></div>
                <div><h3>المساعد الذكي</h3><p>جاهز لمساعدتك في أي وقت</p></div>
                <span className="ho-beta">BETA</span>
              </div>
              <div className="ho-prompt-box">
                <textarea placeholder="اكتب طلبك هنا..."></textarea>
                <div className="ho-prompt-tools">
                  <span>أدوات مساعدة</span>
                  <button className="ho-send"><Send size={14} /></button>
                </div>
              </div>
            </section>

            {/* المبادئ */}
            <section className="ho-principles">
              <div className="ho-principles-title">
                <div><span className="ho-section-kicker">مبادئنا</span><h3>قيم المنصة</h3></div>
              </div>
              <div className="ho-principle">
                <span><CheckCircle2 size={16} /></span>
                <div><b>الشفافية</b><small>نوضح كيف نستخدم بياناتك</small></div>
              </div>
              <div className="ho-principle">
                <span><CheckCircle2 size={16} /></span>
                <div><b>التحقق البشري</b><small>المحتوى الحساس يراجعه خبراء</small></div>
              </div>
            </section>
          </div>
          
          <footer className="ho-footer">
            <span>HUMANITY ONE © 2026</span>
            <span><span className="status-dot"></span> جميع الأنظمة تعمل</span>
          </footer>
        </div>
      </main>
    </div>
  );
                }
