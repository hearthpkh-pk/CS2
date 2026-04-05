'use client';

import React from 'react';
import { Users, Activity, Share2, Target, Clock, ChevronRight } from 'lucide-react';
import { DailyReport } from '@/types';
import { cn } from '@/lib/utils';

interface OperationalMatrixProps {
  reports: DailyReport[];
  filteredReports: DailyReport[];
  filterMode: 'all' | 'brand' | 'department' | 'tag';
  onFilterChange: (mode: 'all' | 'brand' | 'department' | 'tag', value?: string | null) => void;
  activeFilterValue: string | null;
  onActiveFilterChange: (value: string | null) => void;
  uniqueDepartments: string[];
  uniqueBrands: string[];
  uniqueTags: string[];
  onSelectReport: (report: DailyReport) => void;
  pinnedIds: Set<string>;
  onTogglePin: (e: React.MouseEvent, id: string) => void;
}

export const OperationalMatrix: React.FC<OperationalMatrixProps> = ({
  reports,
  filteredReports,
  filterMode,
  onFilterChange,
  activeFilterValue,
  onActiveFilterChange,
  uniqueDepartments,
  uniqueBrands,
  uniqueTags,
  onSelectReport,
  pinnedIds,
  onTogglePin
}) => {
  return (
    <div className="animate-in fade-in duration-700">
      {/* Precision KPI Summary Grid - HQ Control Center Style */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
        {[
          { id: 'all', label: 'Global Personnel', icon: Users, value: reports.length, unit: 'operators' },
          { id: 'department', label: 'Operational Units', icon: Activity, value: uniqueDepartments.length, unit: 'departments' },
          { id: 'brand', label: 'Client Brands', icon: Share2, value: uniqueBrands.length, unit: 'assets' },
          { id: 'tag', label: 'Priority Groups', icon: Target, value: uniqueTags.length, unit: 'focus areas' }
        ].map((card) => (
          <button 
            key={card.id}
            onClick={() => onFilterChange(card.id as any)}
            className={cn(
              "bg-white p-5 rounded-2xl border transition-all text-left group relative",
              filterMode === card.id 
                ? 'border-[var(--primary-theme)] shadow-md ring-4 ring-blue-50/30' 
                : 'border-slate-100 hover:border-slate-200 shadow-sm'
            )}
          >
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <card.icon size={13} className={filterMode === card.id ? 'text-[var(--primary-theme)]' : 'text-slate-300'} strokeWidth={1.5} />
              {card.label}
            </p>
            <div className="flex items-baseline gap-2">
              <span className={cn(
                "text-2xl font-bold font-outfit tracking-tight",
                filterMode === card.id ? 'text-[var(--primary-theme)]' : 'text-slate-900'
              )}>
                {card.value}
              </span>
              <span className="text-[10px] font-medium text-slate-400 tracking-wider lowercase opacity-60">
                {card.unit}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Drill-down Sub-Filter (Pills) */}
      {(filterMode !== 'all') && (
        <div className="flex flex-wrap items-center gap-2 mb-8 animate-in slide-in-from-top-2 duration-300 bg-slate-50/50 p-2 rounded-2xl border border-slate-50">
          {(filterMode === 'department' ? uniqueDepartments : filterMode === 'brand' ? uniqueBrands : uniqueTags).map((val, idx) => (
            <button
              key={`${filterMode}-${val}-${idx}`}
              onClick={() => onActiveFilterChange(activeFilterValue === val ? null : val)}
              className={cn(
                "px-4 py-2 rounded-xl text-[11px] font-bold transition-all border",
                activeFilterValue === val 
                  ? 'bg-[var(--primary-theme)] border-[var(--primary-theme)] text-white shadow-md' 
                  : 'bg-white border-slate-100 text-slate-400 hover:border-blue-100 hover:text-slate-600'
              )}
            >
              {val}
            </button>
          ))}
          {activeFilterValue && (
            <button 
              onClick={() => onActiveFilterChange(null)}
              className="px-4 py-2 rounded-xl text-[10px] font-bold text-[var(--primary-theme)] hover:bg-blue-50 transition-all flex items-center gap-1.5"
            >
              Clear Selection
            </button>
          )}
        </div>
      )}

      {/* Main List */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto relative custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-[#f8fafc]">
              <tr className="border-b border-slate-100">
                <th className="pl-4 md:pl-8 pr-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Operational Staff</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Running Campaigns</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Output Volume</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Sync Time</th>
                <th className="pl-6 pr-4 md:pr-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Drill-down</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredReports.map((report) => (
                <tr 
                  key={report.id} 
                  className={cn(
                    "hover:bg-[#f1f5f9]/50 transition-all duration-300 group cursor-pointer",
                    pinnedIds.has(report.id) ? 'bg-blue-50/10' : ''
                  )}
                  onClick={() => onSelectReport(report)}
                >
                  <td className="pl-4 md:pl-8 pr-6 py-5">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={(e) => onTogglePin(e, report.id)}
                        className={cn(
                          "p-1.5 rounded-lg transition-all",
                          pinnedIds.has(report.id) ? 'text-[var(--primary-theme)]' : 'text-slate-200 hover:text-slate-400'
                        )}
                      >
                        <Target size={13} className={pinnedIds.has(report.id) ? 'fill-[var(--primary-theme)]' : ''} />
                      </button>

                      <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-900 flex items-center justify-center text-white group-hover:bg-blue-600 group-hover:border-blue-600 transition-all shadow-sm shrink-0">
                        <span className="text-xs font-bold leading-none">{report.userName.charAt(0)}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-bold text-slate-900 font-noto tracking-tight truncate leading-none mb-2">
                          {report.userName}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest border border-slate-50 px-2 py-0.5 rounded-lg bg-slate-50/50">
                            {report.department} • {report.group}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-2">
                      {report.brand !== 'None' ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white/50 group-hover:border-slate-300">
                          <Share2 size={10} className="text-slate-400" />
                          <span className="text-[11px] font-bold text-slate-900 uppercase tracking-tighter">
                            {report.brand}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-300 italic tracking-wider">No Active Brands</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-[13px] font-medium text-slate-900 font-inter tabular-nums">
                        {report.postCount} <span className="text-[10px] text-slate-400">/ {report.totalPostsRequired}</span>
                      </p>
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-700 ease-out",
                            report.status === 'Complete' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-slate-900'
                          )} 
                          style={{ width: `${(report.postCount / (report.totalPostsRequired || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="inline-flex items-center gap-2.5 text-slate-400">
                      <Clock size={13} strokeWidth={2} className="group-hover:text-slate-900 transition-colors" />
                      <span className="text-[12px] font-medium font-inter group-hover:text-slate-900 transition-colors">{report.submissionTime}</span>
                    </div>
                  </td>
                  <td className="pl-6 pr-4 md:pr-8 py-5 text-right">
                    <div className="inline-flex p-2.5 text-slate-300 group-hover:text-slate-900 transition-all bg-white rounded-xl border border-slate-50 group-hover:border-slate-200">
                      <ChevronRight size={18} strokeWidth={2.5} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredReports.length === 0 && (
           <div className="py-24 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mx-auto border border-slate-100">
                 <Activity size={32} className="text-slate-200" />
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em]">No operational data matches current matrix filters</p>
           </div>
        )}
      </div>
    </div>
  );
};
