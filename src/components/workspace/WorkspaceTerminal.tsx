'use client';

import React, { useState } from 'react';
import { User, Page, Role } from '@/types';
import { CalendarIcon, LayoutDashboard, VideoIcon, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

import { DailyTaskView } from './DailyTaskView';
import { CalendarView } from './CalendarView';
import { LeaveRequestModal } from './calendar/LeaveRequestModal';
import { useCalendarLogic } from '@/hooks/useCalendarLogic';
import { Plus } from 'lucide-react';

interface WorkspaceTerminalProps {
  currentUser: User;
  pages: Page[];
}

type TabType = 'daily' | 'calendar';

export const WorkspaceTerminal: React.FC<WorkspaceTerminalProps> = ({ currentUser, pages }) => {
  const [activeTab, setActiveTab] = useState<TabType>(currentUser.role === Role.SuperAdmin ? 'calendar' : 'daily');
  
  // Quick Leave States
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');
  
  // Use logic just for quick record
  const { recordLeave } = useCalendarLogic(currentUser);

  const handleQuickLeave = () => {
    recordLeave(new Date(), 'Sick', leaveReason);
    setShowLeaveModal(false);
    setLeaveReason('');
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 pb-10 flex flex-col gap-6 animate-in fade-in duration-700">

      {/* 🏛️ UNIFIED MASTER HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pt-4 pb-6 gap-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-[#0f172a] font-outfit uppercase tracking-tight leading-none">
              WORKSPACE TERMINAL
            </h2>
          </div>
          <p className="text-slate-400 font-noto text-[11px] mt-1.5 flex items-center gap-2">
            พื้นที่ทำงานส่วนบุคคลและตารางปฏิบัติการ • <span className="text-[var(--primary-theme)] font-bold">{currentUser.department || 'General Operation'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* ⚡ QUICK LEAVE BUTTON */}
          <button 
             onClick={() => setShowLeaveModal(true)}
             className="h-10 px-4 flex items-center justify-center gap-2 rounded-2xl bg-white text-slate-500 hover:text-[var(--primary-theme)] hover:bg-blue-50 transition-all border border-slate-200 hover:border-blue-100 shadow-sm active:scale-95 group"
             title="แจ้งลางานด่วน (Quick Leave)"
          >
            <Plus size={16} className="transition-transform group-hover:scale-110" />
            <span className="text-xs font-bold font-noto tracking-wider pt-0.5">ลางาน</span>
          </button>

          {/* 🎛️ MINIMAL ROUNDED TOGGLE (Matches FB Page Setup) */}
          <div className="relative flex bg-gradient-to-br from-[var(--primary-theme)] to-[var(--primary-theme-hover)] p-1 rounded-2xl shadow-lg border border-white/10 overflow-hidden shrink-0">
            {/* Animated White Pill */}
            <div
              className={cn(
                "absolute top-1 bottom-1 w-[40px] bg-white rounded-xl shadow-md transition-all duration-300 ease-in-out",
                activeTab === 'daily' ? "left-1" : "left-[43px]"
              )}
            />
            <button
              onClick={() => setActiveTab('daily')}
              className={cn(
                "relative z-10 w-[40px] h-[32px] flex items-center justify-center rounded-xl transition-all duration-300",
                activeTab === 'daily' ? "text-[var(--primary-theme)]" : "text-white/70 hover:text-white"
              )}
              title="Daily Submit"
            >
              <VideoIcon size={16} />
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={cn(
                "relative z-10 w-[40px] h-[32px] flex items-center justify-center rounded-xl transition-all duration-300",
                activeTab === 'calendar' ? "text-[var(--primary-theme)]" : "text-white/70 hover:text-white"
              )}
              title="Calendar Log"
            >
              <CalendarIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 🔄 TAB CONTENT AREA */}
      <div className="relative w-full h-full">
        {activeTab === 'daily' ? (
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
            {/* 🛡️ Inject specific prop subset if needed, else pass through */}
            <DailyTaskView currentUser={currentUser} pages={pages} />
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
            <CalendarView currentUser={currentUser} />
          </div>
        )}
      </div>
      
      {/* QUICK LEAVE MODAL */}
      <LeaveRequestModal
        isOpen={showLeaveModal}
        onClose={() => {
          setShowLeaveModal(false);
          setLeaveReason('');
        }}
        selectedDate={new Date()}
        leaveReason={leaveReason}
        setLeaveReason={setLeaveReason}
        onConfirm={handleQuickLeave}
      />
    </div>
  );
};
