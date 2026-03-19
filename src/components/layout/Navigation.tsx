'use client';

import React from 'react';
import { Activity, LayoutDashboard, FilePlus, Settings } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar = ({ currentTab, setCurrentTab }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'แดชบอร์ดสรุปผล' },
    { id: 'transactions', icon: FilePlus, label: 'ลงบันทึกประจำวัน' },
    { id: 'setup', icon: Settings, label: 'จัดการเพจและหมวดหมู่' }
  ];

  return (
    <aside className="hidden md:flex flex-col w-20 hover:w-72 group bg-sidebar-bg fixed h-full z-40 text-white shadow-2xl border-r border-white/5 transition-all duration-300 ease-in-out">
      <div className="p-6 mb-10 overflow-hidden">
        <div className="flex items-center gap-4 cursor-pointer min-w-[200px]">
          <div className="p-2.5 bg-[#facc15] rounded-xl shadow-[0_0_20px_rgba(250,204,21,0.2)] transition-transform flex-shrink-0">
            <Activity size={24} className="text-sidebar-bg" />
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden whitespace-nowrap">
            <h1 className="text-xl font-bold tracking-tight font-outfit uppercase">CreatorSpace</h1>
            <p className="text-[9px] text-slate-500 font-bold tracking-[0.25em] font-noto -mt-0.5 uppercase">Dashboard Matrix</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map(item => (
          <button 
            key={item.id} 
            onClick={() => setCurrentTab(item.id)}
            className={cn(
              "w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-semibold transition-all duration-300 relative group/item overflow-hidden text-[13px] font-noto",
              currentTab === item.id 
                ? 'bg-sidebar-active text-white shadow-inner' 
                : 'text-slate-500 hover:text-white hover:bg-white/5'
            )}
          >
            {currentTab === item.id && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#facc15] rounded-r-full shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
            )}
            <item.icon size={19} className={cn("transition-colors flex-shrink-0", currentTab === item.id ? "text-[#facc15]" : "group-hover/item:text-[#facc15]")} /> 
            <span className="tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden whitespace-nowrap">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="p-8 border-t border-white/5 opacity-40 overflow-hidden">
        <p className="text-[10px] font-noto text-slate-500 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">v1.2.0 • Personal Edition</p>
      </div>
    </aside>
  );
};

export const MobileHeader = () => (
  <header className="md:hidden bg-[var(--sidebar-bg)] p-5 sticky top-0 z-30 flex items-center gap-3 text-white border-b border-white/5">
    <div className="p-1.5 bg-[#facc15] rounded-lg shadow-[0_0_15px_rgba(250,204,21,0.2)]">
      <Activity size={18} className="text-[#0f172a]"/>
    </div>
    <h1 className="text-lg font-bold font-outfit uppercase tracking-tight">CreatorSpace</h1>
  </header>
);

export const MobileBottomNav = ({ currentTab, setCurrentTab }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'แดชบอร์ด' },
    { id: 'transactions', icon: FilePlus, label: 'บันทึก' },
    { id: 'setup', icon: Settings, label: 'จัดการ' }
  ];

  return (
    <nav className="md:hidden fixed bottom-6 left-4 right-4 bg-[var(--sidebar-bg)]/95 backdrop-blur-md border border-white/10 flex justify-around p-3 z-50 rounded-[2rem] shadow-2xl shadow-black/40">
      {menuItems.map(item => (
        <button 
          key={item.id} 
          onClick={() => setCurrentTab(item.id)} 
          className={cn(
            "flex flex-col items-center px-4 py-2 rounded-2xl transition-all duration-300",
            currentTab === item.id ? 'text-[#facc15] bg-[var(--sidebar-active)]' : 'text-slate-500 hover:text-white'
          )}
        >
          <item.icon size={20} className={cn("mb-1 transition-transform", currentTab === item.id && "scale-110")} />
          <span className="text-[9px] font-bold font-noto uppercase tracking-wider">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};
