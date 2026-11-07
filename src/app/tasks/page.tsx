import Link from 'next/link';
import { ArrowRight, CheckSquare } from 'lucide-react';

export default function TasksPage() {
  return (
    <div className="ho-shell" style={{ padding: '50px', minHeight: '100vh' }}>
      <h1 style={{ color: '#62e2d4', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <CheckSquare /> المهام
      </h1>
      <p style={{ color: '#a6b9ca', marginBottom: '20px' }}>هنا يمكنك إدارة مهامك اليومية.</p>
      <Link href="/" style={{ color: '#62e2d4', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ArrowRight size={16} /> العودة للرئيسية
      </Link>
    </div>
  );
}
