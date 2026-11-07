import Link from 'next/link';
import { ArrowRight, Bot } from 'lucide-react';

export default function AssistantPage() {
  return (
    <div className="ho-shell" style={{ padding: '50px', minHeight: '100vh' }}>
      <h1 style={{ color: '#62e2d4', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Bot /> المساعد الذكي
      </h1>
      <p style={{ color: '#a6b9ca', marginBottom: '20px' }}>هنا ستتمكن من التحدث مع المساعد الذكي.</p>
      <Link href="/" style={{ color: '#62e2d4', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ArrowRight size={16} /> العودة للرئيسية
      </Link>
    </div>
  );
}
