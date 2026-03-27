'use client';

import React from 'react';
import { BarChart2 } from 'lucide-react';

export const ExecutiveStats = ({ reports }: { reports: any[] }) => {
  return (
    <div className="animate-in fade-in duration-1000 min-h-[400px] flex flex-col items-center justify-center text-center space-y-6 bg-white/50 backdrop-blur-md rounded-[3rem] border border-slate-100 p-12">
       <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm border border-blue-100/50">
          <BarChart2 size={24} />
       </div>
       <div>
          <h3 className="text-xl font-bold text-slate-800 font-outfit tracking-tight mb-2">Statistics & Strategic Analytics</h3>
          <p className="text-slate-400 font-noto text-xs max-w-xs leading-relaxed">
             This module is currently being configured for enterprise-grade analytics.
          </p>
       </div>
    </div>
  );
};
