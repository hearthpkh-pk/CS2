import React, { useState, useMemo } from 'react';
import { 
  Users, Activity, Target, ShieldAlert, Award, AlertTriangle, ArrowRight, DollarSign, Flag
} from 'lucide-react';
import { Page, FBAccount, User, DailyLog, Role } from '@/types';
import { PolicyConfiguration } from '@/types';
import { hqDashboardService } from '@/services/hqDashboardService';
import { parseISO, format } from 'date-fns';
import { th } from 'date-fns/locale';

// Mock policy for the HQ Dashboard
const mockPolicy: PolicyConfiguration = {
  minViewTarget: 10000000,
  penaltyAmount: 2000,
  bonusStep1: 500,
  superBonusThreshold: 20000000,
  bonusStep2: 1500,
  requiredPagesPerDay: 5,
  clipsPerPageInLog: 4
};

interface HQDashboardViewProps {
  pages: Page[];
  accounts: FBAccount[];
  users: User[];
  logs: DailyLog[]; // Need logs for aggregation
  currentUser: User;
}

export const HQDashboardView: React.FC<HQDashboardViewProps> = ({ pages, accounts, users, logs, currentUser }) => {
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Use useMemo to simulate a fetch call caching the heavy aggregation result
  const dashboardData = useMemo(() => {
    return hqDashboardService.getMetrics(
      currentUser,
      users,
      pages,
      accounts,
      logs,
      mockPolicy,
      selectedMonth,
      selectedYear
    );
  }, [currentUser, users, pages, accounts, logs, selectedMonth, selectedYear]);

  // Design helpers
  const getAvatarLetter = (name: string) => name.charAt(0);
  
  const scopeTitle = dashboardData.scope === 'Company' ? 'Company Aggregation' : `${dashboardData.scope} Aggregation`;
  
  const attainmentScore = Math.min(dashboardData.attainmentPercentage, 100);
  const attainmentColor = attainmentScore >= 100 ? 'bg-green-500' : attainmentScore >= 50 ? 'bg-amber-400' : 'bg-red-500';

  return (
    <div className="space-y-6 animate-in fade-in duration-700 font-prompt">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800 font-outfit uppercase tracking-tight flex items-center gap-3">
             <Target className="text-slate-400" size={24} />
             {dashboardData.scope === 'Company' ? 'Headquarters Dashboard' : 'Team Dashboard'}
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-1 relative inline-flex items-center gap-2">
             <span>{scopeTitle}</span>
             <span className="w-1 h-1 rounded-full bg-slate-300"></span>
             <span>Authorized as: <span className="text-blue-500">{currentUser.role}</span></span>
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 p-1.5 bg-slate-50 border border-slate-100 rounded-2xl">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent border-none text-xs font-bold text-slate-600 outline-none cursor-pointer p-2"
          >
            {Array.from({length: 12}).map((_, i) => (
              <option key={i} value={(i+1).toString().padStart(2, '0')}>
                {format(new Date(2026, i, 1), 'MMMM', { locale: th })}
              </option>
            ))}
          </select>
          <div className="w-px h-6 bg-slate-200"></div>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-transparent border-none text-xs font-bold text-slate-600 outline-none cursor-pointer p-2"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </div>

      {/* AGGREGATION METERS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
         {/* Quota Attainment Card */}
         <div className="md:col-span-8 bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-200/50 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-8">
               <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total View Attainment</h3>
                  <p className="text-3xl font-black font-outfit tracking-tighter">
                    {(dashboardData.actualTotalViews / 1000000).toFixed(2)}M <span className="text-sm font-medium text-slate-400 tracking-normal">/ {(dashboardData.totalTeamTarget / 1000000).toFixed(2)}M views</span>
                  </p>
               </div>
               <div className="px-3 py-1 bg-white/10 rounded-xl text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Users size={12} /> {dashboardData.totalUsersInScope} Staffs in Scope
               </div>
            </div>

            {/* Progress Bar */}
            <div>
               <div className="flex justify-between items-end mb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Progress</span>
                  <span className="text-xl font-black font-outfit">{attainmentScore.toFixed(1)}%</span>
               </div>
               <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${attainmentColor} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${Math.max(attainmentScore, 2)}%` }} // Minimum 2% to show the bar pill
                  ></div>
               </div>
            </div>
         </div>

         {/* General Stats */}
         <div className="md:col-span-4 grid grid-rows-2 gap-6">
            <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm flex flex-col justify-center relative overflow-hidden group">
               <div className="absolute right-[-20%] top-1/2 -translate-y-1/2 opacity-5 mt-4 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                  <Award size={180} />
               </div>
               <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-slate-50 text-slate-400 rounded-xl"><Activity size={16} /></div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Asset Pool</h3>
               </div>
               <p className="text-3xl font-black text-slate-800 font-outfit">{pages.filter(p => !p.isDeleted).length} <span className="text-sm font-bold text-slate-400 font-prompt">Pages</span></p>
            </div>

            <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm flex flex-col justify-center relative overflow-hidden group">
               <div className="absolute right-[-20%] top-1/2 -translate-y-1/2 opacity-5 mt-4 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                  <ShieldAlert size={180} />
               </div>
               <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-slate-50 text-slate-400 rounded-xl"><AlertTriangle size={16} /></div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Risks</h3>
               </div>
               <p className="text-3xl font-black text-red-500 font-outfit">{dashboardData.riskRadar.length} <span className="text-sm font-bold text-slate-400 font-prompt">Issues</span></p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEADERBOARD MATRIX */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
              <Award className="text-amber-500" size={16} /> 
              Leaderboard ({dashboardData.scope})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rank & Staff</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Pages</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Total Views</th>
                  {/* Note: Payroll columns ONLY render for SuperAdmin/Admin */}
                  {(currentUser.role === Role.SuperAdmin || currentUser.role === Role.Admin) && (
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Payroll Projected</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {dashboardData.leaderboard.map((staff, idx) => (
                  <tr key={staff.userId} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors group">
                    <td className="py-4 flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black font-outfit
                         ${idx === 0 ? 'bg-amber-100 text-amber-600' : 
                           idx === 1 ? 'bg-slate-200 text-slate-600' : 
                           idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-400'}
                      `}>
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{staff.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{staff.teamId}</p>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                       <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full">
                         {staff.pagesCount}
                       </span>
                    </td>
                    <td className="py-4 text-right">
                       <span className="text-sm font-black text-slate-700 font-outfit">
                         {staff.totalViews.toLocaleString()}
                       </span>
                    </td>
                    
                    {/* Security Zone: Money Rendering */}
                    {(currentUser.role === Role.SuperAdmin || currentUser.role === Role.Admin) && (
                      <td className="py-4 text-right">
                        {staff.penaltyRisk && staff.penaltyRisk > 0 ? (
                           <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-red-600">
                             <span className="text-[10px] font-black uppercase tracking-widest">- ฿{staff.penaltyRisk.toLocaleString()}</span>
                           </div>
                        ) : staff.projectedBonus && staff.projectedBonus > 0 ? (
                           <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-green-600">
                             <span className="text-[10px] font-black uppercase tracking-widest">+ ฿{staff.projectedBonus.toLocaleString()}</span>
                           </div>
                        ) : (
                           <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Pending</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RISK RADAR */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 h-full">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 mb-6 flex items-center gap-2">
              <ShieldAlert className="text-red-500" size={16} /> Danger Zone Radar
            </h3>

            {dashboardData.riskRadar.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-slate-400">
                <ShieldAlert size={32} className="mb-3 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">No Active Risks</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardData.riskRadar.map((risk, i) => (
                  <div key={i} className={`p-4 rounded-[1.5rem] border ${risk.severity === 'High' ? 'bg-white border-red-100' : 'bg-white border-orange-100'} flex items-start justify-between group`}>
                     <div>
                       <div className="flex items-center gap-2 mb-1.5">
                         <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${risk.severity === 'High' ? 'bg-red-500 text-white' : 'bg-amber-400 text-white'}`}>
                           {risk.type}
                         </span>
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{risk.assigneeName}</span>
                       </div>
                       <p className="text-sm font-bold text-slate-800 line-clamp-1">{risk.entityName}</p>
                       <p className={`text-[10px] font-medium mt-1 leading-relaxed ${risk.severity === 'High' ? 'text-red-500' : 'text-amber-600'}`}>
                         {risk.message}
                       </p>
                     </div>
                     <button className="p-2 text-slate-300 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors">
                       <ArrowRight size={14} />
                     </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ASSET TRACKING MATRIX (ONLY ADMIN/SUPER ADMIN) */}
      {(currentUser.role === Role.SuperAdmin || currentUser.role === Role.Admin) && (
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm mt-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
              <Activity className="text-blue-500" size={16} /> 
              Asset Tracking Matrix
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset Name</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Owner / Team</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.assets.map(asset => {
                  const owner = users.find(u => u.id === asset.ownerId);
                  const hasActiveWarning = asset.requests && asset.requests.some(r => r.status === 'Pending');
                  
                  return (
                    <tr key={asset.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors group">
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                           <span className="text-sm font-bold text-slate-800">{asset.name}</span>
                           {hasActiveWarning && (
                             <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                           )}
                        </div>
                        <p className="text-[10px] font-medium text-slate-400">{asset.category}</p>
                      </td>
                      <td className="py-4">
                        <p className="text-sm font-bold text-slate-700">{owner?.name || 'Unknown'}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{asset.teamId}</p>
                      </td>
                      <td className="py-4 text-center">
                         <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                           asset.status === 'Active' ? 'bg-emerald-100 text-emerald-600' :
                           asset.status === 'Problem' || asset.status === 'Error' ? 'bg-red-100 text-red-600' :
                           'bg-slate-100 text-slate-600'
                         }`}>
                           {asset.status}
                         </span>
                      </td>
                      <td className="py-4 text-right">
                         <button 
                           onClick={() => alert(`Flag Mock Issued for Page: ${asset.name}`)}
                           className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-red-100 hover:text-red-600 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors"
                           title="ออกหนังสือเตือนสั่งแก้เพจ (Flag Asset)"
                         >
                           <Flag size={12} /> Flag 
                         </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
