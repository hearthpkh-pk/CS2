'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  Trash2, 
  Plus, 
  Clock, 
  Star,
  Settings2,
  CalendarDays,
  Target,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PublicHoliday } from '@/types';
import { useCompanyConfig } from '../../hooks/useCompanyConfig';
import { MiniCalendar } from '@/components/common/MiniCalendar';
import { format } from 'date-fns';
import { ConfirmationModal } from '@/components/kanban/ConfirmationModal';

export const HolidayManager: React.FC = () => {
  const { config, saveHoliday, deleteHoliday } = useCompanyConfig();
  const [isAdding, setIsAdding] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<string | null>(null);
  const [newHoliday, setNewHoliday] = useState<Partial<PublicHoliday>>({
    name: '',
    date: '',
    multiplier: 2.0,
    isRecurring: true
  });

  const handleSave = async () => {
    if (!newHoliday.name || !newHoliday.date) return;
    
    const holiday: PublicHoliday = {
      id: `h-${Date.now()}`,
      name: newHoliday.name,
      date: newHoliday.date,
      multiplier: newHoliday.multiplier || 2.0,
      isRecurring: !!newHoliday.isRecurring
    };

    await saveHoliday(holiday);
    setIsAdding(false);
    setNewHoliday({ name: '', date: '', multiplier: 2.0, isRecurring: true });
  };

  const confirmDelete = async () => {
    if (holidayToDelete) {
      await deleteHoliday(holidayToDelete);
      setHolidayToDelete(null);
    }
  };

  const onSelectDateFromCalendar = (date: Date) => {
    const mmdd = format(date, 'MM-dd');
    setNewHoliday({ ...newHoliday, date: mmdd });
    setIsAdding(true);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 font-prompt">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Calendar & Policy Visualization */}
        <div className="xl:col-span-5 space-y-6 lg:sticky lg:top-8">
           <div className="space-y-1.5 px-2 mb-4">
              <h3 className="text-xl font-semibold text-slate-800 font-outfit uppercase tracking-tight">The Holiday Matrix</h3>
              <p className="text-slate-400 text-xs font-noto tracking-tight leading-relaxed">
                ภาพรวมปฏิทินวันหยุดและจุดยุทธศาสตร์ค่าแรงพิเศษประจำปี
              </p>
           </div>
           
           <MiniCalendar 
             holidays={config.holidays || []} 
             onSelectDate={onSelectDateFromCalendar}
           />
        </div>

        {/* RIGHT COLUMN: Management Controls */}
        <div className="xl:col-span-7 space-y-8">
           
           {/* Add Action Bar */}
           <div className="flex items-center justify-between gap-4 px-2">
             <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Management Console</p>
             </div>
             {!isAdding && (
               <button
                 onClick={() => setIsAdding(true)}
                 className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-95"
               >
                 <Plus size={20} />
               </button>
             )}
           </div>

           {/* Add Holiday Form (Lush Design) */}
           {isAdding && (
             <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 space-y-8 animate-in zoom-in-95 duration-200 shadow-2xl shadow-blue-500/5 relative overflow-hidden">
               <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[11px] font-bold text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                     <Target size={14} /> ข้อมูลพื้นฐานวันหยุด
                  </h4>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 
                 <div className="space-y-2.5">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">ชื่อวันหยุด / เทศกาล</label>
                   <input
                     type="text"
                     value={newHoliday.name}
                     onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                     placeholder="เช่น วันสงกรานต์, วันขึ้นปีใหม่..."
                     className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium text-slate-700 focus:bg-white focus:border-blue-500/20 outline-none transition-all placeholder:text-slate-300"
                   />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">วันที่กำหนด (เดือน-วัน)</label>
                      <input
                        type="text"
                        value={newHoliday.date}
                        onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                        placeholder="04-13"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-600 focus:bg-white focus:border-blue-500/20 outline-none transition-all font-inter tabular-nums"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">ระดับตัวคูณค่าแรง</label>
                      <div className="relative group">
                        <input
                          type="number"
                          step="0.5"
                          value={newHoliday.multiplier}
                          onChange={(e) => setNewHoliday({ ...newHoliday, multiplier: parseFloat(e.target.value) })}
                          className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-blue-600 focus:border-blue-500/20 outline-none transition-all tabular-nums"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase tracking-tighter">เท่า (PAY)</span>
                      </div>
                    </div>
                 </div>

               </div>

               <div className="flex items-center gap-4 px-1">
                 <label className="flex items-center gap-3 cursor-pointer group">
                   <div className={cn(
                     "w-10 h-6 p-1 rounded-full bg-slate-100 transition-colors relative",
                     newHoliday.isRecurring && "bg-blue-600"
                   )}>
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={newHoliday.isRecurring}
                        onChange={(e) => setNewHoliday({ ...newHoliday, isRecurring: e.target.checked })}
                      />
                      <div className={cn(
                        "w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                        newHoliday.isRecurring ? "translate-x-4" : "translate-x-0"
                      )}></div>
                   </div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] group-hover:text-slate-600 transition-colors">กำหนดเป็นวันหยุดประจำปี (วนซ้ำทุกปี)</span>
                 </label>
               </div>

               <div className="flex justify-end gap-3 pt-6 border-t border-slate-50">
                 <button
                   onClick={() => setIsAdding(false)}
                   className="px-6 py-3 text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
                 >
                   ยกเลิก
                 </button>
                 <button
                   onClick={handleSave}
                   className="bg-blue-600 text-white px-10 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all font-outfit active:scale-95"
                 >
                   ยืนยันบันทึกข้อมูล
                 </button>
               </div>
             </div>
           )}

           {/* List View (Premium Event Management) */}
           <div className="space-y-4">
              {config.holidays && config.holidays.length > 0 ? (
                config.holidays.sort((a, b) => a.date.localeCompare(b.date)).map((holiday, idx) => (
                  <div 
                    key={holiday.id} 
                    className="group relative p-6 bg-white border border-slate-100 rounded-3xl hover:border-blue-100 hover:shadow-2xl hover:shadow-slate-200/40 transition-all animate-in slide-in-from-right-4 duration-500 cursor-default"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-6 flex-1 min-w-0">
                        <div className={cn(
                          "w-12 h-12 flex items-center justify-center shrink-0 transition-colors",
                          holiday.multiplier > 1.5 ? "text-blue-600" : "text-slate-400"
                        )}>
                          <Star size={24} className={holiday.multiplier > 1.5 ? "fill-blue-600" : "fill-slate-200"} />
                        </div>
                        
                        <div className="space-y-1.5 flex-1 min-w-0">
                           <div className="flex items-center gap-3">
                              <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-tight truncate">
                                {holiday.name}
                              </h4>
                              {holiday.isRecurring && (
                                <div className="px-2 py-0.5 rounded-lg bg-slate-50 text-slate-400 text-[8px] font-bold uppercase tracking-widest border border-slate-100">
                                   Fixed Yearly
                                </div>
                              )}
                           </div>
                           <div className="flex items-center gap-4 text-[10px] font-medium text-slate-400 font-inter uppercase tracking-widest">
                               <div className="flex items-center gap-1.5">
                                  <Clock size={12} strokeWidth={2.5} />
                                  <span>Targets: {holiday.date}</span>
                               </div>
                               <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                               <span className="text-blue-600/60 font-bold">{holiday.multiplier}X Pay Strength</span>
                           </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                         <div className="hidden md:flex flex-col items-end opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Status</span>
                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Active Sync</span>
                         </div>
                         <button
                           onClick={() => setHolidayToDelete(holiday.id)}
                           className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-90 shadow-sm opacity-0 group-hover:opacity-100"
                         >
                           <Trash2 size={16} />
                         </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-24 text-center bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-100 flex flex-col items-center justify-center space-y-4 grayscale opacity-40">
                  <Calendar size={48} strokeWidth={1} className="text-slate-300" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Empty Digital Archive</p>
                </div>
              )}
           </div>
        </div>

      </div>

      <ConfirmationModal 
        isOpen={!!holidayToDelete}
        onClose={() => setHolidayToDelete(null)}
        onConfirm={confirmDelete}
        title="ยืนยันการลบข้อมูลวันหยุด"
        message="คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลวันหยุดนี้? การลบข้อมูลอาจส่งผลต่อการคำนวณเงินเดือนในโมดูลที่เกี่ยวข้อง"
        confirmLabel="ยืนยันลบข้อมูล"
        variant="danger"
      />
    </div>
  );
};
