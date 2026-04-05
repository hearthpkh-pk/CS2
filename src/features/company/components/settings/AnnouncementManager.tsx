'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Megaphone,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Target,
  X,
  Radio,
  BellRing,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Info,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  eachDayOfInterval,
  isWithinInterval,
  isBefore,
  startOfToday
} from 'date-fns';
import { cn } from '@/lib/utils';
import { Announcement, Role } from '@/types';
import { useCompanyConfig } from '../../hooks/useCompanyConfig';

// --- Mini Calendar Sub-Component (Range Selection) ---
interface RangeDatePickerProps {
  startDate?: string;
  endDate?: string;
  onChange: (start?: string, end?: string) => void;
}

const RangeDatePicker: React.FC<RangeDatePickerProps> = ({ startDate, endDate, onChange }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const start = useMemo(() => startDate ? new Date(startDate) : null, [startDate]);
  const end = useMemo(() => endDate ? new Date(endDate) : null, [endDate]);

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  const handleDayClick = (day: Date) => {
    if (!start || (start && end)) {
      onChange(day.toISOString(), undefined);
    } else {
      if (isBefore(day, start)) {
        onChange(day.toISOString(), undefined);
      } else {
        onChange(start.toISOString(), day.toISOString());
      }
    }
  };

  const isInRange = (day: Date) => {
    if (start && end) {
      return isWithinInterval(day, { start, end });
    }
    return false;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4 font-prompt select-none">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-widest font-outfit">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.preventDefault(); setCurrentMonth(subMonths(currentMonth, 1)); }}
            className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); setCurrentMonth(addMonths(currentMonth, 1)); }}
            className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-[9px] font-bold text-slate-300 uppercase text-center py-2">{d}</div>
        ))}
        {days.map((day, idx) => {
          const isSelected = (start && isSameDay(day, start)) || (end && isSameDay(day, end));
          const range = isInRange(day);
          const current = isSameMonth(day, currentMonth);
          const today = isSameDay(day, new Date());

          return (
            <div
              key={idx}
              onClick={() => handleDayClick(day)}
              className={cn(
                "relative h-9 flex items-center justify-center cursor-pointer group transition-all",
                !current && "opacity-10"
              )}
            >
              {/* Range Background */}
              {range && (
                <div className={cn(
                  "absolute inset-y-1.5 bg-blue-50/50 w-full",
                  start && isSameDay(day, start) && "rounded-l-full left-1/2 w-1/2 bg-blue-400",
                  end && isSameDay(day, end) && "rounded-r-full right-1/2 w-1/2 bg-blue-400"
                )} />
              )}

              <div className={cn(
                "relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all",
                isSelected ? "bg-blue-600 text-white shadow-lg shadow-blue-200" :
                  range ? "text-blue-600" :
                    today ? "text-blue-600 border border-blue-200" : "text-slate-600 hover:bg-slate-50"
              )}>
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
        <div className="space-y-0.5">
          <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Active Schedule</p>
          <p className="text-[10px] font-bold text-slate-600">
            {start ? format(start, 'dd MMM') : '--'} - {end ? format(end, 'dd MMM') : '--'}
          </p>
        </div>
        <button
          onClick={(e) => { e.preventDefault(); onChange(undefined, undefined); }}
          className="text-[9px] font-bold text-rose-500 uppercase hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export const AnnouncementManager: React.FC = () => {
  const { config, saveAnnouncement, deleteAnnouncement } = useCompanyConfig();
  const [isAdding, setIsAdding] = useState(false);

  const [newAnn, setNewAnn] = useState<Partial<Announcement>>({
    message: '',
    type: 'info',
    isActive: true,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    targetRoles: [],
    targetGroups: [],
    targetTeams: [],
    targetUsers: []
  });

  const handleSave = async () => {
    if (!newAnn.message) return;

    const announcement: Announcement = {
      id: `ann-${Date.now()}`,
      message: newAnn.message,
      type: (newAnn.type as any) || 'info',
      isActive: true,
      startDate: new Date(newAnn.startDate || Date.now()).toISOString(),
      endDate: newAnn.endDate ? new Date(newAnn.endDate).toISOString() : undefined,
      targetRoles: newAnn.targetRoles,
      targetGroups: newAnn.targetGroups,
      targetTeams: newAnn.targetTeams,
      targetUsers: newAnn.targetUsers
    };

    await saveAnnouncement(announcement);
    setIsAdding(false);
    setNewAnn({
      message: '',
      type: 'info',
      isActive: true,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      targetRoles: [],
      targetGroups: [],
      targetTeams: [],
      targetUsers: []
    });
  };

  const toggleTarget = (field: keyof Announcement, value: any) => {
    const current = (newAnn[field] as any[]) || [];
    if (current.includes(value)) {
      setNewAnn({ ...newAnn, [field]: current.filter(v => v !== value) });
    } else {
      setNewAnn({ ...newAnn, [field]: [...current, value] });
    }
  };

  const selectAll = (field: keyof Announcement, allValues: any[]) => {
    const current = (newAnn[field] as any[]) || [];
    if (current.length === allValues.length) {
      setNewAnn({ ...newAnn, [field]: [] });
    } else {
      setNewAnn({ ...newAnn, [field]: allValues });
    }
  };

  const allRoles = [Role.Admin, Role.Manager, Role.Staff];
  const allGroups = config.groups.map(g => g.id);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-400 font-prompt">
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-slate-50 pb-8">
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-slate-800 font-outfit uppercase tracking-tight">System Broadcast</h3>
            <p className="text-slate-400 text-[11px] font-normal tracking-tight text-left leading-relaxed">ประกาศตัววิ่งและแจ้งเตือนระบบรวมสำหรับทีมบริหารและพนักงาน</p>
          </div>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-sm"
            >
              <BellRing size={18} />
            </button>
          )}
        </div>

        {isAdding && (
          <div className="bg-slate-50/50 p-8 rounded-2xl border border-slate-100 space-y-10 animate-in zoom-in-95 duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

              {/* LEFT CONTENT */}
              <div className="space-y-8">
                <div className="space-y-2.5">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest ml-1">Message Content</label>
                  <textarea
                    value={newAnn.message}
                    onChange={(e) => setNewAnn({ ...newAnn, message: e.target.value.toUpperCase() })}
                    placeholder="ประกาศระบบ..."
                    className="w-full bg-white border border-slate-100 rounded-xl px-6 py-5 text-sm font-semibold text-slate-700 focus:border-blue-500/20 outline-none transition-all h-32 resize-none placeholder:text-slate-200 italic font-noto leading-relaxed"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest ml-1">Priority Level</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'info', label: 'ปกติ (Operational)', color: 'bg-blue-600' },
                      { id: 'warning', label: 'แจ้งเตือน (Warning)', color: 'bg-amber-500' },
                      { id: 'critical', label: 'เร่งด่วน (Urgent)', color: 'bg-rose-500' }
                    ].map((lvl) => (
                      <button
                        key={lvl.id}
                        onClick={(e) => { e.preventDefault(); setNewAnn({ ...newAnn, type: lvl.id as any }); }}
                        className={cn(
                          "px-4 py-3 rounded-xl text-[11px] font-medium transition-all flex items-center justify-center border",
                          newAnn.type === lvl.id
                            ? `${lvl.color} text-white border-transparent shadow-lg shadow-blue-500/10`
                            : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                        )}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest ml-1">Visibility Matrix</label>
                  <div className="grid grid-cols-2 gap-8 px-1">
                    <div className="space-y-2">
                      <p className="text-[10px] font-medium text-slate-300 uppercase tracking-widest">Roles</p>
                      <div className="flex flex-wrap gap-1.5">
                        <button 
                          onClick={(e) => { e.preventDefault(); selectAll('targetRoles', allRoles); }}
                          className={cn(
                            "px-2.5 py-1.5 rounded-lg text-[10px] font-medium uppercase tracking-wider border transition-all",
                            newAnn.targetRoles?.length === allRoles.length
                              ? "bg-slate-800 text-white border-transparent shadow-sm"
                              : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100"
                          )}
                        >
                          All Roles
                        </button>
                        {allRoles.map(role => (
                          <button
                            key={role}
                            onClick={(e) => { e.preventDefault(); toggleTarget('targetRoles', role); }}
                            className={cn(
                              "px-2.5 py-1.5 rounded-lg text-[10px] font-medium uppercase tracking-wider border transition-all",
                              newAnn.targetRoles?.includes(role)
                                ? "bg-blue-600 text-white border-transparent shadow-sm"
                                : "bg-white text-slate-400 border-slate-100"
                            )}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-medium text-slate-300 uppercase tracking-widest">Units</p>
                      <div className="flex flex-wrap gap-1.5">
                        <button 
                          onClick={(e) => { e.preventDefault(); selectAll('targetGroups', allGroups); }}
                          className={cn(
                            "px-2.5 py-1.5 rounded-lg text-[10px] font-medium uppercase tracking-wider border transition-all",
                            newAnn.targetGroups?.length === allGroups.length
                              ? "bg-slate-800 text-white border-transparent shadow-sm"
                              : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100"
                          )}
                        >
                          All Units
                        </button>
                        {config.groups.map(group => (
                          <button
                            key={group.id}
                            onClick={(e) => { e.preventDefault(); toggleTarget('targetGroups', group.id); }}
                            className={cn(
                              "px-2.5 py-1.5 rounded-lg text-[10px] font-medium uppercase tracking-wider border transition-all",
                              newAnn.targetGroups?.includes(group.id)
                                ? "bg-blue-600 text-white border-transparent shadow-sm"
                                : "bg-white text-slate-400 border-slate-100"
                            )}
                          >
                            {group.name}
                          </button>
                        ))}

                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT CONTENT (DATE PICKER) */}
              <div className="space-y-3">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest ml-1">Active Schedule</label>
                <RangeDatePicker
                  startDate={newAnn.startDate}
                  endDate={newAnn.endDate}
                  onChange={(start, end) => setNewAnn({ ...newAnn, startDate: start, endDate: end })}
                />
                <p className="text-[10px] text-slate-300 italic px-2">
                  *ประกาศจะแสดงผลอัตโนมัติในช่วงวันที่ที่เลือกเท่านั้น
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
              <button
                onClick={() => setIsAdding(false)}
                className="px-6 py-3 text-[11px] font-semibold text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-10 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all font-outfit"
              >
                Deploy Broadcast
              </button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3 mt-10">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Operational Queue</p>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
            <Activity size={12} className="text-slate-200" />
          </div>

          <div className="space-y-5">
            {config.announcements.map(ann => (
              <div key={ann.id} className="group relative flex items-start justify-between p-6 bg-white border border-slate-100 rounded-2xl hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all animate-in slide-in-from-left-2">
                <div className="flex items-start gap-5 pr-12">
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-2.5 shrink-0 shadow-[0_0_10px_rgba(0,0,0,0.1)]",
                    ann.type === 'critical' ? "bg-rose-500 shadow-rose-200" :
                      ann.type === 'warning' ? "bg-amber-500 shadow-amber-200" : "bg-blue-600 shadow-blue-200"
                  )} />
                  <div className="space-y-2.5">
                    <p className="text-[15px] font-semibold text-slate-800 leading-snug uppercase tracking-tight max-w-4xl">{ann.message}</p>
                    <div className="flex flex-wrap items-center gap-6 text-[10px] font-bold text-slate-300 uppercase tracking-[0.15em]">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-300" />
                        {ann.startDate ? format(new Date(ann.startDate), 'dd/MM/yyyy') : 'REALTIME'}
                        {ann.endDate ? ` — ${format(new Date(ann.endDate), 'dd/MM/yyyy')}` : ''}
                      </span>
                      <div className={cn(
                        "px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase",
                        ann.type === 'critical' ? "bg-rose-50 text-rose-500 border-rose-100" :
                          ann.type === 'warning' ? "bg-amber-50 text-amber-500 border-amber-100" : "bg-blue-50 text-blue-600 border-blue-100"
                      )}>{ann.type}</div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteAnnouncement(ann.id)}
                  className="absolute top-6 right-6 text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}

            {config.announcements.length === 0 && (
              <div className="py-24 text-center opacity-20 flex flex-col items-center justify-center space-y-4 grayscale">
                <Activity size={48} strokeWidth={1} className="text-slate-400" />
                <p className="text-xs font-bold uppercase tracking-[0.3em] font-noto">ไม่มีประกาศที่กําลังเปิดใช้งาน</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
