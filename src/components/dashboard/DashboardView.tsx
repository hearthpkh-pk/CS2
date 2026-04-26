'use client';

import React, { useMemo, useState } from 'react';
import { Users, Eye, Filter, Calendar, Activity, RefreshCw, UserCog, FileCheck } from 'lucide-react';
import { Page, DailyLog, User, Role } from '@/types';
import { PerformanceChart } from './PerformanceChart';
import { ActivePagesSection } from './ActivePagesSection';
import { ExecutiveQuotaBrief } from './ExecutiveQuotaBrief';
import { PerformanceMatrixTable } from './PerformanceMatrixTable';
import { MonthlyCloseDrawer } from './MonthlyCloseDrawer';
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
  policy: {
    minViewTarget: number;
    penaltyAmount: number;
    bonusStep1: number;
    superBonusThreshold: number;
    bonusStep2: number;
  };
  // 🛡️ SuperAdmin: View any user's workspace
  isSuperViewer?: boolean;
  users?: User[];
  viewAsUserId?: string | null;
  setViewAsUserId?: (id: string | null) => void;
  onNavigateToSetup?: () => void;
}


const thaiMonths = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

export const DashboardView = ({
  pages, logs, selectedPage, setSelectedPage,
  selectedMonth, setSelectedMonth, selectedYear, setSelectedYear,
  onNavigateToTask, currentUser, onSyncPage,
  allPages, allLogs, policy,
  isSuperViewer, users, viewAsUserId, setViewAsUserId,
  onNavigateToSetup
}: Props) => {
  const payload = useMemo(() => {
    return aggregateDashboardMetrics(allPages, allLogs, selectedYear, selectedMonth, selectedPage, policy);
  }, [allPages, allLogs, selectedYear, selectedMonth, selectedPage, policy]);

  const { chartData, totals, matrixData, quotaData } = payload;

  const [isMonthlyCloseOpen, setIsMonthlyCloseOpen] = useState(false);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 pb-10 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pt-4 pb-6 mb-6 gap-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-[#0f172a] font-outfit uppercase tracking-tight leading-none">
              DASHBOARD
            </h2>
          </div>
          <p className="text-slate-400 font-noto text-[11px] mt-1.5 flex items-center gap-2">
            รายงานข้อมูลเพจภาพรวมและสถิติยอดการรับชม • <span className="text-[var(--primary-theme)] font-bold">Analytics Matrix</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">

          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl py-2 px-3 w-full sm:w-auto shadow-sm hover:shadow-md hover:border-[var(--primary-blue)] focus-within:border-[var(--primary-blue)] focus-within:ring-4 focus-within:ring-blue-50 transition-all text-slate-500 hover:text-[var(--primary-blue)]">
            <Filter size={14} />
            <select value={selectedPage} onChange={e => setSelectedPage(e.target.value)} className="bg-transparent text-inherit text-xs font-bold font-noto outline-none flex-1 cursor-pointer">
              <option value="all">ทุกเพจ</option>
              {pages.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>



          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl py-2 px-3 w-full sm:w-auto shadow-sm hover:shadow-md hover:border-[var(--primary-blue)] focus-within:border-[var(--primary-blue)] focus-within:ring-4 focus-within:ring-blue-50 transition-all text-slate-500 hover:text-[var(--primary-blue)]">
            <Calendar size={14} />
            <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="bg-transparent text-inherit text-xs font-bold font-noto outline-none cursor-pointer">
              <option value="all">ทุกเดือน</option>
              {thaiMonths.map((m, i) => <option key={i} value={(i + 1).toString().padStart(2, '0')}>{m}</option>)}
            </select>
            <div className="w-px h-3 bg-slate-200 mx-1.5"></div>
            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="bg-transparent text-inherit text-xs font-bold font-noto outline-none cursor-pointer">
              <option value="2024">2567</option>
              <option value="2025">2568</option>
              <option value="2026">2569</option>
            </select>
          </div>

          {/* Monthly Close Button */}
          {currentUser.role !== 'Developer' && (
            <button
              onClick={() => setIsMonthlyCloseOpen(true)}
              className="flex items-center gap-2 bg-[var(--primary-theme)] hover:bg-[var(--primary-theme-hover)] text-white px-4 py-2.5 rounded-xl font-bold font-noto text-xs shadow-lg shadow-blue-100/50 hover:-translate-y-0.5 transition-all active:scale-95 whitespace-nowrap"
            >
              <FileCheck size={14} />
              ส่งเช็คยอด
            </button>
          )}
        </div>
      </div>

      {currentUser.role === 'Developer' ? (
        <div className="bg-white rounded-[3.5rem] border border-slate-100 p-20 text-center shadow-sm relative overflow-hidden group min-h-[500px] flex items-center justify-center">
           <div className="absolute top-0 left-0 w-full h-1.5 bg-[#054ab3]"></div>
           <div className="max-w-md mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-1000">
              <div className="relative">
                 <div className="w-32 h-32 bg-blue-50 rounded-[3rem] flex items-center justify-center mx-auto ring-12 ring-blue-50/30 group-hover:scale-110 transition-transform duration-700">
                    <RefreshCw size={50} className="text-[#054ab3]" />
                 </div>
              </div>
              <div className="space-y-4">
                 <h3 className="text-3xl font-bold text-slate-800 font-outfit tracking-tight">Perspective Sandbox</h3>
                 <p className="text-slate-400 font-medium text-[14px] leading-relaxed">
                    Logged in as <span className="text-[#054ab3] font-bold">System Developer</span>. <br/>
                    Business data is currently isolated for architectural integrity.
                 </p>
              </div>
              <div className="p-6 bg-slate-50/80 rounded-[2rem] border border-slate-100/50 backdrop-blur-sm">
                 <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] leading-loose">
                    Use the <span className="text-[#054ab3]">Dev Perspective Tool (FAB)</span> <br/>
                    to impersonate a team member and view their live environment.
                 </p>
              </div>
           </div>
        </div>
      ) : (
        <>
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
                <Users size={14} className="text-blue-500" /> ยอดผู้ติดตามใหม่ (New)
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

          <ActivePagesSection pages={pages} selectedPage={selectedPage} onNavigateToSetup={onNavigateToSetup} />
        </>
      )}

      {/* Monthly Close Drawer */}
      <MonthlyCloseDrawer
        isOpen={isMonthlyCloseOpen}
        onClose={() => setIsMonthlyCloseOpen(false)}
        currentUser={currentUser}
        targetUser={viewAsUserId && users ? users.find(u => u.id === viewAsUserId) || currentUser : currentUser}
        pages={allPages}
        logs={allLogs}
      />
    </div>
  );
};
