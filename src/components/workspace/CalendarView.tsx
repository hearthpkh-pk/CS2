'use client';

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  LayoutGrid,
  CalendarDays,
  Target,
  Sparkles,
  Info
} from 'lucide-react';
import { User, Role, LeaveRequest, CalendarEvent } from '@/types';
import { initialLeaveRequests, initialCalendarEvents } from '@/services/mockData';
import { useCompanyConfig } from '@/features/company/hooks/useCompanyConfig';
import { holidayService } from '@/services/holidayService';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface CalendarViewProps {
  currentUser: User;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ currentUser }) => {
  const { config } = useCompanyConfig();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // Month Navigator Logic
  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 pb-10 flex flex-col gap-8 animate-in fade-in duration-700">
      
      {/* 🏛️ STANDARDIZED PAGE HEADER (Mode 1: Golden Rules) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pt-4 pb-6 mb-2 gap-6 transition-all duration-500">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-[#0f172a] font-outfit uppercase tracking-tight leading-none">
              CALENDAR & LEAVE
            </h2>
          </div>
          <p className="text-slate-400 font-noto text-[11px] mt-1.5 flex items-center gap-2 uppercase tracking-[0.2em]">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            ตารางงานและระบบจดแจ้งวันลาออนไลน์ • <span className="text-blue-600 font-bold">Workspace</span>
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
           <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm h-11">
             <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all"><ChevronLeft size={16} /></button>
             <span className="px-4 font-bold text-slate-700 text-sm min-w-[120px] text-center font-noto">
               {monthNames[currentDate.getMonth()]} {currentDate.getFullYear() + 543}
             </span>
             <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all"><ChevronRight size={16} /></button>
           </div>
           
           <button 
             onClick={() => setShowLeaveModal(true)}
             className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl font-bold font-noto text-sm transition-all shadow-lg shadow-blue-100/50 active:scale-95"
           >
             <Plus size={18} />
             <span>จดแจ้งวันลา</span>
           </button>
        </div>
      </div>

      {/* 🧩 CLEAN WORKSPACE (Ready for Reconstruction) */}
      <div className="flex-1 bg-white/40 rounded-[3rem] border border-dashed border-slate-200 p-20 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-20 h-20 rounded-[2rem] bg-slate-100 flex items-center justify-center text-slate-300">
             <CalendarIcon size={40} />
          </div>
          <div className="space-y-1">
             <h3 className="text-lg font-bold text-slate-400 font-outfit uppercase tracking-widest">Ready for Design Matrix</h3>
             <p className="text-xs text-slate-300 font-noto">เราจะเริ่มวางโครงสร้างส่วนของ Calendar & Tasks ใหม่จากจุดนี้ครับ</p>
          </div>
      </div>

    </div>
  );
};
