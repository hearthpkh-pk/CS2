import React from 'react';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { MobileHistoryBlock } from '@/features/mobile-dashboard/components/shared/MobileHistoryBlock';

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
    <div className="animate-in fade-in duration-300 pb-8 bg-slate-50 min-h-full">
      {/* KPI Minimalist */}
      <div className="bg-white mx-4 mt-6 rounded-[1.5rem] p-6 shadow-sm relative overflow-hidden border border-slate-100">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] font-outfit">Today's Operations</h3>
          </div>
          <div className="flex items-end justify-between">
            <div className="flex gap-2 items-baseline">
               <span className="text-5xl font-extrabold font-outfit tracking-tighter text-slate-800 leading-none">{progressPercent}<span className="text-2xl text-slate-400 font-bold ml-1">%</span></span>
            </div>
            <div className="pb-1 text-right">
               <p className="text-sm font-bold text-slate-700 font-outfit">{totalUpdated} <span className="text-slate-400 font-medium">/ {totalAssigned}</span></p>
               <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest mt-1">Processed</p>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-100 mt-5 rounded-full relative overflow-hidden">
             <div className="absolute top-0 left-0 h-full bg-[#054ab3] transition-all duration-1000 ease-out rounded-full" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search operator..."
            className="w-full bg-white border border-slate-200 py-3 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all rounded-xl shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex justify-between items-center px-1">
           <h3 className="text-[10px] font-bold text-slate-500 font-outfit tracking-widest uppercase">Operator Status</h3>
           <span className="text-[9px] font-bold text-slate-400 font-outfit uppercase tracking-widest">History (3D)</span>
        </div>

        {/* List */}
        <div className="flex flex-col gap-3">
           {filteredStaff.map((staff) => {
              const hasNoPages = staff.totalPages === 0;

              return (
                 <button 
                  key={staff.id}
                  onClick={() => onStaffClick(staff)}
                  className="w-full flex items-center justify-between p-4 bg-white rounded-[1rem] border border-slate-100 shadow-sm hover:shadow-md transition-all text-left group"
                 >
                    <div className="flex items-center gap-3">
                       <span className="w-10 h-10 flex items-center justify-center text-sm font-black font-outfit text-slate-500 bg-slate-50 border border-slate-100 rounded-full group-hover:bg-[#054ab3] group-hover:text-white transition-colors">{staff.avatar}</span>
                       <div>
                         <h4 className="font-bold text-[13px] text-slate-800 font-prompt leading-tight">{staff.name}</h4>
                         <p className="text-[10px] text-slate-400 font-outfit mt-1 tracking-wide">
                            {hasNoPages ? 'NO ASSIGNED PAGES' : <span className="text-emerald-500 font-bold">{staff.totalPages} ACTIVE PAGES</span>}
                         </p>
                       </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1">
                        {staff.history.map((h: any, idx: number) => (
                           <MobileHistoryBlock key={idx} day={h.dayNameShort[0]} status={h.status} isToday={idx === 2} />
                        ))}
                      </div>
                    </div>
                 </button>
              )
           })}
           {filteredStaff.length === 0 && (
              <div className="text-center py-8 text-sm text-slate-400 italic">No operators found</div>
           )}
        </div>
      </div>
    </div>
  );
};
