import React from 'react';
import { cn } from '@/lib/utils';
import { HQDashboardMetrics } from '@/features/hq-dashboard/services/hqDashboardService';
import { PieChart, Briefcase } from 'lucide-react';

export const MobileMonthlyTab = ({ sharedMetrics, staffData }: { sharedMetrics: HQDashboardMetrics, staffData: any[] }) => {
  const formatter = new Intl.NumberFormat('en', { notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 1 });
  const totalCorpViews = sharedMetrics.actualTotalViews;
  const attainmentScore = Math.min(sharedMetrics.attainmentPercentage, 100);

  return (
    <div className="animate-in fade-in duration-300 pb-8 bg-slate-50 min-h-full">
      {/* Analytics Hero */}
      <div className="bg-white mx-4 mt-6 rounded-[1.5rem] p-6 shadow-sm border border-slate-100">
        <div className="relative z-10">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] font-outfit mb-4">Enterprise Analytics</h3>
          <p className="text-5xl font-extrabold font-outfit tracking-tighter text-slate-800 leading-none mb-2">
            {formatter.format(totalCorpViews)}
          </p>
          <p className="text-[10px] font-medium text-slate-400 font-noto">Total Corporate Views (MTD)</p>
        </div>
        <div className="relative z-10 mt-6">
          <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            <span>Target Progress</span>
            <span className="text-slate-700">{attainmentScore.toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-1">
            <div 
              className={cn("h-full transition-all duration-1000 ease-in-out rounded-full", attainmentScore >= 100 ? "bg-emerald-500" : "bg-[#054ab3]")}
              style={{ width: `${attainmentScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-4">
        {/* CATEGORY PERFORMANCE */}
        <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <PieChart size={14} className="text-slate-400" strokeWidth={1.5} />
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category Analytics</h3>
          </div>
          
          <div className="flex flex-row items-center justify-between">
            <div className="flex-1 flex flex-col space-y-1 pr-8 border-r border-slate-50">
              {sharedMetrics.categoryPerformance.map((cat, idx) => {
                const totalViewsInScope = sharedMetrics.actualTotalViews || 1; 
                const percent = (cat.totalViews / totalViewsInScope) * 100;
                const colorClass = idx === 0 ? "bg-[#054ab3]" : idx === 1 ? "bg-[#054ab3]/80" : idx === 2 ? "bg-[#054ab3]/60" : "bg-slate-300";
                
                return (
                  <div key={idx} className="flex flex-col gap-1 py-2 px-1 border-b border-slate-50 last:border-0">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", colorClass)}></div>
                        <div>
                          <span className="text-xs font-bold text-slate-700 font-prompt">{cat.category}</span>
                          <div className="text-[9px] font-medium text-slate-400 mt-0.5">
                            {cat.pageCount} Pages • {percent.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-outfit font-bold text-slate-800">{(cat.totalViews / 1000000).toFixed(1)}<span className="text-[9px] text-slate-400 ml-0.5">M</span></span>
                        <div className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">
                          Avg {(cat.avgViewsPerPage / 1000).toFixed(0)}k
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {sharedMetrics.categoryPerformance.length === 0 && (
                <div className="text-xs text-slate-400 italic py-2">No data available</div>
              )}
            </div>

            {/* Donut Chart */}
            {sharedMetrics.categoryPerformance.length > 0 && (
              <div className="w-[100px] h-[100px] flex items-center justify-center relative shrink-0 ml-4">
                <svg width="100%" height="100%" viewBox="0 0 42 42" className="overflow-visible">
                  <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f8fafc" strokeWidth="4" />
                  {(() => {
                    let cumulative = 0;
                    return sharedMetrics.categoryPerformance.map((cat, idx) => {
                      const totalViewsInScope = sharedMetrics.actualTotalViews || 1;
                      const percent = (cat.totalViews / totalViewsInScope) * 100;
                      cumulative += percent;
                      const offset = 100 - cumulative + percent;
                      const color = idx === 0 ? '#054ab3' : idx === 1 ? '#054ab3cc' : idx === 2 ? '#054ab399' : '#cbd5e1';
                      return (
                        <circle
                          key={idx}
                          cx="21" cy="21" r="15.91549430918954" fill="transparent"
                          stroke={color} strokeWidth="4"
                          strokeDasharray={`${percent} ${100 - percent}`}
                          strokeDashoffset={offset} transform="rotate(-90 21 21)"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-0.5">
                  <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest leading-none">Views</span>
                  <span className="text-xs font-outfit font-black text-slate-800 leading-none mt-0.5">{(sharedMetrics.actualTotalViews / 1000000).toFixed(1)}<span className="text-[7px] text-slate-400 ml-0.5">M</span></span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BRAND PERFORMANCE */}
        <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase size={14} className="text-slate-400" strokeWidth={1.5} />
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Brand Analytics</h3>
          </div>
          
          <div className="flex flex-row items-center justify-between">
            <div className="flex-1 flex flex-col space-y-1 pr-8 border-r border-slate-50">
              {sharedMetrics.brandPerformance.map((brandData, idx) => {
                const totalViewsInScope = sharedMetrics.actualTotalViews || 1; 
                const percent = (brandData.totalViews / totalViewsInScope) * 100;
                const colorClass = idx === 0 ? "bg-indigo-600" : idx === 1 ? "bg-indigo-400" : idx === 2 ? "bg-indigo-300" : "bg-indigo-200";
                
                return (
                  <div key={idx} className="flex flex-col gap-1 py-2 px-1 border-b border-slate-50 last:border-0">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", colorClass)}></div>
                        <div>
                          <span className="text-xs font-bold text-slate-700 font-prompt">{brandData.brand}</span>
                          <div className="text-[9px] font-medium text-slate-400 mt-0.5">
                            {brandData.staffCount} Staffs • {percent.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-outfit font-bold text-slate-800">{(brandData.totalViews / 1000000).toFixed(1)}<span className="text-[9px] text-slate-400 ml-0.5">M</span></span>
                        <div className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">
                          Avg {(brandData.avgViewsPerStaff / 1000).toFixed(0)}k
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {sharedMetrics.brandPerformance.length === 0 && (
                <div className="text-xs text-slate-400 italic py-2">No brand data available</div>
              )}
            </div>

            {/* Donut Chart */}
            {sharedMetrics.brandPerformance.length > 0 && (
              <div className="w-[100px] h-[100px] flex items-center justify-center relative shrink-0 ml-4">
                <svg width="100%" height="100%" viewBox="0 0 42 42" className="overflow-visible">
                  <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f8fafc" strokeWidth="4" />
                  {(() => {
                    let cumulative = 0;
                    return sharedMetrics.brandPerformance.map((brandData, idx) => {
                      const totalViewsInScope = sharedMetrics.actualTotalViews || 1;
                      const percent = (brandData.totalViews / totalViewsInScope) * 100;
                      cumulative += percent;
                      const offset = 100 - cumulative + percent;
                      const color = idx === 0 ? '#4f46e5' : idx === 1 ? '#818cf8' : idx === 2 ? '#a5b4fc' : '#c7d2fe';
                      return (
                        <circle
                          key={idx}
                          cx="21" cy="21" r="15.91549430918954" fill="transparent"
                          stroke={color} strokeWidth="4"
                          strokeDasharray={`${percent} ${100 - percent}`}
                          strokeDashoffset={offset} transform="rotate(-90 21 21)"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-0.5">
                  <span className="text-[7px] font-bold text-indigo-400 uppercase tracking-widest leading-none">Views</span>
                  <span className="text-xs font-outfit font-black text-slate-800 leading-none mt-0.5">{(sharedMetrics.actualTotalViews / 1000000).toFixed(1)}<span className="text-[7px] text-slate-400 ml-0.5">M</span></span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 mt-2 space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-bold text-slate-500 font-outfit tracking-widest uppercase">Executive Leaderboard</h3>
        </div>
        <div className="flex flex-col gap-3">
          {[...staffData].sort((a,b) => b.monthlyViewsSum - a.monthlyViewsSum).map((staff, idx) => (
            <div key={staff.id} className="w-full flex items-center justify-between p-4 bg-white rounded-[1rem] border border-slate-100 shadow-sm transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-6 font-black text-xs font-outfit text-slate-300">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <div>
                  <h4 className="font-bold text-[13px] text-slate-800 font-prompt leading-tight">{staff.name}</h4>
                  <p className="text-[9px] text-slate-400 font-outfit uppercase tracking-widest mt-1">{staff.role}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-base font-bold text-slate-700 font-outfit">{staff.monthlyViewsStr}</p>
                <p className="text-[9px] text-slate-400 font-medium tracking-wider uppercase mt-0.5">Views</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
