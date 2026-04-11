import React, { useState } from 'react';
import { Activity, ArrowRight } from 'lucide-react';
import { Page, User } from '@/types';
import { LeaderboardEntry } from '../services/hqDashboardService';
import { cn } from '@/lib/utils';

interface PerformanceMatrixProps {
  leaderboard: LeaderboardEntry[];
  pages: Page[];
}

export const PerformanceMatrix: React.FC<PerformanceMatrixProps> = ({
  leaderboard, pages
}) => {
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-widest flex items-center gap-2">
          <Activity size={14} className="text-slate-400" strokeWidth={1.5} /> Staff Performance Matrix
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Team Member</th>
              <th className="px-8 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-center">Asset Health</th>
              <th className="px-8 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-right">Views</th>
              <th className="px-8 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {leaderboard.map(staff => {
              const isExpanded = expandedUserId === staff.userId;
              const staffPages = pages.filter(p => p.ownerId === staff.userId && !p.isDeleted);
              const healthyCount = staffPages.filter(p => p.status === 'Active').length;
              
              return (
                <React.Fragment key={staff.userId}>
                  <tr className={cn(
                    "hover:bg-slate-50 transition-colors group",
                    isExpanded && "bg-slate-50/80"
                  )}>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400 overflow-hidden shrink-0 border border-slate-50 shadow-sm">
                          {staff.avatarUrl ? (
                            <img src={staff.avatarUrl} alt={staff.name} className="w-full h-full object-cover" />
                          ) : (
                            staff.name?.charAt(0) || '?'
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700 font-prompt leading-none mb-1">{staff.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{staff.teamId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
                          {healthyCount}/{staffPages.length} active
                        </span>
                        <div className="flex gap-1 flex-wrap justify-center max-w-[120px]">
                          {staffPages.slice(0, 30).map(p => (
                            <div key={p.id} className={cn(
                              "w-1 h-1 rounded-full",
                              p.status === 'Active' ? 'bg-emerald-400' : 'bg-red-400'
                            )}></div>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right">
                       <p className="text-sm font-bold text-slate-700 font-outfit">{(staff.totalViews / 1000000).toFixed(1)}M</p>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button 
                        onClick={() => setExpandedUserId(isExpanded ? null : staff.userId)}
                        className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-800 transition-colors flex items-center gap-2 ml-auto"
                      >
                        {isExpanded ? 'Collapse' : 'Details'}
                        <ArrowRight size={14} className={cn("transition-transform", isExpanded && "rotate-90")} />
                      </button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-slate-50/50">
                      <td colSpan={4} className="px-8 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border-l-2 border-slate-200 ml-4 pl-6 py-2">
                          {staffPages.length === 0 ? (
                            <p className="text-[10px] text-slate-400 italic">No assets assigned</p>
                          ) : (
                            staffPages.map(page => (
                              <div key={page.id} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between group/page">
                                <div>
                                  <p className="text-xs font-semibold text-slate-700 font-prompt truncate max-w-[150px]">{page.name}</p>
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <div className={cn("w-1 h-1 rounded-full", page.status === 'Active' ? 'bg-emerald-500' : 'bg-red-400')}></div>
                                    <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">{page.status}</span>
                                  </div>
                                </div>
                                <button className="opacity-0 group-hover/page:opacity-100 transition-opacity p-1 text-slate-300 hover:text-slate-600">
                                  <ArrowRight size={12} />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
