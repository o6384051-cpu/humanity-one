import { Search, Bell, Mail, Globe, Sun } from 'lucide-react';

export default function TopBar() {
  return (
    <header className="flex items-center justify-between p-4 bg-background border-b border-gray-800 md:mr-64">
      <div className="flex-1 max-w-lg relative">
        <input type="text" placeholder="البحث في المنظومة..." className="w-full bg-card border border-gray-700 rounded-full py-2 px-4 pr-10 text-sm focus:outline-none text-gray-300" />
        <Search className="absolute right-3 top-2.5 text-gray-500" size={18} />
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-400 hover:text-white"><Bell size={20} /></button>
        <button className="p-2 text-gray-400 hover:text-white"><Mail size={20} /></button>
      </div>
    </header>
  );
}
