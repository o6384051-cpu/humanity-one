import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { Leaf, CheckCircle2, Users, Lightbulb } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:mr-64 flex flex-col min-h-screen">
        <TopBar />
        <main className="p-6 flex-1">
          <div className="rounded-2xl mb-6 bg-gradient-to-l from-[#0a192f] to-[#112240] border border-gray-800 h-48 flex items-center px-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">HUMANITY ONE</h2>
              <p className="text-lg text-gray-300">المنظومة الرقمية المستقلة</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card p-5 rounded-2xl border border-gray-800 flex justify-between items-center">
              <div><p className="text-gray-400 text-xs">مشاريع</p><h4 className="text-white text-2xl font-bold">3</h4></div>
              <div className="p-3 rounded-full bg-success/10 text-success"><Leaf /></div>
            </div>
            <div className="bg-card p-5 rounded-2xl border border-gray-800 flex justify-between items-center">
              <div><p className="text-gray-400 text-xs">مهام</p><h4 className="text-white text-2xl font-bold">10</h4></div>
              <div className="p-3 rounded-full bg-primary/10 text-primary"><CheckCircle2 /></div>
            </div>
            <div className="bg-card p-5 rounded-2xl border border-gray-800 flex justify-between items-center">
              <div><p className="text-gray-400 text-xs">مستخدمون</p><h4 className="text-white text-2xl font-bold">125K</h4></div>
              <div className="p-3 rounded-full bg-purple/10 text-purple"><Users /></div>
            </div>
            <div className="bg-card p-5 rounded-2xl border border-gray-800 flex justify-between items-center">
              <div><p className="text-gray-400 text-xs">معرفة</p><h4 className="text-white text-2xl font-bold">892K</h4></div>
              <div className="p-3 rounded-full bg-warning/10 text-warning"><Lightbulb /></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
