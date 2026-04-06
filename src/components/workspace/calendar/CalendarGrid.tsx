'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, isSameMonth, isSameDay, isToday } from 'date-fns';
import { LeaveRequest, PersonalTask } from '@/types';
import { cn } from '@/lib/utils';
// Note: We expect holidayService to be accessible or passed as config
import { holidayService } from '@/services/holidayService';

interface CalendarGridProps {
  viewDate: Date;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  prevMonth: () => void;
  nextMonth: () => void;
  goToToday: () => void;
  calendarDays: Date[];
  monthStart: Date;
  weekDayNamesThai: string[];
  config: any; // Using any for simplicity now, should match CompanyConfig
  getLeavesForDay: (day: Date) => LeaveRequest[];
  onAddLeaveClick: () => void;
  tasks: PersonalTask[];
  isTaskOnDay: (task: PersonalTask, day: Date) => boolean;
  onTaskClick: (task: PersonalTask) => void;
  onTaskDrop: (taskId: string, newDate: Date) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  viewDate,
  selectedDate,
  setSelectedDate,
  prevMonth,
  nextMonth,
  goToToday,
  calendarDays,
  monthStart,
  weekDayNamesThai,
  config,
  getLeavesForDay,
  onAddLeaveClick,
  tasks,
  isTaskOnDay,
  onTaskClick,
  onTaskDrop,
}) => {
  const [draggedOverDate, setDraggedOverDate] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent, day: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const dayStr = day.toISOString();
    if (draggedOverDate !== dayStr) {
      setDraggedOverDate(dayStr);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOverDate(null);
  };

  const handleDrop = (e: React.DragEvent, day: Date) => {
    e.preventDefault();
    setDraggedOverDate(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.type === 'TASK' && data.id) {
        onTaskDrop(data.id, day);
      }
    } catch(err) {
      // ignore
    }
  };

  const handleDragStartTask = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'TASK', id: taskId }));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="bg-white text-slate-900 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col relative transition-all xl:h-[calc(100vh-200px)]">
      {/* 📍 PROXIMITY UX CONTROLS (Month Nav & Action) */}
      <div className="px-8 py-6 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6 bg-[#fcfcfd]/50 shrink-0">
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
            onClick={onAddLeaveClick}
            className="flex items-center gap-2 bg-[var(--primary-theme)] hover:bg-[#1e40af] text-white px-5 py-2.5 rounded-2xl font-bold font-noto text-sm transition-all shadow-lg shadow-blue-100/50 active:scale-95 shrink-0 whitespace-nowrap"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">ขอลางาน</span>
          </button>
        </div>
      </div>

      {/* Weekday Labels (Minimalist) */}
      <div className="grid grid-cols-7 border-b border-slate-50/50 shrink-0 hidden md:grid">
        {weekDayNamesThai.map((day, i) => (
          <div key={day} className="py-4 xl:py-5 text-center">
            <span className={cn(
              "text-[10px] font-black uppercase tracking-[0.25em] font-noto",
              i === 0 ? "text-rose-400" : i === 6 ? "text-blue-400" : "text-slate-300"
            )}>{day}</span>
          </div>
        ))}
      </div>

      {/* Date Grid */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr overflow-y-auto min-h-[500px] xl:min-h-0">
        {calendarDays.map((day) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isTodayDate = isToday(day);
          const isSelected = isSameDay(day, selectedDate);
          const holiday = holidayService.getHoliday(day, config.holidays);
          
          return (
            <button 
              key={day.toString()}
              onClick={() => setSelectedDate(day)}
              onDoubleClick={onAddLeaveClick}
              onDragOver={(e) => handleDragOver(e, day)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, day)}
              className={cn(
                "relative border-r border-b border-slate-50 last:border-r-0 group transition-all duration-300 outline-none flex flex-col p-2 xl:p-4 text-left min-h-[100px] xl:min-h-0 h-full overflow-hidden",
                !isCurrentMonth ? "bg-slate-50/20 opacity-30" : "bg-white hover:bg-slate-50/50",
                draggedOverDate === day.toISOString() && isCurrentMonth ? "bg-blue-50/40 ring-2 ring-inset ring-[var(--primary-theme)]/30" : ""
              )}
            >
              {/* Date circle */}
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

              {/* Data Indicator (Badge) */}
              <div className="mt-auto relative z-10 space-y-1 w-full overflow-hidden">
                 {holiday && isCurrentMonth && (
                   <div className="bg-rose-600 px-2 py-1 rounded-md max-w-full">
                      <p className="text-[10px] text-white font-noto truncate">{holiday.name}</p>
                   </div>
                 )}
                 {(() => {
                   const dayLeaves = getLeavesForDay(day);
                   if (!isCurrentMonth || dayLeaves.length === 0) return null;
                   return dayLeaves.map(leave => (
                     <div key={leave.id} className={cn(
                       "px-2 py-1 rounded-md max-w-full",
                       leave.status === 'Cancelled' ? "bg-slate-400" : "bg-amber-500"
                     )}>
                       <p className="text-[10px] text-white font-noto truncate">
                         {leave.staffName} • {leave.status === 'Cancelled' ? 'ยกเลิก' : 'ลางาน'}
                       </p>
                     </div>
                   ));
                 })()}

                 {/* Tasks Indicator */}
                 {(() => {
                   if (!isCurrentMonth) return null;
                   const dayTasks = tasks.filter(t => isTaskOnDay(t, day));
                   return dayTasks.map(task => (
                     <div 
                       key={task.id} 
                       onClick={(e) => { e.stopPropagation(); onTaskClick(task); }}
                       draggable
                       onDragStart={(e) => { e.stopPropagation(); handleDragStartTask(e, task.id); }}
                       className={cn(
                         "px-2 py-0.5 rounded-md max-w-full text-left truncate cursor-grab active:cursor-grabbing hover:opacity-80 transition-opacity mt-1",
                         task.completed ? "bg-slate-100 line-through text-slate-400" : "bg-[var(--primary-theme)]/10 text-[var(--primary-theme)] border border-[var(--primary-theme)]/20"
                       )}
                     >
                       <p className="text-[10px] font-noto truncate font-medium leading-tight">{task.title}</p>
                     </div>
                   ));
                 })()}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
