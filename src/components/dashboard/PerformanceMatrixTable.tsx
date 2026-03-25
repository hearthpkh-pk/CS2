import React, { useMemo } from 'react';
import { ArrowUpRight, TrendingDown, Minus, ChevronRight, ShieldCheck, AlertTriangle, Activity, LayoutGrid, Eye, Users, TrendingUp, BellRing, CheckCircle2 } from 'lucide-react';
import { DashboardMetricsPayload } from '@/services/dashboardMetricsService';

interface Props {
  matrixData: DashboardMetricsPayload['matrixData'];
  selectedPage: string;
  onSelectPage: (id: string) => void;
  onAcknowledge?: (pageId: string, requestId: string) => void;
}

export const PerformanceMatrixTable: React.FC<Props> = ({
  matrixData, selectedPage, onSelectPage, onAcknowledge
}) => {
  const [metric, setMetric] = React.useState<'views' | 'followers'>('views');
  const [sortBy, setSortBy] = React.useState<'id' | 'desc' | 'asc'>('id');

  const pageStats = useMemo(() => {
    // Sort array based on UI toggles (Growth/Views/Followers calculation already extracted to service payload)
    return [...matrixData].sort((a, b) => {
      const valA = metric === 'views' ? a.views : a.followers;
      const valB = metric === 'views' ? b.views : b.followers;
      if (sortBy === 'desc') return valB - valA;
      if (sortBy === 'asc') return valA - valB;
      const aId = Number(a.boxId) || 0;
      const bId = Number(b.boxId) || 0;
      if (aId !== bId) return aId - bId;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [matrixData, metric, sortBy]);

  const TierBadge = ({ tier }: { tier: 'T1' | 'T2' | 'T3' }) => {
    if (tier === 'T1') return (
      <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-700 font-inter">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]"></div> TIER 1
      </span>
    );
    if (tier === 'T2') return (
      <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-700 font-inter">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.5)]"></div> TIER 2
      </span>
    );
    return (
      <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-700 font-inter">
        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.5)]"></div> TIER 3
      </span>
    );
  };

  if (pageStats.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-[2rem] p-8 mb-10 overflow-hidden relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 tracking-tight font-outfit flex items-center gap-2">
            Performance Matrix
          </h3>
          <p className="text-xs text-slate-400 font-noto mt-1 font-medium">ตารางคัดแยกเพจตามประสิทธิภาพ (Tier 1-3) เชิงเปรียบเทียบจากยอดสูงสุด (Relative Max Performance)</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Metric Toggle */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
            <button
              onClick={() => setMetric('views')}
              className={`p-2 rounded-lg transition-all ${metric === 'views' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="ยอดวิว"
            >
              <Eye size={14} />
            </button>
            <button
              onClick={() => setMetric('followers')}
              className={`p-2 rounded-lg transition-all ${metric === 'followers' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="ผู้ติดตาม"
            >
              <Users size={14} />
            </button>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
            <button
              onClick={() => setSortBy('id')}
              className={`p-2 rounded-lg transition-all ${sortBy === 'id' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="เรียงตามลำดับหน้า (Box ID)"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setSortBy('desc')}
              className={`p-2 rounded-lg transition-all ${sortBy === 'desc' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="เรียงจากมากไปน้อย"
            >
              <TrendingUp size={14} />
            </button>
            <button
              onClick={() => setSortBy('asc')}
              className={`p-2 rounded-lg transition-all ${sortBy === 'asc' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="เรียงจากน้อยไปมาก"
            >
              <TrendingDown size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Page Asset</th>
              <th className="pb-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Classification</th>
              <th className="pb-4 font-bold text-[10px] uppercase tracking-widest text-slate-400 text-right">
                {metric === 'views' ? 'Traffic Volume (Views)' : 'Audience Size (Followers)'}
              </th>
              <th className="pb-4 font-bold text-[10px] uppercase tracking-widest text-slate-400 text-right">WoW Growth</th>
              <th className="pb-4 font-bold text-[10px] uppercase tracking-widest text-slate-400 text-right">MoM Growth</th>
              <th className="pb-4 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 relative">
            {pageStats.map((page, index) => {
              const isSelected = selectedPage === page.id;
              const isDimmed = selectedPage !== 'all' && !isSelected;
              
              return (
                <tr 
                  key={page.id} 
                  className={`group transition-all duration-300 cursor-pointer ${
                    isDimmed 
                      ? 'opacity-40 hover:opacity-100 hover:bg-slate-50/50' 
                      : isSelected 
                        ? 'bg-blue-50/80 hover:bg-blue-100 border-y border-blue-100' 
                        : 'hover:bg-slate-50/50 border-y border-transparent'
                  }`}
                  onClick={() => onSelectPage(isSelected ? 'all' : page.id)}
                >
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 font-outfit group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                      {page.boxId || index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-700 font-noto group-hover:text-blue-600 transition-colors flex items-center gap-2">
                        {page.name}
                        {page.requests && page.requests.some(r => r.status === 'Pending') && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-600 rounded-md text-[9px] font-black uppercase tracking-widest animate-pulse">
                            <BellRing size={10} /> HQ Action Required
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-outfit tracking-wider mt-0.5">{page.followers.toLocaleString()} NEW FOLLOWERS</div>
                      
                      {/* Detailed Flag Alert */}
                      {page.requests && page.requests.some(r => r.status === 'Pending') && (
                        <div className="mt-2 bg-red-50 border border-red-100 rounded-lg p-2.5 flex items-start gap-2 max-w-sm" onClick={(e) => e.stopPropagation()}>
                           <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
                           <div className="flex-1">
                             <p className="text-[11px] font-medium text-red-800 leading-snug">{page.requests.find(r => r.status === 'Pending')?.message}</p>
                             <button 
                               onClick={() => onAcknowledge && onAcknowledge(page.id, page.requests!.find(r => r.status === 'Pending')!.id)}
                               className="mt-1.5 flex items-center gap-1.5 text-[10px] font-bold text-red-600 hover:text-white bg-red-100 hover:bg-red-500 px-3 py-1 rounded-md transition-colors"
                             >
                                <CheckCircle2 size={12} /> ยืนยันรับทราบและจะดำเนินการแก้ไข
                             </button>
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4">
                  <TierBadge tier={page.tier} />
                </td>
                <td className="py-4 pl-4 text-right">
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-sm font-bold text-slate-800 font-outfit">
                      {metric === 'views' ? page.views.toLocaleString() : page.followers.toLocaleString()}
                    </span>
                    <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden flex justify-end border border-slate-200/50">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          metric === 'followers' ? 'bg-sky-400' : 
                          page.tier === 'T1' ? 'bg-emerald-400' : 
                          page.tier === 'T2' ? 'bg-blue-400' : 'bg-rose-400'
                        }`}
                        style={{ width: `${Math.min(metric === 'views' ? page.shareOfMaxViews : page.shareOfMaxFollowers, 100)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-4 pl-8 text-right">
                  <div className={`inline-flex items-center justify-end gap-1.5 text-[11px] font-bold font-inter ${
                    (metric === 'views' ? page.viewsWeeklyGrowth : page.followersWeeklyGrowth) > 0 ? 'text-sky-600' : 
                    (metric === 'views' ? page.viewsWeeklyGrowth : page.followersWeeklyGrowth) < 0 ? 'text-amber-500' : 
                    'text-slate-400'
                  }`}>
                    {(metric === 'views' ? page.viewsWeeklyGrowth : page.followersWeeklyGrowth) > 0 ? <ArrowUpRight size={14} className="opacity-80" /> : 
                     (metric === 'views' ? page.viewsWeeklyGrowth : page.followersWeeklyGrowth) < 0 ? <TrendingDown size={14} className="opacity-80" /> : 
                     <Minus size={14} className="opacity-80" />}
                    {Math.abs(metric === 'views' ? page.viewsWeeklyGrowth : page.followersWeeklyGrowth).toFixed(1)}%
                  </div>
                </td>
                <td className="py-4 pl-4 text-right">
                  <div className={`inline-flex items-center justify-end gap-1.5 text-[11px] font-bold font-inter ${
                    (metric === 'views' ? page.viewsGrowth : page.followersGrowth) > 0 ? 'text-emerald-600' : 
                    (metric === 'views' ? page.viewsGrowth : page.followersGrowth) < 0 ? 'text-rose-500' : 
                    'text-slate-400'
                  }`}>
                    {(metric === 'views' ? page.viewsGrowth : page.followersGrowth) > 0 ? <ArrowUpRight size={14} className="opacity-80" /> : 
                     (metric === 'views' ? page.viewsGrowth : page.followersGrowth) < 0 ? <TrendingDown size={14} className="opacity-80" /> : 
                     <Minus size={14} className="opacity-80" />}
                    {Math.abs(metric === 'views' ? page.viewsGrowth : page.followersGrowth).toFixed(1)}%
                  </div>
                </td>
                <td className="py-4 pl-4 text-right">
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors inline-block" />
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
