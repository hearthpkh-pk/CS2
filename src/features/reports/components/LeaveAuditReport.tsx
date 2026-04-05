'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CalendarDays, 
  Trash2, 
  Search, 
  Filter,
  ArrowRight,
  User as UserIcon,
  AlertCircle,
  Clock,
  Briefcase,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LeaveRequest, LeaveType } from '@/types';
import { leaveService } from '@/services/leaveService';
import { format } from 'date-fns';

export const LeaveAuditReport: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const data = await leaveService.getLeaves(); 
      setLeaves(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (userId: string, leaveId: string) => {
    if (confirm('คุณต้องการยกเลิกใบลาของพนักงานรายนี้ใช่หรือไม่?')) {
      await leaveService.deleteLeave(userId, leaveId);
      fetchLeaves();
    }
  };

  const filteredLeaves = leaves.filter(l => {
    const matchesSearch = l.staffName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || l.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4 opacity-50">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Syncing Personnel Matrix...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 font-prompt space-y-4">
      
      {/* 📊 HIGH-DENSITY OPERATIONAL METRICS (Vertical-Ready) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm transition-all hover:border-slate-300">
           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Matrix</p>
           <p className="text-xl font-bold text-slate-900 font-outfit">{leaves.length}</p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm transition-all hover:border-slate-300">
           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Leave</p>
           <p className="text-xl font-bold text-emerald-600 font-outfit">
             {leaves.filter(l => l.status !== 'Cancelled' && format(new Date(), 'yyyy-MM-dd') >= l.startDate && format(new Date(), 'yyyy-MM-dd') <= l.endDate).length}
           </p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm transition-all hover:border-slate-300">
           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cancelled</p>
           <p className="text-xl font-bold text-slate-400 font-outfit">{leaves.filter(l => l.status === 'Cancelled').length}</p>
        </div>
        <div className="p-4 bg-[var(--primary-theme)] border border-blue-600 rounded-xl shadow-lg shadow-blue-500/10">
           <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest mb-1">Sync Status</p>
           <p className="text-xl font-bold text-white font-outfit flex items-center gap-2">
             LIVE <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
           </p>
        </div>
      </div>

      {/* 🔍 OPERATIONAL FILTER (High Density) */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
        <div className="relative group w-full md:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            placeholder="Search Staff Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-[13px] font-medium text-slate-900 outline-none focus:border-slate-400 transition-all placeholder:text-slate-300"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="flex-1 md:w-40 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[11px] font-bold text-slate-900 uppercase tracking-wider outline-none cursor-pointer hover:border-slate-300 transition-all appearance-none"
          >
            <option value="all">ALL CATEGORIES</option>
            <option value="Vacation">VACATION</option>
            <option value="Sick">SICK</option>
            <option value="Personal">PERSONAL</option>
            <option value="Unpaid">UNPAID</option>
          </select>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all shrink-0">
            <Filter size={16} />
          </button>
        </div>
      </div>

      {/* 📋 LEAVE AUDIT MATRIX (Vertical-Responsive Card List) */}
      <div className="space-y-3">
         {filteredLeaves.map(leave => (
           <div 
             key={leave.id} 
             className={cn(
               "flex flex-col md:flex-row md:items-center justify-between p-4 bg-white border rounded-2xl transition-all group gap-4 md:gap-6",
               leave.status === 'Cancelled' ? "opacity-50 border-slate-100" : "border-slate-100 hover:border-slate-300 shadow-sm"
             )}
           >
              {/* Personnel Block */}
              <div className="flex items-center gap-3 min-w-[200px]">
                 <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {leave.staffName.charAt(0)}
                 </div>
                 <div className="min-w-0">
                    <p className="text-[14px] font-bold text-slate-900 font-prompt tracking-tight truncate leading-none mb-1.5">{leave.staffName}</p>
                    <div className="flex items-center gap-2">
                       <span className={cn(
                         "px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-widest border",
                         leave.type === 'Sick' ? "bg-rose-50 text-rose-600 border-rose-100" :
                         leave.type === 'Vacation' ? "bg-blue-50 text-blue-600 border-blue-100" :
                         "bg-slate-50 text-slate-500 border-slate-100"
                       )}>
                         {leave.type}
                       </span>
                       <span className="text-[9px] text-slate-300 font-bold uppercase tracking-tighter">REF: {leave.id.slice(0, 8)}</span>
                    </div>
                 </div>
              </div>

              {/* Time & Period Block (Spans well in vertical) */}
              <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-10">
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Leave Period</p>
                    <p className="text-xs font-bold text-slate-900 tabular-nums uppercase">
                      {format(new Date(leave.startDate), 'dd MMM yyyy')} {leave.startDate !== leave.endDate && `— ${format(new Date(leave.endDate), 'dd MMM yyyy')}`}
                    </p>
                 </div>
                 <div className="space-y-1 max-w-[250px]">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Operational Reason</p>
                    <p className="text-xs text-slate-600 font-medium truncate sm:whitespace-normal italic font-noto">"{leave.reason}"</p>
                 </div>
              </div>

              {/* Status & Action Block */}
              <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-50">
                 <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5">
                       <div className={cn(
                         "w-1.5 h-1.5 rounded-full animate-pulse",
                         leave.status === 'Cancelled' ? "bg-slate-300" : "bg-emerald-500"
                       )}></div>
                       <span className={cn(
                         "text-[10px] font-bold uppercase tracking-[0.2em]",
                         leave.status === 'Cancelled' ? "text-slate-300" : "text-emerald-700"
                       )}>
                         {leave.status}
                       </span>
                    </div>
                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">RECORDED {format(new Date(leave.createdAt!), 'dd/MM/yyyy')}</p>
                 </div>
                 
                 {leave.status !== 'Cancelled' && (
                    <button 
                      onClick={() => handleCancel(leave.staffId, leave.id)}
                      className="p-2.5 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-95 border border-transparent hover:border-rose-100"
                    >
                      <Trash2 size={16} />
                    </button>
                 )}
              </div>
           </div>
         ))}

         {filteredLeaves.length === 0 && (
           <div className="py-24 text-center space-y-4 border-2 border-dashed border-slate-50 rounded-[2rem]">
              <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mx-auto">
                 <Calendar size={32} className="text-slate-200" />
              </div>
              <div className="space-y-1">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">No Personnel Records Found</p>
                 <p className="text-[10px] text-slate-300 uppercase tracking-widest">Filters do not match existing matrix data</p>
              </div>
           </div>
         )}
      </div>
    </div>
  );
};
