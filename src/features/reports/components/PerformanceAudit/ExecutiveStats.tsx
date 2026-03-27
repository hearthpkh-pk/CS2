'use client';

import React, { useState, useMemo } from 'react';
import { BarChart2, TrendingUp, Users, Target, Info, ChevronRight, Activity, Search, LayoutList, Filter, MoreVertical, Maximize2 } from 'lucide-react';
import { DailyReport } from '../../mocks/reportMocks';
import { cn } from '@/lib/utils';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DEPARTMENTS = ['รายการ', 'หนัง', 'ข่าว'];
const GROUPS = ['แบรนด์ 1', 'แบรนด์ 2', 'แบรนด์ 3', 'แบรนด์ 4'];

export const ExecutiveStats = ({ reports }: { reports: DailyReport[] }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDept, setActiveDept] = useState<string | 'all'>('all');
  const [activeGroup, setActiveGroup] = useState<string | 'all'>('all');

  // Dimensions
  const chartHeight = 400;
  const chartWidth = 1000;
  const padding = 60;

  // Filter Logic
  const filteredByToggles = useMemo(() => {
    return reports.filter(r => {
      const matchDept = activeDept === 'all' || r.department === activeDept;
      const matchGroup = activeGroup === 'all' || r.group === activeGroup;
      return matchDept && matchGroup;
    });
  }, [reports, activeDept, activeGroup]);

  // Data Aggregation
  const aggregateViews = useMemo(() => {
    if (filteredByToggles.length === 0) return Array(12).fill(0);
    return Array.from({ length: 12 }).map((_, i) => 
      filteredByToggles.reduce((acc, r) => acc + (r.yearlyViews[i] || 0), 0) / (activeDept === 'all' && activeGroup === 'all' ? 1 : filteredByToggles.length)
    );
  }, [filteredByToggles, activeDept, activeGroup]);

  const selectedReport = useMemo(() => 
    reports.find(r => r.id === selectedId), 
  [reports, selectedId]);

  // Chart Logic
  const { aggregatePath, selectedPath, maxVal } = useMemo(() => {
    const allVals = [...aggregateViews];
    if (selectedReport) allVals.push(...selectedReport.yearlyViews);
    const max = Math.max(...allVals, 1000000) * 1.25;

    const scaleX = (chartWidth - padding * 2) / 11;
    const scaleY = (chartHeight - padding * 2) / max;

    const getPath = (data: number[]) => {
      const points = data.map((v, i) => ({
        x: padding + i * scaleX,
        y: chartHeight - padding - (v * scaleY)
      }));
      let d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const curr = points[i];
        const next = points[i+1];
        const cx = (curr.x + next.x) / 2;
        d += ` C ${cx} ${curr.y}, ${cx} ${next.y}, ${next.x} ${next.y}`;
      }
      return d;
    };

    return { 
      aggregatePath: getPath(aggregateViews), 
      selectedPath: selectedReport ? getPath(selectedReport.yearlyViews) : null,
      maxVal: max
    };
  }, [aggregateViews, selectedReport]);

  const filteredOperatorsList = useMemo(() => 
    filteredByToggles.filter(r => r.userName.toLowerCase().includes(searchTerm.toLowerCase())),
  [filteredByToggles, searchTerm]);

  return (
    <div className="animate-in fade-in duration-1000 space-y-8 pb-32 max-w-[1600px] mx-auto p-4 md:p-0">
      
      {/* 1. UNIFIED ANALYTICAL BOARD (Filters + Chart) */}
      <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm relative overflow-hidden group transition-all duration-700">
         
         {/* Command Toolbar - Integrated Header */}
         <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 mb-12">
            <div className="space-y-1">
               <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-1">
                  <span>Performance Analysis</span>
                  <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                  <span>12-Month Matrix</span>
               </div>
               <h3 className="text-xl font-semibold text-slate-800 font-outfit tracking-tight">
                  {selectedReport ? `Personnel Trace: ${selectedReport.userName}` : 'Global Performance Consensus'}
               </h3>
            </div>
            
            {/* Functional Controls Layer */}
            <div className="flex flex-wrap items-center gap-3 bg-slate-50/50 p-1.5 rounded-2xl border border-slate-100">
               {/* Dept Toggles */}
               <div className="flex items-center bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                  <button 
                    onClick={() => setActiveDept('all')}
                    className={cn("px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all", activeDept === 'all' ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-600")}
                  >All Depts</button>
                  {DEPARTMENTS.map(dept => (
                    <button 
                      key={dept}
                      onClick={() => setActiveDept(dept)}
                      className={cn("px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all", activeDept === dept ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-600 font-prompt")}
                    >{dept}</button>
                  ))}
               </div>

               {/* Group Toggles */}
               <div className="flex items-center bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                  <button 
                    onClick={() => setActiveGroup('all')}
                    className={cn("px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all", activeGroup === 'all' ? "bg-emerald-500 text-white" : "text-slate-400 hover:text-slate-600")}
                  >Groups</button>
                  {GROUPS.map(group => (
                    <button 
                      key={group}
                      onClick={() => setActiveGroup(group)}
                      className={cn("px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all", activeGroup === group ? "bg-emerald-500 text-white" : "text-slate-400 hover:text-slate-600 font-prompt")}
                    >{group}</button>
                  ))}
               </div>
               
               {selectedId && (
                 <button onClick={() => setSelectedId(null)} className="p-2 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all active:scale-95 border border-rose-100">
                    <Maximize2 size={14} strokeWidth={2.5} />
                 </button>
               )}
            </div>
         </div>

         {/* Chart Visualization Core */}
         <div className="h-[380px] w-full relative py-2">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
               {/* Subtle Y-Grid */}
               {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                 <React.Fragment key={i}>
                    <line x1={padding} x2={chartWidth - padding} y1={padding + (chartHeight - padding * 2) * p} y2={padding + (chartHeight - padding * 2) * p} stroke="#f1f5f9" strokeWidth="1" />
                    <text x={padding - 15} y={chartHeight - padding - (chartHeight - padding * 2) * p} textAnchor="end" alignmentBaseline="middle" className="text-[10px] font-medium fill-slate-400 font-inter opacity-60">
                       {((maxVal * p) / 1000000).toFixed(0)}M
                    </text>
                 </React.Fragment>
               ))}

               {/* X-Axis Timeline */}
               {MONTHS.map((m, i) => (
                 <text key={m} x={padding + i * ((chartWidth - padding * 2) / 11)} y={chartHeight - padding + 30} textAnchor="middle" className="text-[10px] font-semibold fill-slate-400 uppercase tracking-widest opacity-60">
                   {m}
                 </text>
               ))}

               {/* Paths */}
               <path 
                 d={aggregatePath} 
                 fill="none" 
                 stroke="#3b82f6" 
                 strokeWidth="4" 
                 className={cn("transition-all duration-1000", selectedId ? "opacity-10 stroke-slate-200" : "opacity-100")} 
                 strokeLinecap="round" 
                 strokeLinejoin="round" 
               />
               
               {selectedPath && (
                 <path 
                   d={selectedPath} 
                   fill="none" 
                   stroke="#10b981" 
                   strokeWidth="5" 
                   className="animate-in fade-in duration-1000 slide-in-from-bottom-5" 
                   strokeLinecap="round" 
                   strokeLinejoin="round" 
                 />
               )}
            </svg>
            
            {/* Visual Indicators Layer */}
            <div className="absolute top-0 right-4 flex gap-8">
               <div className="flex flex-col text-right">
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Segment AVG</span>
                  <p className="text-xl font-bold text-slate-700 font-inter tracking-tighter">{(aggregateViews[11]/1000000).toFixed(1)}M</p>
               </div>
               {selectedReport && (
                 <div className="flex flex-col text-right animate-in slide-in-from-top-2">
                    <span className="text-[9px] font-semibold text-emerald-500 uppercase tracking-wider mb-0.5">Individual Peak</span>
                    <p className="text-xl font-bold text-emerald-600 font-inter tracking-tighter">{(Math.max(...selectedReport.yearlyViews)/1000000).toFixed(1)}M</p>
                 </div>
               )}
            </div>
         </div>
      </div>

      {/* 2. PERFORMANCE DRILL-DOWN MATRIX (Comprehensive Search + List) */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden transition-all hover:border-slate-200">
         <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-widest flex items-center gap-2">
               <LayoutList size={14} className="text-slate-400" strokeWidth={1.5} /> Performance Drill-down Matrix
            </h3>
            
            <div className="relative w-full md:w-80">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
               <input 
                 type="text" 
                 placeholder="Search personnel..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-slate-50 border border-transparent rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-600 focus:outline-none focus:bg-white focus:border-slate-200 transition-all font-prompt"
               />
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50/50">
                     <th className="px-8 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Team Member</th>
                     <th className="px-8 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Department</th>
                     <th className="px-8 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Group</th>
                     <th className="px-8 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-right">Avg Views</th>
                     <th className="px-8 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-right">Trace</th>
                     <th className="px-8 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Focus</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredOperatorsList.map((r, idx) => {
                    const avg = r.yearlyViews.reduce((a,b)=>a+b,0) / 12;
                    const lastMonth = r.yearlyViews[11];
                    const prevMonth = r.yearlyViews[10];
                    const diff = ((lastMonth - prevMonth) / prevMonth) * 100;
                    
                    return (
                      <tr 
                        key={r.id}
                        onClick={() => setSelectedId(selectedId === r.id ? null : r.id)}
                        className={cn(
                          "hover:bg-slate-50 transition-colors group cursor-pointer",
                          selectedId === r.id && "bg-slate-50/80"
                        )}
                      >
                         <td className="px-8 py-4">
                            <p className="text-sm font-medium text-slate-700 font-prompt">{r.userName}</p>
                            <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">NODE_{r.id}</p>
                         </td>
                         <td className="px-8 py-4">
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest font-prompt">{r.department}</span>
                         </td>
                         <td className="px-8 py-4">
                            <span className="text-[10px] font-medium text-slate-400 font-prompt">{r.group}</span>
                         </td>
                         <td className="px-8 py-4 text-right">
                            <p className="text-sm font-bold text-slate-700 font-outfit">{(avg/1000000).toFixed(1)}M</p>
                         </td>
                         <td className="px-8 py-4 text-right">
                            <div className={cn(
                               "inline-flex items-center gap-1 font-bold text-[10px]",
                               diff >= 0 ? "text-emerald-500" : "text-rose-500"
                            )}>
                               <TrendingUp size={10} className={cn(diff < 0 && "rotate-180")} />
                               {diff.toFixed(1)}%
                            </div>
                         </td>
                         <td className="px-8 py-4 text-right">
                            <button className={cn(
                              "px-3 py-1.5 text-[10px] font-bold transition-all flex items-center gap-2 ml-auto uppercase tracking-widest",
                              selectedId === r.id ? "text-emerald-600" : "text-slate-400 hover:text-slate-800"
                            )}>
                               {selectedId === r.id ? 'Active' : 'Trace'}
                               <ChevronRight size={14} className={cn("transition-transform", selectedId === r.id && "rotate-90")} />
                            </button>
                         </td>
                      </tr>
                    );
                  })}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};
