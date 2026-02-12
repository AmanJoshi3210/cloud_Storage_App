import React from 'react';
import { LayoutDashboard, Image as ImageIcon, Settings, Cloud } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openSettings: () => void;
  filesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, openSettings, filesCount }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'images', icon: ImageIcon, label: 'Images' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 border-r border-slate-800">
      <div className="p-6 flex items-center gap-3 text-white">
        <div className="bg-blue-600 p-2 rounded-lg">
             <Cloud size={24} />
        </div>
        <span className="font-bold text-xl tracking-tight">CloudGem</span>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
         <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Storage</p>
            <div className="flex items-end gap-2 mb-1">
                <span className="text-2xl font-bold text-white">{filesCount}</span>
                <span className="text-sm text-slate-400 mb-1">files</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-3/4 rounded-full"></div>
            </div>
         </div>

        <button
          onClick={openSettings}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-slate-400"
        >
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </aside>
  );
};
