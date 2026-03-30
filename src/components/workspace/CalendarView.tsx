'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search,
  Filter,
  MoreHorizontal,
  Info,
  CheckCircle2,
  Circle,
  Trash2,
  User as UserIcon,
  Bell,
  Star,
  Zap,
  Edit3,
  MessageSquare
} from 'lucide-react';
import { User, Role, PersonalTask, LeaveRequest } from '@/types';
import { useCalendarLogic } from '@/hooks/useCalendarLogic';
import { holidayService } from '@/services/holidayService';
import { cn } from '@/lib/utils';
import { 
  format, 
  isSameMonth, 
  isSameDay, 
  isToday 
} from 'date-fns';

interface CalendarViewProps {
  currentUser: User;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ currentUser }) => {
  const {
    // Calendar navigation
    viewDate,
    selectedDate,
    setSelectedDate,
    prevMonth,
    nextMonth,
    goToToday,

    // Calendar grid data
    calendarDays,
    monthStart,
    weekDayNamesThai,
    selectedHoliday,
    monthHolidays,
    config,

    // Task operations
    tasks,
    newTaskTitle,
    setNewTaskTitle,
    addTask,
    toggleTask,
    deleteTask,
    isTaskOnDay,

    // Leave operations
    recordLeave,
    getLeaveForDay,
  } = useCalendarLogic(currentUser);

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');

  // --- Render Helpers ---
  const renderHeader = () => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pt-4 pb-6 mb-6 gap-6 transition-all duration-500">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-[#0f172a] font-outfit uppercase tracking-tight leading-none">
            CALENDAR & LEAVE
          </h2>
        </div>
        <p className="text-slate-400 font-noto text-[11px] mt-1.5 flex items-center gap-2 uppercase tracking-[0.2em]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-theme)] animate-pulse"></span>
          ตารางงานและระบบขอลางานออนไลน์ • <span className="text-[var(--primary-theme)] font-bold">Premium Workspace</span>
        </p>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 pb-10 flex flex-col gap-8 animate-in fade-in duration-1000 min-h-screen">
      
      {/* 🏛️ STANDARDIZED PAGE HEADER (RULE 5) */}
      {renderHeader()}

      <div className="flex flex-col xl:flex-row gap-8">
        
        {/* 📅 LEFT PANE: Balanced Calendar Center (70%) */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col relative transition-all">
            
            {/* 📍 PROXIMITY UX CONTROLS (Month Nav & Action) */}
            <div className="px-8 py-6 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6 bg-[#fcfcfd]/50">
               <div className="flex-1 hidden sm:block">
                  <h3 className="text-lg font-bold font-outfit uppercase tracking-tight text-slate-800">
                     {format(viewDate, 'yyyy')} Agenda
                  </h3>
               </div>
               
               <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                 <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm h-11 flex-1 sm:flex-none justify-between">
                    <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all active:scale-90 shrink-0">
                      <ChevronLeft size={18} />
                    </button>
                    <button 
                      onClick={goToToday}
                      className="px-4 md:px-6 font-bold text-slate-800 text-sm min-w-[120px] md:min-w-[140px] text-center font-outfit uppercase tracking-tighter hover:text-[var(--primary-theme)] transition-colors"
                    >
                      {format(viewDate, 'MMMM yyyy')}
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all active:scale-90 shrink-0">
                      <ChevronRight size={18} />
                    </button>
                 </div>

                 <button 
                  onClick={() => setShowLeaveModal(true)}
                  className="flex items-center gap-2 bg-[var(--primary-theme)] hover:bg-[#1e40af] text-white px-5 py-2.5 rounded-2xl font-bold font-noto text-sm transition-all shadow-lg shadow-blue-100/50 active:scale-95 shrink-0 whitespace-nowrap"
                 >
                   <Plus size={18} />
                   <span className="hidden sm:inline">ขอลางาน</span>
                 </button>
               </div>
            </div>

            {/* Weekday Labels (Minimalist) */}
            <div className="grid grid-cols-7 border-b border-slate-50/50">
              {weekDayNamesThai.map((day, i) => (
                <div key={day} className="py-5 text-center">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-[0.25em] font-noto",
                    i === 0 ? "text-rose-400" : i === 6 ? "text-blue-400" : "text-slate-300"
                  )}>{day}</span>
                </div>
              ))}
            </div>

            {/* Date Grid (Balanced WOW - Restoration) */}
            <div className="grid grid-cols-7 auto-rows-fr">
              {calendarDays.map((day, i) => {
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isTodayDate = isToday(day);
                const isSelected = isSameDay(day, selectedDate);
                const holiday = holidayService.getHoliday(day, config.holidays);
                const dayOfWeek = day.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                return (
                  <button 
                    key={day.toString()}
                    onClick={() => setSelectedDate(day)}
                    onDoubleClick={() => setShowLeaveModal(true)}
                    className={cn(
                      "relative border-r border-b border-slate-50 last:border-r-0 group transition-all duration-300 outline-none flex flex-col p-4 text-left min-h-[110px]",
                      !isCurrentMonth ? "bg-slate-50/20 opacity-30" : "bg-white hover:bg-slate-50/50"
                    )}
                  >
                    {/* Date circle logic (Restored) */}
                    <div className="flex justify-between items-start mb-2 relative z-10 w-full">
                        <div className={cn(
                          "w-10 h-10 flex items-center justify-center rounded-full text-base font-outfit font-bold transition-all duration-500",
                          isTodayDate 
                            ? "bg-[var(--primary-theme)] text-white shadow-lg shadow-blue-500/30" 
                            : isSelected ? "bg-blue-50 text-[var(--primary-theme)] ring-2 ring-[var(--primary-theme)]/20"
                            : "text-slate-400 group-hover:text-slate-900 group-hover:scale-110"
                        )}>
                          {format(day, 'd')}
                        </div>
                    </div>

                    {/* Data Indicator (Dark Badge only - no dots) */}
                    <div className="mt-auto relative z-10 space-y-1">
                       {holiday && isCurrentMonth && (
                         <div className="bg-rose-600 px-2 py-1 rounded-md">
                            <p className="text-[10px] text-white font-noto truncate">{holiday.name}</p>
                         </div>
                       )}
                       {(() => {
                         const leave = getLeaveForDay(day);
                         return leave && isCurrentMonth ? (
                           <div className={cn(
                             "px-2 py-1 rounded-md",
                             leave.status === 'Acknowledged' ? "bg-blue-600" : "bg-amber-500"
                           )}>
                             <p className="text-[10px] text-white font-noto truncate">
                               {leave.status === 'Acknowledged' ? 'รับทราบแล้ว' : 'แจ้งลาแล้ว'}
                             </p>
                           </div>
                         ) : null;
                       })()}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 📋 RIGHT PANE: Unified Agenda & Tasks */}
        <div className="w-full xl:w-[400px] flex flex-col">
          
          {/* 🗓️ UNIFIED MASTER CARD */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 flex flex-col overflow-hidden transition-all duration-500">
            
            {/* ── Card Header ── */}
            <div className="px-8 pt-8 pb-6 border-b border-slate-50">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-outfit uppercase tracking-tight text-slate-900 leading-none">Agenda</h3>
                  <p className="text-xs text-slate-400 mt-1 font-noto">
                    {format(selectedDate, 'EEEE, d MMM yyyy')}
                  </p>
                </div>
                <span className="text-xs text-slate-500">
                  {tasks.filter(t => !t.completed).length} pending
                </span>
              </div>

              {/* Holiday Alert for selected date */}
              {selectedHoliday && (
                <div className="bg-rose-600 rounded-2xl px-5 py-3 flex items-center gap-3">
                  <div>
                    <p className="text-[10px] text-rose-200 uppercase tracking-wider leading-none">Public Holiday</p>
                    <p className="text-sm text-white font-noto leading-tight mt-0.5">{selectedHoliday.name}</p>
                  </div>
                </div>
              )}

              {/* Add task input — task is created without date by default (general task) */}
              <form onSubmit={(e) => {
                e.preventDefault();
                addTask(newTaskTitle);
                setNewTaskTitle('');
              }} className={cn("flex gap-2", selectedHoliday ? "mt-4" : "mt-0")}>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="เพิ่มงาน..."
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-noto outline-none focus:ring-2 focus:ring-[var(--primary-theme)]/20 transition-all placeholder:text-slate-300"
                />
                <button type="submit" className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-black transition-all active:scale-95">
                  <Plus size={18} />
                </button>
              </form>
            </div>

            {/* ── Scrollable body ── */}
            <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-slate-50">

              {/* ── Section 1: Daily Plan (tasks that fall on selectedDate) ── */}
              <div className="px-8 py-5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-4 font-noto">
                  วันที่เลือก — {format(selectedDate, 'MMM d')}
                </p>
                {tasks.filter(t => isTaskOnDay(t, selectedDate)).length === 0 ? (
                  <p className="text-sm text-slate-300 font-noto py-2">ไม่มีงานสำหรับวันนี้</p>
                ) : (
                  <div className="space-y-1">
                    {tasks.filter(t => isTaskOnDay(t, selectedDate)).map(task => (
                      <div key={task.id} className="group flex items-center gap-3 py-2">
                        <button onClick={() => toggleTask(task.id)} className="shrink-0">
                          {task.completed
                            ? <div className="bg-green-500 text-white rounded-full p-1"><CheckCircle2 size={14} /></div>
                            : <Circle size={20} className="text-slate-300 group-hover:text-[var(--primary-theme)] transition-colors" />}
                        </button>
                        <span className={cn("flex-1 text-sm font-noto", task.completed ? "line-through text-slate-300" : "text-slate-600")}>
                          {task.title}
                          {task.startDate && (
                            <span className="block text-[11px] text-slate-400 font-outfit mt-0.5">
                              {format(new Date(task.startDate), 'MMM d')}
                              {task.endDate && ` — ${format(new Date(task.endDate), 'MMM d')}`}
                            </span>
                          )}
                        </span>
                        <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-rose-300 hover:text-rose-500 transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Section 2: All Tasks ── */}
              <div className="px-8 py-5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-4 font-noto">งานทั้งหมด</p>
                {tasks.length === 0 ? (
                  <p className="text-sm text-slate-300 font-noto py-2">ยังไม่มีงาน</p>
                ) : (
                  <div className="space-y-1">
                    {tasks.map(task => (
                      <div key={task.id} className="group flex items-center gap-3 py-2">
                        <button onClick={() => toggleTask(task.id)} className="shrink-0">
                          {task.completed
                            ? <div className="bg-green-500 text-white rounded-full p-1"><CheckCircle2 size={14} /></div>
                            : <Circle size={20} className="text-slate-300 group-hover:text-[var(--primary-theme)] transition-colors" />}
                        </button>
                        <span className={cn("flex-1 font-noto text-sm", task.completed ? "line-through text-slate-300" : "text-slate-600")}>
                          {task.title}
                          {!task.completed && task.startDate ? (
                            <span className="block text-[11px] text-slate-400 font-outfit mt-0.5">
                              {format(new Date(task.startDate), 'MMM d')}
                              {task.endDate && ` — ${format(new Date(task.endDate), 'MMM d')}`}
                            </span>
                          ) : !task.completed ? (
                            <span className="block text-[11px] text-slate-400 font-outfit mt-0.5">ไม่ระบุวัน</span>
                          ) : null}
                        </span>
                        <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-rose-300 hover:text-rose-500 transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Section 3: This Month's Holidays ── */}
              <div className="px-8 py-5">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-4 font-noto">
                  วันหยุด — {format(viewDate, 'MMMM yyyy')}
                </p>
                {monthHolidays.length === 0 ? (
                  <p className="text-sm text-slate-300 font-noto py-2">ไม่มีวันหยุดในเดือนนี้</p>
                ) : (
                  <div className="space-y-1">
                    {monthHolidays.map(h => {
                      const hDate = new Date(h.isRecurring
                        ? `${viewDate.getFullYear()}-${h.date}`
                        : h.date
                      );
                      return (
                        <div key={h.id} className="flex items-center gap-3 py-2">
                          <div className="bg-rose-600 text-white rounded-lg px-2.5 py-1 text-xs font-outfit tabular-nums shrink-0">
                            {format(hDate, 'dd')}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-slate-600 font-noto leading-tight">{h.name}</span>
                            <span className="text-[11px] text-slate-400 font-outfit">
                              {format(hDate, 'EEEE')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Leave Request Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowLeaveModal(false)} />
           <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
              
              {/* Header — date is the hero */}
              <div className="p-8 pb-6 text-center border-b border-slate-50">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-noto mb-2">ขอลางานวันที่</p>
                <h3 className="text-3xl font-outfit text-slate-900 tracking-tight leading-none">
                  {format(selectedDate, 'd MMMM yyyy')}
                </h3>
                <p className="text-sm text-slate-400 font-noto mt-1">
                  {format(selectedDate, 'EEEE')}
                </p>
              </div>

              {/* Body — reason is optional */}
              <div className="p-6">
                <label className="text-xs text-slate-400 font-noto">หมายเหตุ <span className="text-slate-300">(ไม่จำเป็น)</span></label>
                <textarea 
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="เช่น ไม่สบาย, ธุระส่วนตัว..."
                  rows={2}
                  className="w-full mt-2 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-noto outline-none focus:ring-2 focus:ring-[var(--primary-theme)]/20 transition-all resize-none placeholder:text-slate-300"
                />
              </div>

              {/* Footer */}
              <div className="p-6 bg-slate-50/50 flex gap-3">
                <button 
                  onClick={() => setShowLeaveModal(false)} 
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-noto transition-all active:scale-95 text-sm"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={() => {
                    recordLeave(leaveReason, selectedDate);
                    setShowLeaveModal(false);
                    setLeaveReason('');
                  }} 
                  className="flex-[2] py-3.5 bg-[var(--primary-theme)] hover:bg-[#1e40af] text-white rounded-2xl font-noto transition-all shadow-lg active:scale-95 text-sm"
                >
                  ยืนยันการลา
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
