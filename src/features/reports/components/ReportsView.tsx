'use client';

import React, { useState } from 'react';
import { Target, Clock, Activity, Share2, ChevronRight, ArrowRight, Box, Search, Users, FileText, BarChart2 } from 'lucide-react';
import { DailyReport, mockReports } from '../mocks/reportMocks';
import { reportService } from '../services/reportService';
import { ExecutiveStats } from './PerformanceAudit/ExecutiveStats';

interface ReportsViewProps {
  currentUser: any;
  policy: any;
}

export const ReportsView = ({ currentUser, policy }: ReportsViewProps) => {
  const [reports] = useState<DailyReport[]>(reportService.getDailyStatus());
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [viewMode, setViewMode] = useState<'report' | 'stats'>('report');
  const [filterMode, setFilterMode] = useState<'all' | 'brand' | 'team' | 'tag'>('all');
  const [activeFilterValue, setActiveFilterValue] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set(reports.filter((r: DailyReport) => r.isPinned).map((r: DailyReport) => r.id)));

  const togglePin = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newPinned = new Set(pinnedIds);
    if (newPinned.has(id)) newPinned.delete(id);
    else newPinned.add(id);
    setPinnedIds(newPinned);
  };

  // Logic for generating unique options
  const uniqueTeams = Array.from(new Set(reports.map(r => r.team)));
  const uniqueBrands = Array.from(new Set(reports.map(r => r.brand).filter(b => b !== 'None')));
  const uniqueTags = Array.from(new Set(reports.flatMap(r => r.tags || [])));

  const sortedReports = [...reports].sort((a: DailyReport, b: DailyReport) => {
    const aPinned = pinnedIds.has(a.id);
    const bPinned = pinnedIds.has(b.id);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return a.userName.localeCompare(b.userName);
  });

  const filteredReports = sortedReports.filter((r: DailyReport) => {
    // Search Filter
    if (searchTerm && !r.userName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    // Category Filter
    if (filterMode === 'all') return true;
    if (filterMode === 'team') return activeFilterValue ? r.team === activeFilterValue : true;
    if (filterMode === 'brand') return activeFilterValue ? r.brand === activeFilterValue : r.brand !== 'None';
    if (filterMode === 'tag') return activeFilterValue ? r.tags?.includes(activeFilterValue) : r.tags && r.tags.length > 0;
    return true;
  });

  const selectFilter = (mode: 'all' | 'brand' | 'team' | 'tag', value: string | null = null) => {
    if (filterMode === mode && !value) {
      setFilterMode('all');
      setActiveFilterValue(null);
    } else {
      setFilterMode(mode);
      setActiveFilterValue(value);
    }
  };

  return (
    <>
      <div className="animate-fade-in max-w-6xl mx-auto pb-20 px-4 sm:px-0 relative text-slate-900">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 border-b border-slate-100 pb-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-800 font-outfit tracking-tight flex items-center gap-3">
              Reports & Statistics
            </h2>
            <div className="flex items-center gap-2.5 text-slate-400 font-noto text-[9px] uppercase tracking-[0.2em] font-medium">
              <div className="w-1 h-1 rounded-full bg-blue-500"></div>
              Command Console • 27 Mar 2026
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
             {/* Mode Switcher */}
             <div className="inline-flex p-1.5 bg-slate-100/80 rounded-2xl border border-slate-100 shadow-sm relative z-10 shrink-0">
                <button 
                  onClick={() => setViewMode('report')}
                  title="Report Matrix"
                  className={`p-2 rounded-xl transition-all duration-300 ${viewMode === 'report' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <FileText size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('stats')}
                  title="Performance Statistics"
                  className={`p-2 rounded-xl transition-all duration-300 ${viewMode === 'stats' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <BarChart2 size={18} />
                </button>
             </div>

             <div className="relative group w-full md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                <input 
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-100 rounded-2xl pl-11 pr-4 py-3 text-[13px] font-medium text-slate-600 focus:outline-none focus:border-blue-200 focus:ring-4 focus:ring-blue-50/20 transition-all placeholder:text-slate-300"
                />
             </div>
          </div>
        </div>

        {viewMode === 'report' ? (
          <>
            {/* Precision KPI Summary Grid - HQ Control Center Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
               {[
                 { id: 'all', label: 'Total Personnel', icon: Users, value: reports.length, unit: 'operators' },
                 { id: 'team', label: 'Operational Teams', icon: Activity, value: uniqueTeams.length, unit: 'groups' },
                 { id: 'brand', label: 'Client Brands', icon: Share2, value: uniqueBrands.length, unit: 'assets' },
                 { id: 'tag', label: 'Priority Groups', icon: Target, value: uniqueTags.length, unit: 'focus areas' }
               ].map((card) => (
                 <button 
                   key={card.id}
                   onClick={() => selectFilter(card.id as any)}
                   className={`bg-white p-6 rounded-[1.5rem] border transition-all text-left group relative ${
                     filterMode === card.id 
                     ? 'border-blue-300 shadow-md ring-4 ring-blue-50/30' 
                     : 'border-slate-100 hover:border-slate-200 shadow-sm'
                   }`}
                 >
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <card.icon size={14} className={filterMode === card.id ? 'text-blue-500' : 'text-slate-300'} strokeWidth={1.5} />
                      {card.label}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-2xl font-bold font-outfit tracking-tight ${filterMode === card.id ? 'text-blue-600' : 'text-slate-700'}`}>
                        {card.value}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 tracking-wider lowercase opacity-60">
                        {card.unit}
                      </span>
                    </div>
                    {filterMode === card.id && (
                      <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                    )}
                 </button>
               ))}
            </div>

            {/* Drill-down Sub-Filter (Pills) */}
            {(filterMode !== 'all') && (
              <div className="flex flex-wrap items-center gap-2 mb-8 animate-in slide-in-from-top-2 duration-300 bg-slate-50/50 p-2 rounded-2xl border border-slate-50">
                 {(filterMode === 'team' ? uniqueTeams : filterMode === 'brand' ? uniqueBrands : uniqueTags).map(val => (
                    <button
                      key={val}
                      onClick={() => setActiveFilterValue(activeFilterValue === val ? null : val)}
                      className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all border ${
                        activeFilterValue === val 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-blue-100 hover:text-slate-600'
                      }`}
                    >
                      {val}
                    </button>
                 ))}
                 {activeFilterValue && (
                    <button 
                      onClick={() => setActiveFilterValue(null)}
                      className="px-4 py-2 rounded-xl text-[10px] font-bold text-blue-500 hover:bg-blue-50 transition-all flex items-center gap-1.5"
                    >
                       Clear Selection
                    </button>
                 )}
              </div>
            )}

            {/* Main List */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
              <div className="overflow-x-auto relative">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead className="bg-slate-50/40">
                    <tr className="border-b border-slate-50">
                      <th className="pl-12 pr-6 py-6 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] opacity-80">Operational Staff</th>
                      <th className="px-6 py-6 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] opacity-80">Running Campaigns</th>
                      <th className="px-6 py-6 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] opacity-80 text-center">Output Volume</th>
                      <th className="px-6 py-6 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] opacity-80 text-center">Sync Time</th>
                      <th className="pl-6 pr-12 py-6 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] opacity-80 text-right">Drill-down</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredReports.map((report) => (
                      <tr 
                        key={report.id} 
                        className={`hover:bg-slate-50/80 transition-all duration-300 group cursor-pointer ${pinnedIds.has(report.id) ? 'bg-blue-50/10' : ''}`}
                        onClick={() => setSelectedReport(report)}
                      >
                        <td className="pl-12 pr-6 py-6">
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={(e) => togglePin(e, report.id)}
                              className={`p-1.5 rounded-lg transition-all ${pinnedIds.has(report.id) ? 'text-blue-500' : 'text-slate-200 hover:text-slate-400'}`}
                            >
                              <Target size={14} className={pinnedIds.has(report.id) ? 'fill-blue-500' : ''} />
                            </button>

                            <div className="w-11 h-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:border-blue-200 group-hover:text-blue-500 transition-all shadow-sm shrink-0">
                              <span className="text-xs font-bold">{report.userName.charAt(0)}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-[15px] font-medium text-slate-800 font-noto tracking-tight truncate flex items-center gap-2">
                                {report.userName}
                                {pinnedIds.has(report.id) && <span className="text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">Pinned</span>}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest border border-slate-100 px-1.5 py-0.5 rounded-lg">{report.team}</span>
                                {report.tags && report.tags.map((tag: string) => (
                                  <span key={tag} className="text-[9px] text-emerald-500 font-bold border border-emerald-100 px-1.5 py-0.5 rounded-lg uppercase tracking-widest">{tag}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex flex-wrap gap-2">
                            {report.brand !== 'None' ? (
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-100 group-hover:border-blue-100 transition-colors bg-white/50">
                                <Share2 size={10} className="text-slate-300" />
                                <span className="text-[11px] font-medium text-slate-500 font-noto whitespace-nowrap">
                                  {report.brand}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] font-medium text-slate-300 italic tracking-wider">No Active Brands</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex flex-col items-center gap-2">
                            <p className="text-[13px] font-medium text-slate-600 font-inter">
                              {report.postCount} <span className="text-[10px] text-slate-300">/ {report.totalPostsRequired}</span>
                            </p>
                            <div className="w-24 h-1 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                              <div 
                                className={`h-full transition-all duration-700 ease-out ${report.status === 'Complete' ? 'bg-emerald-400' : 'bg-amber-400'}`} 
                                style={{ width: `${(report.postCount / (report.totalPostsRequired || 1)) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-center">
                           <div className="inline-flex items-center gap-2.5 text-slate-400">
                              <Clock size={13} strokeWidth={1.5} className="group-hover:text-blue-400 transition-colors" />
                              <span className="text-[12px] font-medium font-inter group-hover:text-slate-700 transition-colors">{report.submissionTime}</span>
                           </div>
                        </td>
                        <td className="pl-12 pr-12 py-6 text-right">
                          <div className="inline-flex p-2.5 text-slate-300 group-hover:text-blue-500 transition-all bg-white rounded-2xl border border-slate-50 group-hover:border-blue-100 shadow-sm group-hover:shadow-md">
                             <ChevronRight size={18} strokeWidth={2} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <ExecutiveStats reports={reports} />
        )}
      </div>

      {/* Drill-down Drawer - Portal-like Overlay outside content container */}
      {selectedReport && (
        <div className="fixed inset-y-0 right-0 left-0 md:left-20 z-[100] animate-in fade-in duration-500 flex justify-end">
           {/* Backdrop covers ONLY the area to the right of the sidebar */}
           <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setSelectedReport(null)} />
           
           <div className="relative w-full sm:w-[500px] md:w-[600px] lg:w-[700px] bg-white shadow-[-20px_0_80px_rgba(0,0,0,0.1)] animate-in slide-in-from-right duration-700 h-full flex flex-col">
              {/* Drawer Header */}
              <div className="p-8 md:p-10 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-20">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl border border-blue-100 flex items-center justify-center text-blue-500 shadow-sm shrink-0">
                       <Target size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xl md:text-2xl font-bold text-slate-800 font-outfit tracking-tight truncate">{selectedReport.userName}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.25em] mt-1 opacity-80">Depth Matrix Analysis</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedReport(null)} className="p-3 text-slate-300 hover:text-slate-800 transition-all hover:bg-slate-50 rounded-2xl focus:outline-none shrink-0">
                    <ArrowRight size={24} />
                 </button>
              </div>
              
              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-12 custom-scrollbar rtl">
                 {/* Summary Section */}
                 <div className="space-y-6 ltr">
                    <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">Operational Metrics</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       <div className="p-6 rounded-[1.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden relative">
                          <div className="absolute -right-2 -top-2 opacity-[0.03]">
                             <Target size={80} />
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 relative z-10">Total Estimated Views</p>
                          <div className="flex items-baseline gap-1 relative z-10">
                             <p className="text-3xl md:text-4xl font-bold text-slate-800 font-inter tracking-tighter">{(selectedReport.views / 1000000).toFixed(2)}</p>
                             <span className="text-sm font-bold text-slate-300">M</span>
                          </div>
                       </div>
                       <div className="p-6 rounded-[1.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden relative">
                          <div className="absolute -right-2 -top-2 opacity-[0.03]">
                             <Box size={80} />
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 relative z-10">Assigned Assets</p>
                          <p className="text-3xl md:text-4xl font-bold text-slate-800 font-inter tracking-tighter relative z-10">{selectedReport.pagesCount}</p>
                       </div>
                    </div>
                 </div>

                 {/* Asset Breakdown - Compact Grid */}
                 <div className="space-y-6 pb-12 ltr">
                    <div className="flex justify-between items-end">
                       <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">Operational Asset Matrix</h4>
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          <span className="text-[11px] font-medium text-slate-400 font-inter tracking-tight">Active Coverage</span>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {Array.from({ length: selectedReport.pagesCount }).map((_, i) => (
                         <div key={i} className="flex flex-col p-4 rounded-2xl border border-slate-50 hover:border-blue-50 transition-all hover:bg-slate-50/30 group/item">
                            <div className="flex items-center justify-between mb-3 border-b border-transparent group-hover/item:border-slate-100 pb-2 transition-colors">
                              <div className="flex items-center gap-2.5 min-w-0">
                                 <div className="w-6 h-6 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0">
                                    <Activity size={10} className="text-slate-300 group-hover/item:text-blue-400" />
                                 </div>
                                 <span className="text-[12px] font-semibold text-slate-600 font-noto truncate">Page Unit {i+1}</span>
                              </div>
                              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${Math.random() > 0.1 ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                            </div>
                            <div className="flex justify-between items-center px-1">
                               <div className="space-y-0.5 min-w-0">
                                  <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Est. Reach</p>
                                  <p className="text-[11px] font-bold text-slate-500 font-inter tracking-tighter">{((Math.random() * 800) + 200).toFixed(0)}K</p>
                               </div>
                               <button className="p-1.5 text-slate-300 hover:text-blue-500 transition-colors shrink-0">
                                  <Share2 size={12} strokeWidth={2} />
                                </button>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-8 md:p-10 border-t border-slate-50 bg-white sticky bottom-0">
                 <button 
                   onClick={() => setSelectedReport(null)}
                   className="w-full py-5 rounded-2xl border border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] hover:bg-slate-50 hover:text-slate-800 transition-all active:scale-[0.98] shadow-sm"
                 >
                   Exit Detailed Matrix View
                 </button>
              </div>
           </div>
        </div>
      )}
    </>
  );
};
