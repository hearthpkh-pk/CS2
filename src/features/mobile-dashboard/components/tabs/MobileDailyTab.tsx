import React from 'react';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { MobileHistoryBlock } from '../shared/MobileHistoryBlock';

export const MobileDailyTab = ({ 
  staffData, 
  searchQuery, 
  setSearchQuery, 
  onStaffClick 
}: { 
  staffData: any[], 
  searchQuery: string, 
  setSearchQuery: (q: string) => void, 
  onStaffClick: (staff: any) => void 
}) => {
  const filteredStaff = staffData.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const totalAssigned = staffData.reduce((acc, curr) => acc + curr.totalPages, 0);
  const totalUpdated = staffData.reduce((acc, curr) => acc + curr.updatedToday, 0);
  const progressPercent = totalAssigned > 0 ? Math.round((totalUpdated / totalAssigned) * 100) : 0;

  return (
    <div className="animate-in fade-in duration-300 pb-8 bg-white min-h-full">
      {/* KPI Minimalist */}
      <div className="border-b border-slate-100 px-6 py-8 bg-slate-50 relative overflow-hidden">
        {/* Subtle grid pattern for professional tech feel */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wICA0MEgwVjBIMzkuOTg5VjQwSDBaIiBmaWxsPSJub25lIi8+CjxwYXRoIGQ9Ik0zOS45ODkgNEgwdjFIMzkuOTg5em0wIDhIMHYxSDM5Ljk4OXptMCA4SDB2MUgzOS45ODl6bTAgOEgwdjFIMzkuOTg5em0wIDhIMHYxSDM5Ljk4OXoiIGZpbGw9IiNFMkU4RjAiIGZpbGwtb3BhY2l0eT0iLjMiLz4KPHBhdGggZD0iTTQgMHY0MGgxVjB6bTggMHY0MGgxVjB6bTggMHY0MGgxVjB6bTggMHY0MGgxVjB6bTggMHY0MGgxVjB6IiBmaWxsPSIjRTJFOEYwIiBmaWxsLW9wYWNpdHk9Ii4zIi8+Cjwvc3ZnPg==')] opacity-40 z-0"></div>
        
        <div className="relative z-10">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.25em] font-noto mb-3">Today's Operations</p>
          <div className="flex items-end justify-between">
            <div className="flex gap-4 items-baseline">
               <span className="text-6xl font-light font-outfit tracking-tighter text-[#054ab3] leading-none">{progressPercent}<span className="text-3xl text-[#054ab3]/40 font-normal ml-0.5">%</span></span>
            </div>
            <div className="pb-1.5 text-right">
               <p className="text-sm font-semibold text-slate-700 font-outfit">{totalUpdated} <span className="text-slate-400 font-normal">/ {totalAssigned}</span></p>
               <p className="text-[9px] text-[#054ab3] font-noto uppercase tracking-widest mt-0.5">Processed</p>
            </div>
          </div>
          <div className="w-full h-[3px] bg-slate-200 mt-6 rounded-full relative overflow-hidden">
             <div className="absolute top-0 left-0 h-full bg-[#054ab3] transition-all duration-700 ease-out" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      </div>

      <div className="px-0 py-2">
        {/* Search */}
        <div className="relative mb-2 mt-4 px-6">
          <Search size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search operator..."
            className="w-full bg-transparent border-b border-slate-200 py-2.5 pl-7 pr-4 text-xs font-noto text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 transition-all rounded-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="mt-4 flex px-6 justify-between items-center mb-1">
           <h3 className="text-[10px] font-bold text-slate-500 font-outfit tracking-[0.2em] uppercase">Operator Status</h3>
           <span className="text-[10px] font-bold text-slate-400 font-noto uppercase">History (3D)</span>
        </div>

        {/* List */}
        <div className="text-slate-800">
           {filteredStaff.map((staff) => {
              const hasNoPages = staff.totalPages === 0;

              return (
                 <button 
                  key={staff.id}
                  onClick={() => onStaffClick(staff)}
                  className="w-full flex items-center justify-between py-4 px-6 border-b border-slate-100/80 hover:bg-slate-50 transition-colors text-left group stroke-white"
                 >
                    <div className="flex items-center gap-4">
                       <span className="w-8 text-center text-[10px] font-black font-outfit text-slate-400 group-hover:text-[#054ab3] transition-colors bg-slate-50 py-1.5 rounded">{staff.avatar}</span>
                       <div>
                         <h4 className="font-semibold text-[13px] text-slate-900 font-noto tracking-tight leading-tight">{staff.name}</h4>
                         <p className="text-[10px] text-slate-400 font-outfit mt-0.5 tracking-wide">
                            {hasNoPages ? 'NO ASSIGNED PAGES' : <span className="text-[#054ab3] font-bold">{staff.totalPages} ACTIVE PAGES</span>}
                         </p>
                       </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1.5">
                        {staff.history.map((h: any, idx: number) => (
                           <MobileHistoryBlock key={idx} day={h.dayNameShort[0]} status={h.status} isToday={idx === 2} />
                        ))}
                      </div>
                    </div>
                 </button>
              )
           })}
        </div>
      </div>
    </div>
  );
};
