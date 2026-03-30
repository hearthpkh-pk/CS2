'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { PublicHoliday } from '@/types';
import { holidayService } from '@/services/holidayService';

interface MiniCalendarProps {
  holidays: PublicHoliday[];
  onSelectDate?: (date: Date) => void;
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({ holidays, onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤษจิกายน", "ธันวาคม"
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm font-prompt">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-tight">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear() + 543}
        </h4>
        <div className="flex items-center gap-1">
          <button 
            onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day, i) => (
          <div 
            key={day} 
            className={cn(
              "text-center text-[10px] font-bold uppercase tracking-widest pb-2",
              i === 0 ? "text-rose-400" : i === 6 ? "text-blue-400" : "text-slate-300"
            )}
          >
            {day}
          </div>
        ))}

        {calendarDays.map((day, i) => {
          const holiday = holidayService.getHoliday(day, holidays);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, monthStart);

          return (
            <div 
              key={day.toString()}
              onClick={() => onSelectDate?.(day)}
              className={cn(
                "h-10 flex flex-col items-center justify-center rounded-xl transition-all cursor-pointer relative group",
                !isCurrentMonth && "opacity-20",
                holiday ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "hover:bg-slate-50",
                isToday && !holiday && "border border-blue-200 text-blue-600 font-bold"
              )}
            >
              <span className="text-[11px] font-medium font-inter">{format(day, 'd')}</span>
              {holiday && (
                <div className="absolute -top-1 -right-1">
                   <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <Star size={8} className="text-blue-600 fill-blue-600" />
                   </div>
                </div>
              )}
              
              {/* Tooltip on Hover */}
              {holiday && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-white text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl font-medium uppercase tracking-widest">
                  {holiday.name} ({holiday.multiplier}X)
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
