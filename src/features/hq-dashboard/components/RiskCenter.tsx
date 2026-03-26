import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { RiskRadarEntry } from '../services/hqDashboardService';
import { cn } from '@/lib/utils';

interface RiskCenterProps {
  risks: RiskRadarEntry[];
}

export const RiskCenter: React.FC<RiskCenterProps> = ({ risks }) => {
  return (
    <div className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 min-h-[400px]">
      <div className="flex items-center gap-2 mb-8">
        <ShieldAlert size={16} className="text-slate-400" strokeWidth={1.5} />
        <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-widest">Global Risk Radar</h3>
      </div>

      {risks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-300">
          <ShieldAlert size={32} className="opacity-20 mb-4" strokeWidth={1} />
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em]">Operational Health Normal</p>
        </div>
      ) : (
        <div className="space-y-4">
          {risks.slice(0, 10).map((risk, i) => (
            <div 
              key={i} 
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 transition-all hover:border-red-100 animate-in slide-in-from-right duration-300" 
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={cn(
                "w-1 h-1 rounded-full mt-2 flex-shrink-0",
                risk.severity === 'High' ? 'bg-red-500' : 'bg-amber-400'
              )}></div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">{risk.type}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                  <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest">{risk.assigneeName}</span>
                </div>
                <p className="text-sm font-medium text-slate-700 font-prompt line-clamp-1">{risk.entityName}</p>
                <p className="text-[11px] text-slate-400 font-prompt leading-relaxed">{risk.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
