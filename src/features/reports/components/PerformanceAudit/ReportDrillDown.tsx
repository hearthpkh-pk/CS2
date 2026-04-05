'use client';

import React from 'react';
import { Target, ArrowRight, Box, Activity, Share2 } from 'lucide-react';
import { DailyReport } from '@/types';
import { cn } from '@/lib/utils';

interface ReportDrillDownProps {
  selectedReport: DailyReport | null;
  onClose: () => void;
}

export const ReportDrillDown: React.FC<ReportDrillDownProps> = ({
  selectedReport,
  onClose
}) => {
  if (!selectedReport) return null;

  return (
    <div className="fixed inset-y-0 right-0 left-0 md:left-20 z-[100] animate-in fade-in duration-500 flex justify-end">
       {/* Backdrop covers ONLY the area to the right of the sidebar */}
       <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
       
       <div className="relative w-full sm:w-[500px] md:w-[600px] lg:w-[700px] bg-white shadow-[-20px_0_80px_rgba(0,0,0,0.1)] animate-in slide-in-from-right duration-700 h-full flex flex-col font-prompt">
          {/* Drawer Header */}
          <div className="p-8 md:p-10 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-20">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-900/20 shrink-0">
                   <Target size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 font-outfit tracking-tight truncate leading-none mb-2">{selectedReport.userName}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] opacity-80 leading-none">Matrix Analytics</p>
                </div>
             </div>
             <button onClick={onClose} className="p-3 text-slate-300 hover:text-slate-900 transition-all hover:bg-slate-50 rounded-2xl focus:outline-none shrink-0 border border-transparent hover:border-slate-100/50">
                <ArrowRight size={24} />
             </button>
          </div>
          
          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-12 custom-scrollbar">
             {/* Summary Section */}
             <div className="space-y-6">
                <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em]">Audit Metrics</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="p-6 rounded-[1.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden relative group">
                      <div className="absolute -right-2 -top-2 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                         <Target size={80} />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 relative z-10">Estimated Views</p>
                      <div className="flex items-baseline gap-1 relative z-10">
                         <p className="text-3xl md:text-4xl font-bold text-slate-900 font-inter tracking-tighter">{(selectedReport.views / 1000000).toFixed(2)}</p>
                         <span className="text-sm font-bold text-slate-300">M</span>
                      </div>
                   </div>
                   <div className="p-6 rounded-[1.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden relative group">
                      <div className="absolute -right-2 -top-2 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                         <Box size={80} />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 relative z-10">Assigned Assets</p>
                      <p className="text-3xl md:text-4xl font-bold text-slate-900 font-inter tracking-tighter relative z-10">{selectedReport.pagesCount}</p>
                   </div>
                </div>
             </div>

             {/* Asset Breakdown - High Density Matrix */}
             <div className="space-y-6 pb-12">
                <div className="flex justify-between items-end">
                   <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em]">Asset Matrix</h4>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-[11px] font-bold text-slate-900 tracking-tight uppercase">Coverage Active</span>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {Array.from({ length: selectedReport.pagesCount }).map((_, i) => (
                     <div key={i} className="flex flex-col p-4 rounded-xl border border-slate-100 hover:border-slate-300 transition-all bg-slate-50/30 group/item hover:bg-white">
                        <div className="flex items-center justify-between mb-3 border-b border-transparent group-hover/item:border-slate-100 pb-2 transition-colors">
                          <div className="flex items-center gap-2.5 min-w-0">
                             <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                                <Activity size={12} className="text-white" />
                             </div>
                             <span className="text-[12px] font-bold text-slate-900 font-prompt truncate">Asset ID 00{i+1}</span>
                          </div>
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${Math.random() > 0.1 ? 'bg-emerald-400' : 'bg-red-400 animate-pulse'}`}></div>
                        </div>
                        <div className="flex justify-between items-center px-1">
                           <div className="space-y-0.5 min-w-0">
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Reach Potential</p>
                              <p className="text-[12px] font-bold text-slate-900 font-inter tracking-tighter">{((Math.random() * 800) + 200).toFixed(0)}K</p>
                           </div>
                           <button className="p-1.5 text-slate-300 hover:text-slate-900 transition-colors shrink-0">
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
               onClick={onClose}
               className="w-full py-5 rounded-2xl bg-slate-900 text-[11px] font-bold text-white uppercase tracking-[0.3em] hover:bg-blue-600 transition-all active:scale-[0.98] shadow-lg shadow-slate-900/10"
             >
               Exit Analysis Matrix
             </button>
          </div>
       </div>
    </div>
  );
};
