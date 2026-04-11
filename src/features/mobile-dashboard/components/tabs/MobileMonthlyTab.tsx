import React from 'react';
import { cn } from '@/lib/utils';
import { HQDashboardMetrics } from '@/features/hq-dashboard/services/hqDashboardService';

export const MobileMonthlyTab = ({ sharedMetrics, staffData }: { sharedMetrics: HQDashboardMetrics, staffData: any[] }) => {
  const formatter = new Intl.NumberFormat('en', { notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 1 });
  const totalCorpViews = sharedMetrics.actualTotalViews;
  const attainmentScore = Math.min(sharedMetrics.attainmentPercentage, 100);

  return (
    <div className="animate-in fade-in duration-300 pb-8 bg-white min-h-full">
      {/* Analytics Hero */}
      <div className="border-b border-slate-100 px-6 py-8 bg-slate-50 relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.25em] font-noto mb-3">Enterprise Analytics</h3>
          <p className="text-6xl font-light font-outfit tracking-tighter text-slate-900 leading-none mb-1">
            {formatter.format(totalCorpViews)}
          </p>
          <p className="text-[10px] font-medium text-slate-400 font-noto">Total Corporate Views (MTD)</p>
        </div>
        <div className="relative z-10 mt-8">
          <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            <span>Target Progress</span>
            <span className="text-slate-700">{attainmentScore.toFixed(1)}%</span>
          </div>
          <div className="h-[2px] w-full bg-slate-200 rounded-none overflow-hidden pb-1 mb-2">
            <div 
              className={cn("h-full transition-all duration-1000 ease-in-out", attainmentScore >= 100 ? "bg-emerald-600" : "bg-slate-800")}
              style={{ width: `${attainmentScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-[10px] font-bold text-slate-400 font-outfit tracking-[0.2em] uppercase">Executive Leaderboard</h3>
        </div>
        <div className="space-y-0">
          {[...staffData].sort((a,b) => b.monthlyViewsSum - a.monthlyViewsSum).map((staff, idx) => (
            <div key={staff.id} className="py-4 border-b border-slate-100/80 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-5 font-black text-[13px] font-outfit text-right", 
                  idx === 0 ? 'text-slate-900' : 'text-slate-300'
                )}>
                  {idx + 1}.
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-[13px] font-noto tracking-tight leading-tight">{staff.name}</h4>
                  <p className="text-[9px] text-slate-400 font-noto uppercase tracking-widest mt-0.5">{staff.role}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-base font-medium text-slate-900 font-outfit">{staff.monthlyViewsStr}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
