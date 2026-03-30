'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { User, Role, LeaveRequest, CalendarEvent } from '@/types';
import { initialLeaveRequests, initialCalendarEvents } from '@/services/mockData';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CalendarViewProps {
  currentUser: User;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ currentUser }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [events, setEvents] = useState<CalendarEvent[]>(initialCalendarEvents);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // Calendar Logic
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const numDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const isHoliday = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.find(e => e.date === dateStr && e.type === 'Holiday');
  };

  const isDoublePay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.find(e => e.date === dateStr && e.type === 'DoublePay');
  };

  const dayLeave = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    // Check if any leave request covers this date
    return leaveRequests.find(l => {
        const start = l.startDate.split('T')[0];
        const end = l.endDate.split('T')[0];
        return dateStr >= start && dateStr <= end;
    });
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 pb-10 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header (Golden Rules Mode 1) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pt-4 pb-6 mb-6 gap-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-[#0f172a] font-outfit uppercase tracking-tight leading-none">
              CALENDAR & LEAVE
            </h2>
          </div>
          <p className="text-slate-400 font-noto text-[11px] mt-1.5">
            ตารางงานและระบบลางานออนไลน์ • <span className="text-[var(--primary-theme)] font-bold">Workspace</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month Navigator (Standard Mode 1) */}
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm h-[40px]">
            <button 
              onClick={prevMonth} 
              className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 transition-all rounded-xl text-slate-400 hover:text-[var(--primary-theme)]"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-4 font-bold text-[#0f172a] font-noto text-sm min-w-[120px] text-center">
              {monthNames[month]} {year + 543}
            </span>
            <button 
              onClick={nextMonth} 
              className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 transition-all rounded-xl text-slate-400 hover:text-[var(--primary-theme)]"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button 
            onClick={() => setShowLeaveModal(true)}
            className="flex items-center gap-2 bg-[var(--primary-theme)] hover:bg-[var(--primary-theme-hover)] text-white px-5 py-2.5 rounded-2xl font-bold font-noto text-sm transition-all shadow-lg shadow-blue-100/50 active:scale-95"
          >
            <Plus size={18} />
            <span>ยื่นลางาน</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white p-4 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <div className="min-w-[600px]">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((d, i) => (
              <div key={d} className={cn(
                "text-center text-[10px] font-black font-noto uppercase tracking-widest pb-4",
                i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-slate-300"
              )}>
                {d}
              </div>
            ))}
            
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24" />
            ))}

            {Array.from({ length: numDays }).map((_, i) => {
              const day = i + 1;
              const holiday = isHoliday(day);
              const double = isDoublePay(day);
              const leave = dayLeave(day);
              
              return (
                <div 
                  key={day} 
                  className={cn(
                    "h-24 p-2 rounded-2xl border border-transparent transition-all hover:border-slate-100 hover:bg-slate-50/50 group relative overflow-hidden",
                    holiday ? "bg-red-50/30" : double ? "bg-orange-50/30" : ""
                  )}
                >
                  <span className={cn(
                    "text-sm font-bold transition-colors",
                    holiday ? "text-red-500" : "text-slate-600 group-hover:text-blue-600"
                  )}>
                    {day}
                  </span>

                  {holiday && (
                    <div className="mt-1">
                      <div className="text-[8px] font-black text-red-400 leading-tight uppercase truncate">
                        {holiday.title}
                      </div>
                    </div>
                  )}

                  {double && (
                    <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-lg text-[8px] font-black uppercase">
                       2X Pay
                    </div>
                  )}

                  {leave && (
                    <div className={cn(
                      "mt-1 px-1.5 py-0.5 rounded-lg text-[8px] font-bold flex items-center gap-1 border",
                      leave.status === 'Approved' ? "border-emerald-100 text-emerald-600" : "border-blue-100 text-blue-600"
                    )}>
                       {leave.status === 'Approved' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                       {leave.type}
                    </div>
                  )}

                  {/* Work Status Placeholder */}
                  <div className="absolute bottom-2 right-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-200" title="งานส่งแล้ว" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>

        {/* Side Panel: Requests & Holidays */}
        <div className="space-y-6">
          {/* Approval Queue for Super Admin */}
          {currentUser.role === Role.SuperAdmin && (
            <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-xl shadow-slate-200 overflow-hidden relative">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <AlertCircle size={20} className="text-yellow-400" />
                Leave Approvals
              </h3>
              <div className="space-y-3">
                {leaveRequests.filter(l => l.status === 'Pending').map(req => (
                  <div key={req.id} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-xs font-bold">{req.staffName}</p>
                        <p className="text-[10px] text-white/50">{req.type} • {req.startDate.split('T')[0]}</p>
                      </div>
                      <span className="text-[8px] font-black bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-lg uppercase">Pending</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold py-2 rounded-xl transition-colors">Approve</button>
                      <button className="flex-1 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold py-2 rounded-xl transition-colors text-red-400">Reject</button>
                    </div>
                  </div>
                ))}
                {leaveRequests.filter(l => l.status === 'Pending').length === 0 && (
                  <p className="text-xs text-white/30 text-center py-4 italic">No pending requests</p>
                )}
              </div>
            </div>
          )}

          {/* User's Own Requests */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">My Requests</h3>
            <div className="space-y-3">
              {leaveRequests.filter(l => l.staffId === currentUser.id).map(req => (
                <div key={req.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-700">{req.type}</p>
                    <p className="text-[10px] text-slate-400">{req.startDate.split('T')[0]}</p>
                  </div>
                  <span className={cn(
                    "text-[8px] font-black px-2 py-0.5 border rounded-lg uppercase",
                    req.status === 'Approved' ? "border-emerald-100 text-emerald-600" : "border-blue-100 text-blue-600"
                  )}>
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50/50 p-6 rounded-[2.5rem] border border-blue-100/50">
             <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3 italic">Did you know?</h4>
             <p className="text-xs text-blue-600 font-noto leading-relaxed">
               หากท่านทำงานในวันหยุดนักขัตฤกษ์ ระบบจะคำนวณเบี้ยเลี้ยงเป็น 2 เท่า (Double Pay) โดยอัตโนมัติในรอบสิ้นเดือน
             </p>
          </div>
        </div>
      </div>

      {/* Placeholder Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowLeaveModal(false)} />
          <div className="bg-white w-full max-w-md rounded-[3rem] p-8 relative shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 font-outfit uppercase">Take Leave</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block mx-2 font-noto">ประเภทการลา</label>
                <select className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-noto focus:ring-2 ring-blue-100 outline-none">
                  <option>ลาป่วย (Sick Leave)</option>
                  <option>ลากิจ (Personal Leave)</option>
                  <option>ลาพักร้อน (Vacation Leave)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block mx-2 font-noto">เริ่มวันที่</label>
                    <input type="date" className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-noto focus:ring-2 ring-blue-100 outline-none font-inter" />
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block mx-2 font-noto">ถึงวันที่</label>
                    <input type="date" className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-noto focus:ring-2 ring-blue-100 outline-none font-inter" />
                 </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block mx-2 font-noto">เหตุผล</label>
                <textarea className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-noto focus:ring-2 ring-blue-100 outline-none min-h-[100px]" placeholder="ระบุเหตุผล..."></textarea>
              </div>
              <button 
                className="w-full bg-[var(--primary-theme)] text-white py-4 rounded-2xl font-bold font-noto shadow-lg shadow-blue-100 hover:bg-[var(--primary-theme-hover)] transition-all mt-4 active:scale-95"
                onClick={() => {
                  alert("ส่งคำขอลางานแล้ว! ต้องรอการอนุมัติจาก Super Admin");
                  setShowLeaveModal(false);
                }}
              >
                ยืนยันการขอลา
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
