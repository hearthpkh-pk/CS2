'use client';

import React, { useMemo } from 'react';
import { Users, Eye, Filter, Calendar, Activity, RefreshCw } from 'lucide-react';
import { Page, DailyLog, User } from '@/types';
import { PerformanceChart } from './PerformanceChart';
import { ComparisonLineChart } from './ComparisonLineChart';
import { ActivePagesSection } from './ActivePagesSection';
import { buildFakeDatabase } from '@/data/mockDashboardData';

interface Props {
  pages: Page[];
  logs: DailyLog[];
  selectedPage: string;
  setSelectedPage: (id: string) => void;
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
  selectedYear: string;
  setSelectedYear: (y: string) => void;
  onNavigateToTask: () => void;
  currentUser: User;
  onSyncPage?: (id: string, url: string) => void;
  allPages: Page[]; 
  allLogs: DailyLog[]; 
}

const thaiMonths = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

export const DashboardView = ({
  pages, logs, selectedPage, setSelectedPage,
  selectedMonth, setSelectedMonth, selectedYear, setSelectedYear,
  onNavigateToTask, currentUser, onSyncPage,
  allPages, allLogs
}: Props) => {
  const [isDemoMode, setIsDemoMode] = React.useState(false);

  // --- Real vs Fake Database Interception ---
  const { fakePages, fakeLogs } = useMemo(() => buildFakeDatabase(selectedYear), [selectedYear]);
  
  const workingPages = isDemoMode ? fakePages : pages;
  const workingLogs = isDemoMode ? fakeLogs : logs;
  const workingAllPages = isDemoMode ? fakePages : allPages;
  const workingAllLogs = isDemoMode ? fakeLogs : allLogs;

  const chartData = useMemo(() => {
    const relevantPages = selectedPage === 'all' ? workingPages : workingPages.filter(p => p.id === selectedPage);
    const relevantPageIds = relevantPages.map(p => p.id);

    let filteredLogs = workingLogs.filter(l => {
      // Use string splitting to avoid UTC shift issues
      const parts = l.date.split('-');
      const lYear = parts[0];
      const lMonth = parts[1];
      const inYear = lYear === selectedYear;
      const inMonth = selectedMonth === 'all' ? true : lMonth === selectedMonth;
      return relevantPageIds.includes(l.pageId) && inYear && inMonth;
    });

    filteredLogs.sort((a, b) => a.date.localeCompare(b.date));

    if (selectedMonth === 'all') {
      // Group by Month (1-12) - Pre-populate for January START
      const monthly: Record<string, { date: string; views: number; pageFollowers: Record<string, number>; count: number }> = {};
      for (let i = 0; i < 12; i++) {
        const key = `${selectedYear}-${(i + 1).toString().padStart(2, '0')}-01`;
        monthly[key] = { date: key, views: 0, pageFollowers: {}, count: 0 };
      }
      filteredLogs.forEach(log => {
        // Timezone-safe month extraction using string parts instead of Date object
        const monthPart = log.date.split('-')[1];
        const key = `${selectedYear}-${monthPart}-01`;
        if (monthly[key]) {
          monthly[key].views += Math.floor(Number(log.views));
          // Track the maximum follower count for EACH page in this month
          monthly[key].pageFollowers[log.pageId] = Math.max(
            monthly[key].pageFollowers[log.pageId] || 0,
            Math.floor(Number(log.followers))
          );
          monthly[key].count += 1;
        }
      });
      return Object.values(monthly)
        .filter(g => g.count > 0) // Strip out future/unreached months with no data
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(g => {
          // Sum the peak followers of all pages in this month
          const followersSum = Object.values(g.pageFollowers).reduce((acc, val) => acc + val, 0);
          return {
            date: g.date,
            views: g.views,
            followers: followersSum
          };
        });
    }

    // Daily grouping
    const grouped: Record<string, { date: string; views: number; pageFollowers: Record<string, number> }> = {};
    filteredLogs.forEach(log => {
      if (!grouped[log.date]) grouped[log.date] = { date: log.date, views: 0, pageFollowers: {} };
      grouped[log.date].views += Math.floor(Number(log.views));
      // Track the maximum follower count for EACH page in this specific day (in case of multiple daily logs)
      grouped[log.date].pageFollowers[log.pageId] = Math.max(
        grouped[log.date].pageFollowers[log.pageId] || 0,
        Math.floor(Number(log.followers))
      );
    });

    return Object.values(grouped)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(g => {
        // Sum the daily peak followers of all pages
        const followersSum = Object.values(g.pageFollowers).reduce((acc, val) => acc + val, 0);
        return {
          date: g.date,
          views: g.views,
          followers: followersSum
        };
      });
  }, [workingPages, workingLogs, selectedPage, selectedMonth, selectedYear]);

  const totals = useMemo(() => {
    // Derive directly from chartData — diagnostic proved this produces identical results
    // to the ComparisonLineChart's per-page aggregation
    const totalViews = chartData.reduce((acc, d) => acc + d.views, 0);
    const currentFollowers = chartData.length > 0 ? chartData[chartData.length - 1].followers : 0;
    const prevViews = Math.floor(totalViews * 0.85);

    return {
      views: Math.floor(totalViews),
      prevViews: Math.floor(prevViews),
      followers: Math.floor(currentFollowers)
    };
  }, [chartData]);

  const showSubmissionPrompt = true; // Forcing true for V2 data storytelling clarity across all roles

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 border-b border-slate-100 pb-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-slate-800 font-outfit tracking-tight">
            Dashboard
          </h2>
          <div className="flex items-center gap-2 text-slate-400 font-noto text-[10px] uppercase tracking-widest font-bold">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
            รายงานข้อมูลเพจ
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Data Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto">
            <button
              onClick={() => setIsDemoMode(false)}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${!isDemoMode ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
            >
              Real
            </button>
            <button
              onClick={() => setIsDemoMode(true)}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${isDemoMode ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
            >
              Mockup
            </button>
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 w-full sm:w-auto">
            <Filter size={14} className="text-slate-300" />
            <select value={selectedPage} onChange={e => setSelectedPage(e.target.value)} className="bg-transparent text-slate-700 text-xs font-semibold font-noto outline-none flex-1">
              <option value="all">ทุกเพจ</option>
              {workingPages.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 w-full sm:w-auto">
            <Calendar size={14} className="text-slate-300" />
            <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="bg-transparent text-slate-700 text-xs font-semibold font-noto outline-none">
              <option value="all">ทุกเดือน</option>
              {thaiMonths.map((m, i) => <option key={i} value={(i + 1).toString().padStart(2, '0')}>{m}</option>)}
            </select>
            <div className="w-px h-3 bg-slate-100"></div>
            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="bg-transparent text-slate-700 text-xs font-semibold font-noto outline-none">
              <option value="2024">2567</option>
              <option value="2025">2568</option>
              <option value="2026">2569</option>
            </select>
          </div>
        </div>
      </div>

      {showSubmissionPrompt && (
        <div className="mb-12 bg-slate-50 border border-slate-200/60 rounded-2xl p-6 text-slate-800 relative overflow-hidden group shadow-sm transition-all hover:shadow-md">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">ลำดับความสำคัญ</span>
              </div>
              <h3 className="text-base font-medium text-slate-800 font-thai-premium tracking-wide uppercase">เป้าหมายรายวัน: 40 คลิป / วัน</h3>

              <div className="mt-4 flex gap-1 items-center max-w-sm">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div key={idx} className="h-3 flex-1 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${isDemoMode && idx < 7.5 ? 'bg-blue-600' : 'bg-white'
                        }`}
                    />
                  </div>
                ))}
                <span className="ml-3 text-[10px] font-bold text-blue-600 font-thai-premium uppercase tracking-[0.1em]">
                  {isDemoMode ? `ยืนยันแล้ว 75%` : 'ยังไม่มีข้อมูล'}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end md:text-right gap-3">
              <div className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">สถานะรายงาน</div>
              <button
                onClick={onNavigateToTask}
                className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-sm"
              >
                ส่งรายงานประจำเดือน
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 pt-4">
        <PerformanceChart
          data={chartData.map(d => ({ date: d.date, value: d.followers }))}
          label="การเติบโตของผู้ติดตาม"
          color="#1e40af"
          gradientId="grad-followers"
          type={selectedMonth === 'all' ? 'monthly' : 'daily'}
          displayValue={totals.followers}
          growth={Number(((totals.followers / Math.max(totals.followers * 0.9, 1)) * 10 - 10).toFixed(0))}
        />
        <PerformanceChart
          data={chartData.map(d => ({ date: d.date, value: d.views }))}
          label="ประสิทธิภาพการรับชม"
          color="#2563eb"
          gradientId="grad-views"
          type={selectedMonth === 'all' ? 'monthly' : 'daily'}
          displayValue={totals.views}
          growth={Number((((totals.views - totals.prevViews) / Math.max(totals.prevViews, 1)) * 100).toFixed(0))}
        />
      </div>

      <ComparisonLineChart
        pages={workingAllPages}
        logs={workingAllLogs}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        selectedPage={selectedPage} 
      />

      <ActivePagesSection pages={pages} selectedPage={selectedPage} />
    </div>
  );
};
