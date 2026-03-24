import React, { useMemo } from 'react';
import { Page, DailyLog, User } from '@/types';
import { Target, TrendingUp, AlertTriangle, ShieldCheck, ArrowRight, DollarSign, Lightbulb, PenLine } from 'lucide-react';

interface Props {
  pages: Page[];
  logs: DailyLog[];
  selectedYear: string;
  selectedMonth: string;
  currentUser: User;
  onSelectPage: (id: string) => void;
  onNavigateToTask: () => void;
}

export const ExecutiveQuotaBrief: React.FC<Props> = ({
  pages, logs, selectedYear, selectedMonth, currentUser, onSelectPage, onNavigateToTask
}) => {
  // Use a hardcoded mock policy for now. In reality, this would be fetched from super admin settings.
  const policy = {
    minViewTarget: 10000000,
    penaltyAmount: 2000,
    bonusStep1: 1000,
    superBonusThreshold: 100000000,
    bonusStep2: 1500,
  };

  const { totalViews, attainment, projectedStatus, topPage, criticalPage, projectedMoney } = useMemo(() => {
    // 1. Filter logs for the current selected month/year
    const currentMonthLogs = logs.filter(l => {
      const parts = l.date.split('-');
      const lYear = parts[0];
      const lMonth = parts[1];
      const inYear = lYear === selectedYear;
      const inMonth = selectedMonth === 'all' ? true : lMonth === selectedMonth;
      return inYear && inMonth;
    });

    // 2. Aggregate total views
    const totalViews = currentMonthLogs.reduce((acc, log) => acc + Number(log.views || 0), 0);
    const attainment = Math.min((totalViews / policy.minViewTarget) * 100, 200); // UI cap at 200%

    // 3. Determine RAG status & Financials
    let projectedStatus: 'RED' | 'AMBER' | 'GREEN' = 'RED';
    let projectedMoney = 0;

    if (totalViews < policy.minViewTarget) {
      projectedStatus = totalViews >= (policy.minViewTarget * 0.5) ? 'AMBER' : 'RED';
      projectedMoney = -policy.penaltyAmount; // Penalty
    } else {
      projectedStatus = 'GREEN';
      // Commission calculation
      if (totalViews >= policy.superBonusThreshold) {
        projectedMoney = Math.floor(totalViews / 10000000) * policy.bonusStep2;
      } else {
        projectedMoney = Math.floor(totalViews / 10000000) * policy.bonusStep1;
      }
    }

    // 4. Portfolio Health (Top Performer & Critical)
    const pageViews: Record<string, number> = {};
    pages.forEach(p => pageViews[p.id] = 0);
    currentMonthLogs.forEach(l => {
      if (pageViews[l.pageId] !== undefined) {
        pageViews[l.pageId] += Number(l.views || 0);
      }
    });

    const sortedPages = [...pages].sort((a, b) => (pageViews[b.id] || 0) - (pageViews[a.id] || 0));
    const topPage = sortedPages[0];
    const criticalPage = sortedPages[sortedPages.length - 1];

    return { totalViews, attainment, projectedStatus, topPage, criticalPage, projectedMoney };
  }, [pages, logs, selectedYear, selectedMonth, policy]);

  // UI Colors based on RAG Status
  const statusIcons = {
    RED: <AlertTriangle size={24} />,
    AMBER: <AlertTriangle size={24} />,
    GREEN: <ShieldCheck size={24} />,
  };

  return (
    <div className="mb-10 animate-fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Quota Attainment (Takes up 2 cols on lg) */}
        <div className="lg:col-span-2 p-8 rounded-[2rem] border border-slate-100 shadow-sm bg-white relative overflow-hidden transition-all group">

          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                <Target size={14} /> Monthly Quota Attainment
              </h3>
              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight font-outfit group-hover:text-blue-600 transition-colors">
                  {totalViews.toLocaleString()} <span className="text-sm text-slate-400 font-medium">/ {(policy.minViewTarget).toLocaleString()} Views</span>
                </h2>
              </div>
            </div>
            <div className={`p-3 rounded-2xl ${projectedStatus === 'GREEN' ? 'bg-emerald-50 text-emerald-500' :
                projectedStatus === 'AMBER' ? 'bg-amber-50 text-amber-500' : 'bg-red-50 text-red-500'
              }`}>
              {statusIcons[projectedStatus]}
            </div>
          </div>

          <div className="relative z-10">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
              <span className="text-slate-500">Progress</span>
              <span className="text-slate-800">{attainment.toFixed(1)}%</span>
            </div>

            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${projectedStatus === 'GREEN' ? 'bg-emerald-500' :
                    projectedStatus === 'AMBER' ? 'bg-amber-400' : 'bg-red-500'
                  }`}
                style={{ width: `${Math.min(attainment, 100)}%` }}
              />
            </div>
          </div>

          {/* Financial Projection Bar */}
          <div className="mt-8 p-4 rounded-2xl border border-slate-100 flex items-center justify-between bg-slate-50 relative overflow-hidden">
            <div className="flex items-center gap-3 relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${projectedStatus === 'GREEN' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                }`}>
                <DollarSign size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Projected Financials</span>
                <span className="text-sm font-bold font-noto text-slate-800">
                  {projectedMoney < 0 ? 'เสี่ยงถูกหักเงินจากฐานเงินเดือน (Penalty)' : 'ค่าคอมมิชชั่นสะสม (Commission)'}
                </span>
              </div>
            </div>
            <div className="text-right relative z-10">
              <span className={`text-lg font-bold font-outfit ${projectedMoney < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                {projectedMoney > 0 ? '+' : ''}{projectedMoney.toLocaleString()} THB
              </span>
            </div>
          </div>

          {/* Executive Advisory & Action CTA */}
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <Lightbulb size={12} className="text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Strategic Insight</span>
              </div>
              <p className="text-xs text-slate-500 font-noto leading-relaxed max-w-sm">
                การเร่งสร้างฐานผู้ชมในช่วง <span className="font-bold text-slate-700">ต้นเดือน</span> จะเพิ่มโอกาสเก็บยอดสะสม (Compound Reach) ก่อนสิ้นเดือน แนะนำให้อัปเดตสถิติสม่ำเสมอเพื่อประเมินเทรนด์
              </p>
            </div>

            <button
              onClick={onNavigateToTask}
              className="bg-white border border-slate-200 text-slate-600 shrink-0 px-5 py-3 rounded-[1rem] text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 hover:text-slate-800 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <PenLine size={14} className="text-slate-400" /> Update views
            </button>
          </div>
        </div>

        {/* Right Column: Portfolio Health Summary */}
        <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl shadow-slate-200/20 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <TrendingUp size={14} className="text-blue-400" /> Portfolio Health
            </h3>

            <div className="space-y-5">
              {/* Top Performer */}
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1 block">Top Performing Asset</span>
                <div
                  onClick={() => topPage && onSelectPage(topPage.id)}
                  className="flex justify-between items-center group cursor-pointer bg-white/5 p-3 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <span className="text-sm font-bold font-noto truncate pr-2 flex-1 group-hover:text-emerald-300 transition-colors">{topPage?.name || 'N/A'}</span>
                  <ArrowRight size={14} className="text-slate-500 group-hover:text-white transition-colors" />
                </div>
              </div>

              <div className="w-full h-px bg-white/10"></div>

              {/* Critical Watchlist */}
              <div>
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1 block">Critical Watchlist</span>
                <div
                  onClick={() => criticalPage && onSelectPage(criticalPage.id)}
                  className="flex justify-between items-center group cursor-pointer bg-red-500/5 p-3 rounded-xl border border-red-500/10 hover:bg-red-500/10 transition-colors"
                >
                  <span className="text-sm font-bold font-noto text-red-200 truncate pr-2 flex-1 group-hover:text-red-300 transition-colors">{criticalPage?.name || 'N/A'}</span>
                  <ArrowRight size={14} className="text-red-500/50 group-hover:text-red-400 transition-colors" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/5">
            <span className="text-[9px] text-slate-500 font-noto leading-relaxed block">
              ระบบสกัดข้อมูล Insight เฉพาะหน้าต่างเวลาปัจจุบัน เพื่อใช้ประกอบการตัดสินใจ (Executive Summary)
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
