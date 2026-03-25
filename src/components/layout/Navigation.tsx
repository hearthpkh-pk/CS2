'use client';

import React from 'react';
import {
  Plus, Users, LayoutDashboard, FilePlus,
  CreditCard, Activity, BarChart3,
  Building2, Calendar as CalendarIcon,
  Video as VideoIcon, Settings as SettingsIcon,
  History as HistoryIcon, HelpCircle,
  PieChart, ChevronRight, Scale, BookOpen
} from 'lucide-react';
import { initialUsers } from '@/services/mockData';
import { User } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
}

export const Sidebar = ({ currentTab, setCurrentTab, currentUser, setCurrentUser }: SidebarProps) => {
  const menuGroups = [
    {
      title: 'Workspace',
      items: [
        { id: 'dashboard', icon: LayoutDashboard, label: 'แดชบอร์ดสรุปผล', roles: ['Staff', 'Manager', 'Admin', 'Super Admin'] },
        { id: 'calendar', icon: CalendarIcon, label: 'ปฏิทินงาน', roles: ['Staff', 'Manager', 'Admin', 'Super Admin'] },
        { id: 'daily-task', icon: VideoIcon, label: 'ส่งงานรายวัน', roles: ['Staff', 'Manager', 'Admin', 'Super Admin'] },
        { id: 'setup', icon: SettingsIcon, label: 'จัดการเพจและบัญชี', roles: ['Staff', 'Manager', 'Admin', 'Super Admin'] },
        { id: 'transactions', icon: FilePlus, label: 'ลงบันทึกประจำวัน', roles: ['Staff', 'Manager', 'Admin', 'Super Admin'] },
      ]
    },
    {
      title: 'Organization',
      items: [
        { id: 'hq-dashboard', icon: PieChart, label: 'แดชบอร์ดรายงานรวม', roles: ['Manager', 'Admin', 'Super Admin'] },
        { id: 'team', icon: Users, label: 'จัดการทีมงาน', roles: ['Admin', 'Super Admin'] },
      ]
    },
    {
      title: 'Enterprise',
      items: [
        { id: 'payroll', icon: CreditCard, label: 'ระบบเงินเดือน', roles: ['Super Admin'] },
        { id: 'analytics', icon: BarChart3, label: 'รายงานและสถิติ', roles: ['Admin', 'Super Admin'] },
        { id: 'settings', icon: Building2, label: 'ตั้งค่าบริษัท', roles: ['Super Admin'] },
        { id: 'rules', icon: Scale, label: 'กฎระเบียบบริษัท', roles: ['Staff', 'Manager', 'Admin', 'Super Admin'] },
      ]
    },
    {
      title: 'System',
      items: [
        { id: 'learning', icon: BookOpen, label: 'ศูนย์การเรียนรู้', roles: ['Staff', 'Manager', 'Admin', 'Super Admin'] },
        { id: 'audit', icon: HistoryIcon, label: 'ประวัติความเคลื่อนไหว', roles: ['Admin', 'Super Admin'] },
        { id: 'help', icon: HelpCircle, label: 'ศูนย์ช่วยเหลือ', roles: ['Staff', 'Manager', 'Admin', 'Super Admin'] },
      ]
    }
  ];

  return (
    <aside className="hidden md:flex flex-col w-20 hover:w-72 group bg-sidebar-bg fixed h-full z-50 text-white shadow-2xl transition-all duration-500 ease-in-out">
      <div className="p-6 mb-6 overflow-hidden">
        <div className="flex items-center gap-4 cursor-pointer min-w-[200px]">
          <div className="p-2.5 bg-white rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-transform flex-shrink-0">
            <Activity size={24} className="text-sidebar-bg" />
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden whitespace-nowrap">
            <h1 className="text-xl font-bold tracking-tight font-outfit uppercase text-white">CreatorSpace</h1>
            <p className="text-[9px] text-blue-100/60 font-bold tracking-[0.25em] font-noto -mt-0.5 uppercase">Enterprise Matrix</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 pl-4 space-y-6 overflow-y-auto no-scrollbar scroll-smooth">
        {menuGroups.map((group, gIdx) => {
          const visibleItems = group.items.filter(item => item.roles.includes(currentUser.role));
          if (visibleItems.length === 0) return null;

          return (
            <div key={gIdx} className="space-y-1">
              <p className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[10px] font-bold text-blue-100/30 uppercase tracking-[0.2em] px-5 mb-2 h-4 overflow-hidden">
                {group.title}
              </p>
              {visibleItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-4 px-5 py-3.5 rounded-l-3xl font-semibold transition-all duration-300 relative group/item overflow-visible text-[13px] font-noto",
                    currentTab === item.id
                      ? 'bg-[#fefefe] text-sidebar-bg shadow-[-4px_0_10_rgba(0,0,0,0.02)]'
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

      {/* Role Switcher Section (Simulation) */}
      <div className="mt-auto border-t border-white/5 p-4 overflow-hidden">
        <div className="px-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-[10px] font-bold text-blue-100/40 uppercase tracking-widest mb-3">Switch Role (Dev)</p>
          <div className="space-y-1.5">
            {initialUsers.map(user => (
              <button
                key={user.id}
                onClick={() => setCurrentUser(user)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[11px] transition-all duration-200",
                  currentUser.id === user.id
                    ? "bg-white/20 text-white shadow-lg border border-white/10"
                    : "text-blue-100/40 hover:bg-white/5 hover:text-white"
                )}
              >
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  user.role === 'Super Admin' ? "bg-blue-600" :
                    user.role === 'Admin' ? "bg-blue-400" :
                      user.role === 'Manager' ? "bg-emerald-400" : "bg-slate-400"
                )} />
                <span className="truncate">{user.name}</span>
                {currentUser.id === user.id && <ChevronRight size={12} className="ml-auto" />}
              </button>
            ))}
          </div>
        </div>

        {/* Current User Info */}
        <div className="flex items-center gap-4 px-2 py-4">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/10">
            <span className="text-sm font-bold text-white uppercase">{currentUser.name.charAt(0)}</span>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden whitespace-nowrap">
            <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
            <p className="text-[10px] text-blue-100/60 font-medium truncate uppercase tracking-wider">{currentUser.role}</p>
          </div>
        </div>
      </div>

      <div className="p-8 border-t border-white/5 opacity-40 overflow-hidden">
        <p className="text-[10px] font-noto text-blue-100/60 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">v1.2.0 • Enterprise Edition</p>
      </div>
    </aside>
  );
};

export const MobileHeader = () => (
  <header className="md:hidden bg-sidebar-bg p-5 sticky top-0 z-30 flex items-center gap-3 text-white border-b border-white/5">
    <div className="p-1.5 bg-white rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.1)]">
      <Activity size={18} className="text-sidebar-bg" />
    </div>
    <h1 className="text-lg font-bold font-outfit uppercase tracking-tight">CreatorSpace</h1>
  </header>
);

export const MobileBottomNav = ({ currentTab, setCurrentTab, currentUser }: Omit<SidebarProps, 'setCurrentUser'>) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'แดชบอร์ด', roles: ['Staff', 'Manager', 'Admin', 'Super Admin'] },
    { id: 'transactions', icon: FilePlus, label: 'บันทึก', roles: ['Staff', 'Manager', 'Admin', 'Super Admin'] },
    { id: 'setup', icon: SettingsIcon, label: 'จัดการ', roles: ['Staff', 'Manager', 'Admin', 'Super Admin'] },
    { id: 'team', icon: Users, label: 'ทีม', roles: ['Admin', 'Super Admin'] },
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
