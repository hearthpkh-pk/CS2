'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { User, Page, FBAccount, DailyLog, PolicyConfiguration } from '@/types';
import { hqDashboardService } from '../services/hqDashboardService';
import { KPIStrip } from './KPIStrip';
import { PerformanceMatrix } from './PerformanceMatrix';
import { RiskCenter } from './RiskCenter';
import { ShieldAlert, ArrowRight, PieChart, BarChart, Server, Briefcase } from 'lucide-react';
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch real data on component mount and auto-refresh
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    const fetchRealData = async (isBackground = false) => {
      if (!isBackground) setIsLoading(true);
      else setIsRefreshing(true);
      
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
        if (!isBackground) setIsLoading(false);
        else setIsRefreshing(false);
      }
    };
    
    // Initial load
    fetchRealData(false);
    
    // Auto-refresh every 5 minutes (300,000 ms)
    intervalId = setInterval(() => {
      fetchRealData(true);
    }, 300000);
    
    return () => clearInterval(intervalId);
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
      
      {/* --- PAGE HEADER (Mode 1: Standard) --- */}
      <div className="flex justify-between items-center border-b border-slate-200 pt-4 pb-6 mb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-[#0f172a] font-outfit uppercase tracking-tight leading-none">
              HQ CONTROL CENTER
            </h2>
          </div>
          <div className="text-slate-400 font-noto text-[11px] mt-1.5 flex items-center gap-2">
            ศูนย์ควบคุมปฏิบัติการและวิเคราะห์ข้อมูลองค์กร • <span className="text-[var(--primary-theme)] font-bold">{dashboardData.scope} Executive Console</span>
            <span className="mx-1 text-slate-300">•</span>
            {isRefreshing ? (
              <span className="flex items-center gap-1.5 text-indigo-500 font-semibold animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block"></span>
                Syncing Live Data...
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                Live Auto-Refresh Active
              </span>
            )}
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

      {/* ANALYTICS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mt-2">
        {/* CATEGORY PERFORMANCE */}
        <div className="bg-white rounded-[1.5rem] p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <PieChart size={14} className="text-slate-400" strokeWidth={1.5} />
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-widest">Category Analytics</h3>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-6 lg:px-4">
            
            {/* Left: Compact List */}
            <div className="flex-1 w-full space-y-1">
              {dashboardData.categoryPerformance.map((cat, idx) => {
                const totalViewsInScope = dashboardData.actualTotalViews || 1; 
                const percent = (cat.totalViews / totalViewsInScope) * 100;
                const colorClass = idx === 0 ? "bg-slate-700" : idx === 1 ? "bg-slate-500" : idx === 2 ? "bg-slate-400" : "bg-slate-300";
                
                return (
                  <div key={idx} className="flex flex-col gap-1 p-2 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group/cat">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                        <div className={cn("w-2 h-2 rounded-full shadow-sm group-hover/cat:scale-125 transition-transform", colorClass)}></div>
                        <div>
                          <span className="text-[13px] font-bold text-slate-700 font-prompt leading-none">{cat.category}</span>
                          <div className="text-[9px] font-medium text-slate-400 mt-0.5">
                            {cat.pageCount} Pages • {percent.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-outfit font-extrabold text-slate-800 leading-none">{(cat.totalViews / 1000000).toFixed(1)}<span className="text-[10px] text-slate-400 ml-0.5">M</span></span>
                        <div className="text-[8px] font-medium text-emerald-500 uppercase tracking-widest mt-0.5">
                          Avg {(cat.avgViewsPerPage / 1000).toFixed(0)}k/page
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {dashboardData.categoryPerformance.length === 0 && (
                <div className="text-xs text-slate-400 italic py-2">No data available for this period</div>
              )}
            </div>

            {/* Right: Donut Chart */}
            {dashboardData.categoryPerformance.length > 0 && (
              <div className="w-full md:w-36 h-36 flex items-center justify-center relative shrink-0">
                <svg width="100%" height="100%" viewBox="0 0 42 42" className="overflow-visible drop-shadow-sm">
                  {/* Background Ring */}
                  <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f8fafc" strokeWidth="4" />
                  
                  {/* Data Rings */}
                  {(() => {
                    let cumulative = 0;
                    return dashboardData.categoryPerformance.map((cat, idx) => {
                      const totalViewsInScope = dashboardData.actualTotalViews || 1;
                      const percent = (cat.totalViews / totalViewsInScope) * 100;
                      cumulative += percent;
                      const offset = 100 - cumulative + percent;
                      const color = idx === 0 ? '#334155' : idx === 1 ? '#64748b' : idx === 2 ? '#94a3b8' : '#cbd5e1';
                      
                      return (
                        <circle
                          key={idx}
                          cx="21"
                          cy="21"
                          r="15.91549430918954"
                          fill="transparent"
                          stroke={color}
                          strokeWidth="4"
                          strokeDasharray={`${percent} ${100 - percent}`}
                          strokeDashoffset={offset}
                          transform="rotate(-90 21 21)"
                          className="transition-all duration-1000 ease-in-out cursor-pointer hover:stroke-[5px] outline-none"
                        >
                          <title>{cat.category}&#10;{(cat.totalViews / 1000000).toFixed(1)}M Views ({percent.toFixed(1)}%)&#10;{cat.pageCount} Pages</title>
                        </circle>
                      );
                    });
                  })()}
                </svg>
                
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Views</span>
                  <span className="text-lg font-outfit font-extrabold text-slate-800 leading-none mt-0.5">{(dashboardData.actualTotalViews / 1000000).toFixed(1)}<span className="text-[10px] text-slate-400 ml-0.5">M</span></span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BRAND PERFORMANCE */}
        <div className="bg-white rounded-[1.5rem] p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase size={14} className="text-slate-400" strokeWidth={1.5} />
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-widest">Brand Analytics</h3>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-6 lg:px-4">
            
            {/* Left: Compact List */}
            <div className="flex-1 w-full space-y-1">
              {dashboardData.brandPerformance.map((brandData, idx) => {
                const totalViewsInScope = dashboardData.actualTotalViews || 1; 
                const percent = (brandData.totalViews / totalViewsInScope) * 100;
                // Use a slightly different color palette for brand to distinguish from category
                const colorClass = idx === 0 ? "bg-indigo-600" : idx === 1 ? "bg-indigo-400" : idx === 2 ? "bg-indigo-300" : "bg-indigo-200";
                
                return (
                  <div key={idx} className="flex flex-col gap-1 p-2 rounded-xl hover:bg-indigo-50/50 transition-colors border border-transparent hover:border-indigo-50 group/brand">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                        <div className={cn("w-2 h-2 rounded-full shadow-sm group-hover/brand:scale-125 transition-transform", colorClass)}></div>
                        <div>
                          <span className="text-[13px] font-bold text-slate-700 font-prompt leading-none">{brandData.brand}</span>
                          <div className="text-[9px] font-medium text-slate-400 mt-0.5">
                            {brandData.staffCount} Staffs • {percent.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-outfit font-extrabold text-slate-800 leading-none">{(brandData.totalViews / 1000000).toFixed(1)}<span className="text-[10px] text-slate-400 ml-0.5">M</span></span>
                        <div className="text-[8px] font-medium text-emerald-500 uppercase tracking-widest mt-0.5">
                          Avg {(brandData.avgViewsPerStaff / 1000).toFixed(0)}k/staff
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {dashboardData.brandPerformance.length === 0 && (
                <div className="text-xs text-slate-400 italic py-2">No brand data available</div>
              )}
            </div>

            {/* Right: Donut Chart */}
            {dashboardData.brandPerformance.length > 0 && (
              <div className="w-full md:w-36 h-36 flex items-center justify-center relative shrink-0">
                <svg width="100%" height="100%" viewBox="0 0 42 42" className="overflow-visible drop-shadow-sm">
                  {/* Background Ring */}
                  <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f8fafc" strokeWidth="4" />
                  
                  {/* Data Rings */}
                  {(() => {
                    let cumulative = 0;
                    return dashboardData.brandPerformance.map((brandData, idx) => {
                      const totalViewsInScope = dashboardData.actualTotalViews || 1;
                      const percent = (brandData.totalViews / totalViewsInScope) * 100;
                      cumulative += percent;
                      const offset = 100 - cumulative + percent;
                      const color = idx === 0 ? '#4f46e5' : idx === 1 ? '#818cf8' : idx === 2 ? '#a5b4fc' : '#c7d2fe';
                      
                      return (
                        <circle
                          key={idx}
                          cx="21"
                          cy="21"
                          r="15.91549430918954"
                          fill="transparent"
                          stroke={color}
                          strokeWidth="4"
                          strokeDasharray={`${percent} ${100 - percent}`}
                          strokeDashoffset={offset}
                          transform="rotate(-90 21 21)"
                          className="transition-all duration-1000 ease-in-out cursor-pointer hover:stroke-[5px] outline-none"
                        >
                          <title>{brandData.brand}&#10;{(brandData.totalViews / 1000000).toFixed(1)}M Views ({percent.toFixed(1)}%)&#10;{brandData.staffCount} Staffs</title>
                        </circle>
                      );
                    });
                  })()}
                </svg>
                
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest">Brand Views</span>
                  <span className="text-lg font-outfit font-extrabold text-slate-800 leading-none mt-0.5">{(dashboardData.actualTotalViews / 1000000).toFixed(1)}<span className="text-[10px] text-slate-400 ml-0.5">M</span></span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8 mt-2">
        
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

        {/* 4. ASSET HEALTH & ACTIVITY (RIGHT 4/12) */}
        <div className="lg:col-span-4 flex flex-col gap-4 md:gap-8">

          {/* ASSET HEALTH OVERVIEW */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Server size={14} className="text-slate-400" strokeWidth={1.5} />
              <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-widest">Asset Health Overview</h3>
            </div>
            
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Managed Pages</p>
                <div className="grid grid-cols-2 gap-2">
                  {dashboardData.assetHealth.pages.map((p, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <div className={cn("w-1.5 h-1.5 rounded-full", p.status === 'Active' ? 'bg-emerald-400' : 'bg-red-400')}></div>
                        <span className="text-[10px] font-medium text-slate-600">{p.status}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-700">{p.count}</span>
                    </div>
                  ))}
                  {dashboardData.assetHealth.pages.length === 0 && <span className="text-[10px] text-slate-400 italic">No pages</span>}
                </div>
              </div>
            </div>
          </div>
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
