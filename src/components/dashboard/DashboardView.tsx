'use client';

import React, { useMemo } from 'react';
import { Users, Eye, Filter, Calendar, Activity, RefreshCw } from 'lucide-react';
import { Page, DailyLog, User } from '@/types';
import { PerformanceChart } from './PerformanceChart';
import { ActivePagesSection } from './ActivePagesSection';
import { ExecutiveQuotaBrief } from './ExecutiveQuotaBrief';
import { PerformanceMatrixTable } from './PerformanceMatrixTable';
import { buildFakeDatabase } from '@/data/mockDashboardData';
import { aggregateDashboardMetrics } from '@/services/dashboardMetricsService';

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
  const workingAllPages = isDemoMode ? fakePages : allPages;
  const workingAllLogs = isDemoMode ? fakeLogs : allLogs;

  const payload = useMemo(() => {
    return aggregateDashboardMetrics(workingAllPages, workingAllLogs, selectedYear, selectedMonth, selectedPage);
  }, [workingAllPages, workingAllLogs, selectedYear, selectedMonth, selectedPage]);

  const { chartData, totals, matrixData, quotaData } = payload;

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

      {/* Executive Quota Brief replacing old submission prompt */}
      <ExecutiveQuotaBrief 
        quotaData={quotaData} 
        currentUser={currentUser} 
        onSelectPage={setSelectedPage}
        onNavigateToTask={onNavigateToTask}
      />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50/50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
          <span className="text-[10px] font-bold text-slate-400 font-noto uppercase tracking-widest flex items-center gap-2 mb-1.5">
            <Users size={14} className="text-blue-500" /> เพดานผู้ติดตาม (Peak)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-slate-800 font-inter tracking-tight leading-none">{totals.followers.toLocaleString()}</span>
            <span className="text-xs font-medium text-slate-400 font-noto">บัญชี</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50/50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
          <span className="text-[10px] font-bold text-slate-400 font-noto uppercase tracking-widest flex items-center gap-2 mb-1.5">
            <Eye size={14} className="text-blue-500" /> ยอดวิวรวมทั้งเดือน (MTD)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-slate-800 font-inter tracking-tight leading-none">{totals.views.toLocaleString()}</span>
            <span className="text-xs font-medium text-slate-400 font-noto">ครั้ง</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <PerformanceChart
          data={chartData.map(d => ({ date: d.date, value: d.followers }))}
          label="การเติบโตของผู้ติดตาม"
          color="#1e40af"
          gradientId="grad-followers"
          type={selectedMonth === 'all' ? 'monthly' : 'daily'}
        />
        <PerformanceChart
          data={chartData.map(d => ({ date: d.date, value: d.views }))}
          label="ประสิทธิภาพการรับชม"
          color="#2563eb"
          gradientId="grad-views"
          type={selectedMonth === 'all' ? 'monthly' : 'daily'}
        />
      </div>

      <PerformanceMatrixTable 
        matrixData={matrixData}
        selectedPage={selectedPage}
        onSelectPage={setSelectedPage}
        onAcknowledge={(pageId, reqId) => {
          // In a real app, this would call supabase to update the request status to 'Acknowledged'
          alert(`Acknowledged request ${reqId} for page ${pageId}. (Mock Action)`);
        }}
      />

      <ActivePagesSection pages={pages} selectedPage={selectedPage} />
    </div>
  );
};
