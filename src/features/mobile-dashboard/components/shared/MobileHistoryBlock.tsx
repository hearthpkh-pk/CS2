import React from 'react';
import { cn } from '@/lib/utils';

export const MobileHistoryBlock = ({ day, status, isToday = false }: { day: string, status: string, isToday?: boolean }) => {
  return (
    <div className="flex flex-col items-center justify-end gap-1 w-5 opacity-90 transition-all hover:opacity-100">
      <span className={cn(
        "text-[7.5px] font-bold font-outfit uppercase tracking-tighter leading-none mb-0.5", 
        isToday ? "text-slate-900" : "text-slate-400"
      )}>
        {day}
      </span>
      {status === 'completed' && <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />}
      {status === 'risk' && <div className="w-1.5 h-1.5 rounded-full bg-rose-600" />}
      {status === 'in-progress' && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
      {status === 'pending' && <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />}
    </div>
  );
};
