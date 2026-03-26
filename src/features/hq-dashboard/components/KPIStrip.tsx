import React from 'react';
import { Layout, Users, Activity, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPIStripProps {
  totalPages: number;
  totalUsers: number;
  totalViews: number;
  riskCount: number;
}

export const KPIStrip: React.FC<KPIStripProps> = ({
  totalPages, totalUsers, totalViews, riskCount
}) => {
  const kpis = [
    { label: 'Total Active Pages', value: totalPages, unit: 'Assets', icon: Layout },
    { label: 'Operational Team', value: totalUsers, unit: 'Staffs', icon: Users },
    { label: 'Accumulated Views', value: `${(totalViews / 1000000).toFixed(2)}M`, unit: 'Views', icon: Activity },
    { label: 'Active Alerts', value: riskCount, unit: 'Issues', icon: AlertTriangle, color: 'text-red-500' }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, i) => (
        <div key={i} className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-slate-200">
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <kpi.icon size={14} className="text-slate-300" strokeWidth={1.5} />
            {kpi.label}
          </p>
          <div className="flex items-baseline gap-2">
            <span className={cn("text-2xl font-bold font-outfit tracking-tight", kpi.color || "text-slate-700")}>
              {kpi.value}
            </span>
            <span className="text-[10px] font-medium text-slate-400 tracking-wider lowercase">{kpi.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
