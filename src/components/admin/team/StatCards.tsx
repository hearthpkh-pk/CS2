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
    { label: 'Executive / Mgmt', value: stats.managers, icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Active Roster', value: stats.active, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Active Teams', value: stats.activeTeams, icon: Layers, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="grid grid-cols-4 gap-6">
      {statConfig.map((stat, i) => (
        <div key={i} className="bg-white p-7 rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-md transition-all group">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <stat.icon size={12} className={stat.color} />
            {stat.label}
          </p>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-slate-800 font-inter leading-none">
              {stat.value}
            </span>
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <stat.icon size={20} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatCards;
