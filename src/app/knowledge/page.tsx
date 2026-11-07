import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';

export default function KnowledgePage() {
  return (
    <div className="ho-shell" style={{ padding: '50px', minHeight: '100vh' }}>
      <h1 style={{ color: '#62e2d4', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <BookOpen /> محرك المعرفة
      </h1>
      <p style={{ color: '#a6b9ca', marginBottom: '20px' }}>ابحث في قاعدة المعرفة الموثقة.</p>
      <Link href="/" style={{ color: '#62e2d4', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ArrowRight size={16} /> العودة للرئيسية
      </Link>
    </div>
  );
}
