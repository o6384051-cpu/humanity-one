import { Home, Bot, FolderKanban, CheckSquare, BookOpen, Settings, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function Sidebar() {
  const menuItems = [
    { icon: Home, label: "الرئيسية", href: "/" },
    { icon: Bot, label: "المساعد الذكي", href: "/" },
    { icon: FolderKanban, label: "المشاريع", href: "/" },
    { icon: CheckSquare, label: "المهام", href: "/" },
    { icon: BookOpen, label: "محرك المعرفة", href: "/" },
    { icon: BarChart3, label: "التقارير", href: "/" },
    { icon: Settings, label: "الإعدادات", href: "/" },
  ];

  return (
    <aside className="w-64 bg-sidebar min-h-screen flex-col border-l border-gray-800 p-4 fixed right-0 top-0 h-full hidden md:flex">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xl">∞</div>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">HUMANITY ONE</h1>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        {menuItems.map((item, i) => (
          <Link key={i} href={item.href} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white">
            <item.icon size={20} />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
