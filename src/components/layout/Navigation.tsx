'use client';

import React from 'react';
import {
  Plus, Users, LayoutDashboard, FilePlus,
  CreditCard, Activity, BarChart3,
  Building2, Calendar as CalendarIcon,
  Video as VideoIcon, Settings as SettingsIcon,
  History as HistoryIcon, HelpCircle,
  PieChart, ChevronRight, ChevronDown, Scale, BookOpen
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { POCLogo } from '@/components/brand/POCLogo';
import { useCompanyConfig } from '@/features/company/hooks/useCompanyConfig';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar = ({ currentTab, setCurrentTab }: SidebarProps) => {
  const { user: currentUser, logout } = useAuth();

  if (!currentUser) return null;

  const menuGroups = [
    {
      title: 'Workspace',
      items: [
        { id: 'dashboard', icon: LayoutDashboard, label: 'แดชบอร์ดสรุปผล', roles: [Role.Staff, Role.Manager, Role.Admin, Role.SuperAdmin, Role.Developer] },
        { id: 'calendar', icon: CalendarIcon, label: 'ปฏิทินงาน', roles: [Role.Staff, Role.Manager, Role.Admin, Role.SuperAdmin, Role.Developer] },
        { id: 'daily-task', icon: VideoIcon, label: 'ส่งงานรายวัน', roles: [Role.Staff, Role.Manager, Role.Admin, Role.SuperAdmin, Role.Developer] },
        { id: 'setup', icon: SettingsIcon, label: 'จัดการเพจและบัญชี', roles: [Role.Staff, Role.Manager, Role.Admin, Role.SuperAdmin, Role.Developer] },
        { id: 'transactions', icon: FilePlus, label: 'ลงบันทึกประจำวัน', roles: [Role.Staff, Role.Manager, Role.Admin, Role.SuperAdmin, Role.Developer] },
      ]
    },
    {
      title: 'Organization',
      items: [
        { id: 'hq-dashboard', icon: PieChart, label: 'แดชบอร์ดรายงานรวม', roles: [Role.Manager, Role.Admin, Role.SuperAdmin, Role.Developer] },
        { id: 'analytics', icon: BarChart3, label: 'รายงานและสถิติ', roles: [Role.SuperAdmin, Role.Developer] },
        { id: 'team', icon: Users, label: 'จัดการทีมงาน', roles: [Role.Admin, Role.SuperAdmin, Role.Developer] },
      ]
    },
    {
      title: 'Enterprise',
      items: [
        { id: 'payroll', icon: CreditCard, label: 'ระบบเงินเดือน', roles: [Role.SuperAdmin, Role.Developer] },
        { id: 'settings', icon: Building2, label: 'ตั้งค่าบริษัท', roles: [Role.SuperAdmin, Role.Developer] },
        { id: 'rules', icon: Scale, label: 'กฎระเบียบบริษัท', roles: [Role.Staff, Role.Manager, Role.Admin, Role.SuperAdmin, Role.Developer] },
      ]
    },
    {
      title: 'System',
      items: [
        { id: 'learning', icon: BookOpen, label: 'ศูนย์การเรียนรู้', roles: [Role.Staff, Role.Manager, Role.Admin, Role.SuperAdmin, Role.Developer] },
        { id: 'audit', icon: HistoryIcon, label: 'ประวัติความเคลื่อนไหว', roles: [Role.Admin, Role.SuperAdmin, Role.Developer] },
        { id: 'help', icon: HelpCircle, label: 'ศูนย์ช่วยเหลือ', roles: [Role.Staff, Role.Manager, Role.Admin, Role.SuperAdmin, Role.Developer] },
      ]
    }
  ];

  const { getActiveAnnouncements } = useCompanyConfig();
  const activeAnnouncements = getActiveAnnouncements(currentUser);
  const hasAnnouncements = activeAnnouncements.length > 0;

  return (
    <aside className={cn(
      "hidden md:flex flex-col w-20 hover:w-72 group bg-sidebar-bg fixed h-full z-50 text-white shadow-2xl transition-all duration-500 ease-in-out",
      hasAnnouncements ? "top-9 h-[calc(100%-2.25rem)]" : "top-0 h-full"
    )}>
      <div className="p-6 mb-6 overflow-hidden">
        <div className="flex items-center gap-4 cursor-pointer min-w-[200px]">
          <div className="transition-transform duration-500 group-hover:rotate-3">
             <POCLogo size={40} />
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden whitespace-nowrap">
            <h1 className="text-xl font-semibold tracking-tight font-outfit uppercase text-white">Editor</h1>
            <p className="text-[9px] text-blue-100/60 font-medium tracking-[0.25em] font-noto -mt-0.5 uppercase">Command Center</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 pl-4 space-y-6 overflow-y-auto no-scrollbar scroll-smooth">
        {menuGroups.map((group, gIdx) => {
          const visibleItems = group.items.filter(item => item.roles.includes(currentUser.role));
          if (visibleItems.length === 0) return null;

          return (
            <div key={gIdx} className="space-y-1">
              <p className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[10px] font-medium text-blue-100/30 uppercase tracking-[0.2em] px-5 mb-2 h-4 overflow-hidden">
                {group.title}
              </p>
              {visibleItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-4 px-5 py-3.5 rounded-l-3xl font-medium transition-all duration-300 relative group/item overflow-visible text-[13px] font-noto",
                    currentTab === item.id
                      ? 'bg-[#fefefe] text-sidebar-bg shadow-[-4px_0_10_rgba(0,0,0,0.02)] font-bold'
                      : 'text-blue-100/70 hover:text-white hover:bg-white/10'
                  )}
                >
                  {currentTab === item.id && (
                    <>
                      <div className="absolute -top-6 right-0 w-6 h-6 bg-[#fefefe] before:absolute before:inset-0 before:bg-sidebar-bg before:rounded-br-[24px]"></div>
                      <div className="absolute -bottom-6 right-0 w-6 h-6 bg-[#fefefe] before:absolute before:inset-0 before:bg-sidebar-bg before:rounded-tr-[24px]"></div>
                    </>
                  )}
                  <item.icon size={19} className={cn("transition-colors flex-shrink-0", currentTab === item.id ? "text-sidebar-bg" : "group-hover/item:text-[#facc15]")} />
                  <span className="tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden whitespace-nowrap">{item.label}</span>
                </button>
              ))}
            </div>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/5 p-4 overflow-hidden">
        <div className="flex items-center justify-between px-2 py-4">
           <div className="flex items-center gap-4 text-white">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/10 shadow-lg">
                <span className="text-sm font-bold uppercase">{currentUser.name.charAt(0)}</span>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden whitespace-nowrap">
                <p className="text-sm font-bold truncate">{currentUser.name}</p>
                <p className="text-[10px] text-blue-100/60 font-medium truncate uppercase tracking-wider">{currentUser.role.replace('_', ' ')}</p>
              </div>
           </div>
           
           <button 
             onClick={logout}
             className="opacity-0 group-hover:opacity-100 p-2 hover:bg-rose-500/20 hover:text-rose-400 rounded-lg transition-all"
             title="Logout"
           >
              <Plus size={20} className="rotate-45" />
           </button>
        </div>
      </div>

      <div className="p-8 border-t border-white/5 opacity-30 overflow-hidden">
        <p className="text-[10px] font-noto tracking-widest text-blue-100/60 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">v2.3.2 • EDITOR MATRIX</p>
      </div>
    </aside>
  );
};

export const MobileHeader = () => (
  <header className="md:hidden bg-sidebar-bg p-5 sticky top-0 z-30 flex items-center gap-3 text-white border-b border-white/5">
    <POCLogo size={32} />
    <h1 className="text-lg font-bold font-outfit uppercase tracking-tight">Editor</h1>
  </header>
);

export const MobileBottomNav = ({ currentTab, setCurrentTab }: Omit<SidebarProps, ''>) => {
  const { user: currentUser } = useAuth();
  
  if (!currentUser) return null;

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'แดชบอร์ด', roles: [Role.Staff, Role.Manager, Role.Admin, Role.SuperAdmin, Role.Developer] },
    { id: 'transactions', icon: FilePlus, label: 'บันทึก', roles: [Role.Staff, Role.Manager, Role.Admin, Role.SuperAdmin, Role.Developer] },
    { id: 'setup', icon: SettingsIcon, label: 'จัดการ', roles: [Role.Staff, Role.Manager, Role.Admin, Role.SuperAdmin, Role.Developer] },
    { id: 'team', icon: Users, label: 'ทีม', roles: [Role.Admin, Role.SuperAdmin, Role.Developer] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <nav className="md:hidden fixed bottom-6 left-4 right-4 bg-sidebar-bg/95 backdrop-blur-md border border-white/10 flex justify-around p-3 z-50 rounded-[2rem] shadow-2xl shadow-black/40">
      {visibleItems.map(item => (
        <button
          key={item.id}
          onClick={() => setCurrentTab(item.id)}
          className={cn(
            "flex flex-col items-center px-4 py-2 rounded-2xl transition-all duration-300",
            currentTab === item.id ? 'text-white bg-white/10' : 'text-blue-100/40 hover:text-white'
          )}
        >
          <item.icon size={20} className={cn("mb-1 transition-transform", currentTab === item.id && "scale-110")} />
          <span className="text-[9px] font-bold font-noto uppercase tracking-wider">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};
