import React from 'react';
import { Users, ShieldCheck, Activity, Layers } from 'lucide-react';

interface StatCardsProps {
  stats: {
    total: number;
    managers: number;
    active: number;
    activeTeams: number;
  };
}

const StatCards: React.FC<StatCardsProps> = ({ stats }) => {
  const statConfig = [
    { label: 'Total Personnel', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Management Unit', value: stats.managers, icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Active Personnel', value: stats.active, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Operational Teams', value: stats.activeTeams, icon: Layers, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="grid grid-cols-4 gap-6">
      {statConfig.map((stat, i) => (
        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50/50 rounded-bl-full -z-10 group-hover:scale-125 transition-transform duration-500"></div>
          
          <span className="text-[10px] font-bold text-slate-400 font-noto uppercase tracking-widest flex items-center gap-2 mb-2">
            <stat.icon size={14} className={stat.color} /> {stat.label}
          </span>
          
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-slate-800 font-inter tracking-tight leading-none">
              {stat.value.toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatCards;
