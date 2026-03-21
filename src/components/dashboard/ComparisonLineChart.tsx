'use client';

import React, { useMemo } from 'react';
import { Page, DailyLog } from '@/types';
import { TrendingUp, TrendingDown, LayoutGrid, Eye, Users } from 'lucide-react';

interface Props {
  pages: Page[];
  logs: DailyLog[];
  selectedYear: string;
  selectedMonth: string;
  selectedPage?: string;
}

interface RankingDataset {
  id?: string;
  label: string;
  color: string;
  data: number[];
  followers: number;
  boxId?: string | number;
  profilePic?: string;
}

const shortThaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

const lineColors = [
  '#0f172a', '#1e40af', '#2563eb', '#0284c7',
  '#3b82f6', '#0891b2', '#0e7490', '#0d9488',
  '#2dd4bf', '#38bdf8', '#1e3a8a', '#1e293b',
];

export const ComparisonLineChart = ({
  pages, logs, selectedYear, selectedMonth, selectedPage
}: Props) => {
  // Default to Box ID sorting as requested
  const [sortBy, setSortBy] = React.useState<'id' | 'desc' | 'asc'>('id');
  const [metric, setMetric] = React.useState<'views' | 'followers'>('views');

  const chartData = useMemo(() => {
    const activePages = pages.filter(p => !p.isDeleted);

    const allFilteredLogs = logs.filter(l => {
      const parts = l.date.split('-');
      if (parts.length < 3) return false;
      const lYear = parts[0];
      const lMonth = parts[1];
      const inYear = lYear === selectedYear;
      const inMonth = selectedMonth === 'all' ? true : lMonth === selectedMonth;
      return inYear && inMonth;
    });

    const uniqueDates = Array.from(new Set(allFilteredLogs.map(l => l.date))).sort((a, b) => a.localeCompare(b));

    const datasets: RankingDataset[] = activePages.map((page, idx) => {
      const pageLogs = allFilteredLogs.filter(l => l.pageId === page.id);

      // If 'all' months is selected, we want the SUM of all 12 months (the whole year)
      if (selectedMonth === 'all') {
        const totalYearViews = pageLogs.reduce((acc, l) => acc + Number(l.views), 0);
        const peakFollowers = pageLogs.reduce((max, l) => Math.max(max, Number(l.followers || 0)), 0);

        return {
          id: page.id,
          label: page.name,
          color: lineColors[idx % lineColors.length],
          data: [totalYearViews],
          followers: peakFollowers,
          boxId: page.boxId,
          profilePic: page.facebookData?.profilePic
        };
      }

      // If a specific month is selected, we want the SUM of only that month
      const monthLogs = pageLogs.filter(l => l.date.split('-')[1] === selectedMonth);
      const totalMonthViews = monthLogs.reduce((acc, l) => acc + Number(l.views), 0);
      const peakFollowers = monthLogs.reduce((max, l) => Math.max(max, Number(l.followers || 0)), 0);

      return {
        id: page.id,
        label: page.name,
        color: lineColors[idx % lineColors.length],
        data: [totalMonthViews],
        followers: peakFollowers,
        boxId: page.boxId,
        profilePic: page.facebookData?.profilePic
      };
    });

    const dates = selectedMonth === 'all'
      ? Array.from({ length: 12 }).map((_, i) => `${selectedYear}-${(i + 1).toString().padStart(2, '0')}-01`)
      : uniqueDates;

    return { dates, datasets };
  }, [pages, logs, selectedYear, selectedMonth]);

  const chartDataTyped = chartData as { dates: string[], datasets: RankingDataset[] };

  if (chartDataTyped.dates.length === 0) return (
    <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm mt-8 flex items-center justify-center text-slate-400 font-thai font-medium uppercase tracking-widest text-[10px]">
      ยังไม่มีข้อมูลสำหรับช่วงเวลานี้
    </div>
  );

  return (
    <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 border border-slate-100 shadow-sm mt-8 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="w-full md:w-auto text-center md:text-left">
          <h3 className="text-lg font-medium text-slate-800 font-outfit uppercase tracking-wide">รายงานประสิทธิภาพเพจ</h3>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">เปรียบเทียบประสิทธิภาพระหว่างทุกช่องทาง</p>
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
              title="Sort by Box ID"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setSortBy('desc')}
              className={`p-2 rounded-lg transition-all ${sortBy === 'desc' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="Sort Highest"
            >
              <TrendingUp size={14} />
            </button>
            <button
              onClick={() => setSortBy('asc')}
              className={`p-2 rounded-lg transition-all ${sortBy === 'asc' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="Sort Lowest"
            >
              <TrendingDown size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {chartDataTyped.datasets
          .sort((a, b) => {
            const valA = metric === 'views' ? a.data.reduce((acc, v) => acc + v, 0) : a.followers;
            const valB = metric === 'views' ? b.data.reduce((acc, v) => acc + v, 0) : b.followers;
            if (sortBy === 'desc') return valB - valA;
            if (sortBy === 'asc') return valA - valB;
            const aId = Number(a.boxId) || 0;
            const bId = Number(b.boxId) || 0;
            if (aId !== bId) return aId - bId;
            return a.label.localeCompare(b.label);
          })
          .map((ds, idx) => {
            const total = metric === 'views' ? ds.data.reduce((acc, v) => acc + v, 0) : ds.followers;
            const maxTotal = Math.max(...chartDataTyped.datasets.map(d => metric === 'views' ? d.data.reduce((acc, v) => acc + v, 0) : d.followers), 1);
            const percentage = (total / maxTotal) * 100;
            const isSelected = ds.id === selectedPage;
            const isAnySelected = selectedPage !== 'all';
            const showAsMuted = isAnySelected && !isSelected;

            return (
              <div
                key={idx}
                className={`flex items-center gap-4 py-2 transition-all duration-300 ${showAsMuted ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'
                  }`}
              >
                <span className={`text-[10px] font-black w-5 font-inter ${isSelected ? 'text-blue-600' : 'text-slate-300'}`}>
                  {(idx + 1).toString().padStart(2, '0')}
                </span>

                <div className={`w-8 h-8 rounded-lg bg-slate-50 flex-shrink-0 overflow-hidden border transition-all duration-300 ${isSelected ? 'border-blue-300 scale-105 shadow-sm' : 'border-slate-100'}`}>
                  {ds.id?.startsWith('demo-') ? (
                    <div className={`w-full h-full flex items-center justify-center text-xs font-black ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                      {ds.boxId}
                    </div>
                  ) : ds.profilePic ? (
                    <img src={ds.profilePic} alt={ds.label} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[8px] text-slate-400 font-bold uppercase">PAGE</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <div className="flex flex-col">
                      <span className={`text-[11px] font-bold uppercase tracking-tight truncate font-outfit ${isSelected ? 'text-blue-700' : 'text-slate-600'}`}>
                        {ds.label}
                      </span>
                      {isAnySelected && isSelected && <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest font-thai-premium">เพจที่กำลังเลือก</span>}
                    </div>
                    <span className={`text-[10px] font-black font-inter ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                      {total.toLocaleString()} <span className="text-[8px] font-bold opacity-60 font-thai-premium">{metric === 'views' ? 'ยอดวิวรวม' : 'ผู้ติดตาม'}</span>
                    </span>
                  </div>

                  <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/30">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${isSelected ? 'bg-blue-600' : (isAnySelected ? 'bg-slate-300' : 'bg-blue-500/80')
                        }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
