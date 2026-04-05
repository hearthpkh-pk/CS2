'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { User, Page, FBAccount, DailyLog, PolicyConfiguration } from '@/types';
import { hqDashboardService } from '../services/hqDashboardService';
import { KPIStrip } from './KPIStrip';
import { PerformanceMatrix } from './PerformanceMatrix';
import { RiskCenter } from './RiskCenter';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dataService } from '@/services/dataService';
import { personnelService } from '@/services/personnelService';

interface HQDashboardViewProps {
  currentUser: User;
  policy: PolicyConfiguration;
}

export const HQDashboardView: React.FC<HQDashboardViewProps> = ({ 
  currentUser, policy
}) => {
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Real Database State
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allPages, setAllPages] = useState<Page[]>([]);
  const [allAccounts, setAllAccounts] = useState<FBAccount[]>([]);
  const [allLogs, setAllLogs] = useState<DailyLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real data on component mount
  useEffect(() => {
    const fetchRealData = async () => {
      setIsLoading(true);
      try {
        const [fetchedUsers, fetchedPages, fetchedAccounts, fetchedLogs] = await Promise.all([
          personnelService.getAvailableUsers(currentUser.role),
          dataService.getPages(),
          dataService.getAccounts(currentUser),
          dataService.getLogs()
        ]);
        
        setAllUsers(fetchedUsers);
        setAllPages(fetchedPages);
        setAllAccounts(fetchedAccounts);
        setAllLogs(fetchedLogs);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRealData();
  }, [currentUser]);

  // Decide source of truth
  const dashboardData = useMemo(() => {
    if (isLoading) return null; // Avoid running heavy calculations while loading
    
    return hqDashboardService.getMetrics(
      currentUser,
      allUsers,
      allPages,
      allAccounts,
      allLogs,
      policy,
      selectedMonth,
      selectedYear
    );
  }, [currentUser, policy, selectedMonth, selectedYear, allUsers, allPages, allAccounts, allLogs, isLoading]);

  if (isLoading || !dashboardData) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4 opacity-50 h-[60vh]">
        <div className="w-8 h-8 border-2 border-[var(--primary-theme)] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#0f172a]">Loading Live Matrix...</p>
      </div>
    );
  }

  const attainmentScore = Math.min(dashboardData.attainmentPercentage, 100);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 pb-10 flex flex-col gap-4">
      
      {/* 1. HQ COMMAND HEADER (Mode 2) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pt-4 pb-5 mb-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-[#0f172a] font-outfit uppercase tracking-tight leading-none">
            HQ Control Center
          </h1>
          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400 uppercase tracking-[0.2em] mt-1.5">
            <span className="font-outfit font-bold tracking-[0.25em]">Enterprise Management</span>
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[var(--primary-theme)] font-prompt font-bold">{dashboardData.scope} Executive Console</span>
          </div>
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
        totalPages={dashboardData.assets.length}
        totalUsers={dashboardData.totalUsersInScope}
        totalViews={dashboardData.actualTotalViews}
        riskCount={dashboardData.riskRadar.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
        
        {/* 3. ATTAINMENT & MATRIX (LEFT 8/12) */}
        <div className="lg:col-span-8 flex flex-col gap-4 md:gap-8">
          
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
            pages={dashboardData.assets}
          />
        </div>

        {/* 4. RISK & ACTIVITY (RIGHT 4/12) */}
        <div className="lg:col-span-4 flex flex-col gap-4 md:gap-8">
          
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
