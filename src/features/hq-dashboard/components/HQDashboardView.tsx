import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { User, Page, FBAccount, DailyLog, PolicyConfiguration } from '@/types';
import { hqDashboardService } from '../services/hqDashboardService';
import { KPIStrip } from './KPIStrip';
import { PerformanceMatrix } from './PerformanceMatrix';
import { RiskCenter } from './RiskCenter';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// MOCK DATA IMPORT
import { allMockUsers, mockDashboardPages, mockDashboardLogs, mockDashboardAccounts } from '../mocks/dashboardMocks';

interface HQDashboardViewProps {
  currentUser: User;
  policy: PolicyConfiguration;
  // Options to use Real Data or Mock Data
  useMocks?: boolean;
}

export const HQDashboardView: React.FC<HQDashboardViewProps> = ({ 
  currentUser, policy, useMocks = true
}) => {
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Decide source of truth
  const dashboardData = useMemo(() => {
    return hqDashboardService.getMetrics(
      currentUser,
      allMockUsers,
      mockDashboardPages,
      mockDashboardAccounts,
      mockDashboardLogs,
      policy,
      selectedMonth,
      selectedYear
    );
  }, [currentUser, policy, selectedMonth, selectedYear]);

  const attainmentScore = Math.min(dashboardData.attainmentPercentage, 100);

  return (
    <div className="p-8 pb-32 space-y-10 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
      {/* 1. MINIMALIST HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">
            <span>Enterprise Management</span>
            <span className="w-1 h-1 rounded-full bg-slate-200"></span>
            <span>{dashboardData.scope} Executive Console</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-800 font-outfit tracking-tight">
            HQ Control Center
          </h1>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl px-3 py-1.5 shadow-sm hover:border-slate-200 transition-colors">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent border-none text-xs font-medium text-slate-600 outline-none cursor-pointer font-prompt min-w-[100px]"
          >
            {Array.from({length: 12}).map((_, i) => (
              <option key={i} value={(i+1).toString().padStart(2, '0')}>
                {format(new Date(2026, i, 1), 'MMMM', { locale: th })}
              </option>
            ))}
          </select>
          <div className="w-px h-3 bg-slate-200"></div>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-transparent border-none text-xs font-medium text-slate-600 outline-none cursor-pointer font-prompt"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </div>

      {/* 2. KPI STRIP */}
      <KPIStrip 
        totalPages={mockDashboardPages.length}
        totalUsers={dashboardData.totalUsersInScope}
        totalViews={dashboardData.actualTotalViews}
        riskCount={dashboardData.riskRadar.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 3. ATTAINMENT & MATRIX (LEFT 8/12) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* STRATEGIC ATTAINMENT */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-xs font-semibold text-slate-700 font-prompt mb-1">Performance Attainment</h3>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Monthly Enterprise Target Progress</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-slate-800 font-outfit tracking-tighter">
                  {attainmentScore.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-in-out",
                    attainmentScore >= 100 ? "bg-emerald-500" : "bg-slate-700"
                  )}
                  style={{ width: `${attainmentScore}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                <span>0M Baseline</span>
                <span>Target {(dashboardData.totalTeamTarget / 1000000).toFixed(0)}M Views</span>
              </div>
            </div>
          </div>

          <PerformanceMatrix 
            leaderboard={dashboardData.leaderboard}
            pages={mockDashboardPages}
          />
        </div>

        {/* 4. RISK & ACTIVITY (RIGHT 4/12) */}
        <div className="lg:col-span-4 space-y-8">
          
          <RiskCenter risks={dashboardData.riskRadar} />

          {/* ACTIVITY RANKING */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.3em] mb-6">Activity Ranking</h3>
            <div className="space-y-5">
              {dashboardData.leaderboard.slice(0, 5).map((staff, idx) => (
                <div key={staff.userId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-200 font-outfit">0{idx + 1}</span>
                    <p className="text-sm font-medium text-slate-600 font-prompt">{staff.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-700 font-outfit">{(staff.totalViews / 1000000).toFixed(1)}M</p>
                    <p className="text-[9px] font-medium text-slate-400 tracking-wider">views</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
