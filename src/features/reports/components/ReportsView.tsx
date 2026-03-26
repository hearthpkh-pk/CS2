'use client';

import React, { useMemo, useState } from 'react';
import { format, subDays, startOfMonth } from 'date-fns';
import { User, PolicyConfiguration, Role } from '@/types';
import { performanceService } from '@/services/performanceService';
import { allMockUsers, mockDashboardLogs, mockDashboardPages } from '../../hq-dashboard/mocks/dashboardMocks';
import { 
  Shield, Search, 
  ChevronRight, Calendar, Info, 
  TrendingUp, AlertCircle, X,
  CheckCircle2, MinusCircle, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportsViewProps {
  currentUser: User;
  policy: PolicyConfiguration;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ 
  policy 
}) => {
  const [viewMode, setViewMode] = useState<'Month' | 'Year'>('Month');
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const now = useMemo(() => new Date(), []);
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const historyDates = useMemo(() => [
    subDays(now, 2),
    subDays(now, 1),
    now
  ], [now]);

  const staffData = useMemo(() => {
    const staff = allMockUsers.filter(u => u.role === Role.Staff);
    
    return staff.map(u => {
      if (viewMode === 'Month') {
        const stats = performanceService.getMonthlyOperationalStats(
          u, currentMonth, currentYear, mockDashboardLogs, mockDashboardPages, policy
        );
        return { user: u, stats };
      } else {
        const yearlyStats = Array.from({ length: 12 }).map((_, m) => 
          performanceService.getMonthlyOperationalStats(u, m, currentYear, mockDashboardLogs, mockDashboardPages, policy)
        );
        
        return { 
          user: u, 
          stats: {
            activePagesCount: yearlyStats[currentMonth].activePagesCount,
            history3Days: yearlyStats[currentMonth].history3Days,
            monthlySummary: {
              leaveDays: yearlyStats.reduce((sum, s) => sum + s.monthlySummary.leaveDays, 0),
              monthlyTarget: yearlyStats.reduce((sum, s) => sum + s.monthlySummary.monthlyTarget, 0),
              totalValidClips: yearlyStats.reduce((sum, s) => sum + s.monthlySummary.totalValidClips, 0),
              missingClips: yearlyStats.reduce((sum, s) => sum + s.monthlySummary.missingClips, 0),
            }
          } 
        };
      }
    }).filter(s => 
      s.user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (s.user.brand && s.user.brand.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [policy, searchTerm, currentMonth, currentYear, viewMode]);

  const renderStatusSmall = (day: any) => {
    if (day.status === 'Leave') {
      return (
        <div className="flex flex-col items-center justify-center py-1 px-2 bg-transparent border border-slate-200 min-w-[48px] rounded">
          <span className="text-[9px] font-bold text-slate-400">OFF</span>
        </div>
      );
    }
    if (day.status === 'Absent' && day.totalClips === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-1 px-2 bg-transparent border border-rose-200 min-w-[48px] rounded">
          <span className="text-[9px] font-bold text-rose-500">ABSENT</span>
        </div>
      );
    }

    const isMet = day.validClips >= day.target && day.target > 0;
    
    return (
      <div className={cn(
        "flex flex-col items-center justify-center py-1 px-2 bg-transparent border min-w-[48px] rounded",
        isMet ? "border-emerald-200" : "border-amber-200"
      )}>
        <span className={cn("text-xs font-bold leading-none", isMet ? "text-emerald-600" : "text-amber-600")}>
          {day.totalClips}
        </span>
        <span className="text-[8px] opacity-60 font-medium mt-0.5">/{day.target}</span>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-fade-in font-noto">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-slate-100 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <TrendingUp size={14} className="text-blue-500" />
            <span>Operational Matrix</span>
            <span className="text-slate-200">|</span>
            <span>Compliance Audit</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight font-outfit">
            Reports & Statistics
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search staff or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 w-64 shadow-sm"
            />
          </div>
          <div className="bg-slate-50 p-1 rounded-xl border border-slate-200 flex gap-1">
            {['Month', 'Year'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                  viewMode === mode 
                    ? "bg-white text-blue-600 shadow-sm border border-slate-100" 
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MATRIX TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Operator & Brand</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-center">Active Pages</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-center">
                  History (3 Days)
                  <div className="flex justify-center gap-4 mt-1">
                    {historyDates.map(d => (
                      <span key={d.toISOString()} className="text-[8px] font-medium text-slate-300">
                        {format(d, 'dd MMM')}
                      </span>
                    ))}
                  </div>
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-right">Performance Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffData.map(({ user, stats }) => (
                <tr key={user.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 bg-white shadow-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{user.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-medium text-slate-400 border border-slate-100 px-1 rounded">{user.teamId}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                          <span className="text-[10px] font-bold text-blue-600 underline decoration-blue-200 underline-offset-2">{user.brand || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-sm font-bold text-slate-700">{stats.activePagesCount}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-4">
                      {stats.history3Days.map((day, idx) => (
                        <div key={idx}>{renderStatusSmall(day)}</div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-6 h-full">
                      <div className="flex gap-4">
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tight">Capped Target</span>
                          <span className="text-xs font-bold text-slate-700">{stats.monthlySummary.monthlyTarget}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tight">Deficit</span>
                          <span className={cn("text-xs font-bold", stats.monthlySummary.missingClips > 0 ? "text-rose-500" : "text-emerald-500")}>
                            {stats.monthlySummary.missingClips}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedStaff(user)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-300 hover:text-blue-600 hover:border-blue-200 transition-all"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* INFO & LEGEND */}
      <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-slate-400 tracking-wider px-2 uppercase">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 text-slate-500">
             <div className="w-2 h-2 rounded-full border border-emerald-500" />
            <span>Target Met</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
             <div className="w-2 h-2 rounded-full border border-amber-500" />
            <span>Target Deficit</span>
          </div>
          <div className="flex items-center gap-2 border-l border-slate-200 pl-8 ml-2">
            <Info size={14} className="text-blue-500" />
            <span>Calculation Rule: Max {policy.clipsPerPageInLog} clips per page</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <Clock size={14} />
          <span>Calculated at: {format(now, 'HH:mm')}</span>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedStaff && (
        <InsightModal 
          user={selectedStaff} 
          onClose={() => setSelectedStaff(null)} 
          policy={policy}
          currentMonth={currentMonth}
          currentYear={currentYear}
        />
      )}
    </div>
  );
};

// --- INSIGHT MODAL COMPONENT ---
const InsightModal = ({ user, onClose, policy, currentMonth, currentYear }: any) => {
  const stats = useMemo(() => {
    return performanceService.getMonthlyOperationalStats(
      user, currentMonth, currentYear, mockDashboardLogs, mockDashboardPages, policy
    );
  }, [user, policy, currentMonth, currentYear]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
        
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg border border-slate-200 flex items-center justify-center text-xl font-bold text-blue-600 bg-white shadow-sm">
              {user.name.charAt(0)}
            </div>
            <div className="space-y-0.5">
              <h3 className="text-lg font-bold text-slate-800">{user.name}</h3>
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                <span className="text-slate-400 border border-slate-100 px-1 rounded">{user.teamId}</span>
                <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                <span className="text-blue-600 underline underline-offset-2 decoration-blue-100">{user.brand}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-300 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* STATS OVERVIEW CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Work Days', value: stats.dailyDetails.filter((d: any) => d.status === 'Work').length },
              { label: 'Leave Units', value: stats.monthlySummary.leaveDays },
              { label: 'Monthly Target', value: stats.monthlySummary.monthlyTarget },
              { label: 'Clip Deficit', value: stats.monthlySummary.missingClips, color: stats.monthlySummary.missingClips > 0 ? 'text-rose-600' : 'text-emerald-600' }
            ].map((card, i) => (
              <div key={i} className="p-5 rounded-2xl border border-slate-100 flex flex-col gap-1 bg-white">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{card.label}</p>
                <p className={cn("text-2xl font-bold text-slate-800", card.color)}>{card.value}</p>
              </div>
            ))}
          </div>

          {/* AUDIT TABLE */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Daily Compliance Audit Log</h4>
            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-[11px] border-collapse bg-white">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-slate-500">
                    <th className="px-6 py-4 font-bold text-left">Fiscal Date</th>
                    <th className="px-6 py-4 font-bold text-center">Status</th>
                    <th className="px-6 py-4 font-bold text-center">Net Valid</th>
                    <th className="px-6 py-4 font-bold text-center">Gross Inbound</th>
                    <th className="px-6 py-4 font-bold text-center">Target</th>
                    <th className="px-6 py-4 font-bold text-right">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.dailyDetails.map((day: any) => (
                    <tr key={day.date} className={cn("hover:bg-slate-50/20", day.date === format(new Date(), 'yyyy-MM-dd') && "bg-blue-50/10")}>
                      <td className="px-6 py-3 font-bold text-slate-600">{format(new Date(day.date), 'dd MMM yyyy')}</td>
                      <td className="px-6 py-3 text-center">
                        <span className={cn(
                          "px-2 py-0.5 border rounded font-bold uppercase text-[9px]",
                          day.status === 'Work' ? "border-emerald-200 text-emerald-600" :
                          day.status === 'Leave' ? "border-slate-200 text-slate-400" : "border-rose-200 text-rose-600"
                        )}>
                          {day.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center text-slate-800">{day.validClips}</td>
                      <td className="px-6 py-3 text-center text-slate-300 font-medium">{day.totalClips}</td>
                      <td className="px-6 py-3 text-center text-slate-400">{day.target}</td>
                      <td className="px-6 py-3 text-right">
                        {day.missing > 0 ? (
                          <span className="text-rose-600 font-bold">-{day.missing}</span>
                        ) : day.status === 'Work' ? (
                          <CheckCircle2 size={14} className="text-emerald-500 ml-auto" />
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-[10px] text-slate-400">
          <p className="font-medium">
            * Compliance is audited at the asset (page) level before monthly aggregation. 
          </p>
          <button onClick={onClose} className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold uppercase tracking-widest shadow-sm hover:bg-slate-900 transition-all">
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
