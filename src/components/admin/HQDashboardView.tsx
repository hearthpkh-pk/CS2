import React from 'react';
import { 
  Users, Settings, Activity, PieChart 
} from 'lucide-react';
import { Page, FBAccount, User } from '@/types';

interface HQDashboardViewProps {
  pages: Page[];
  accounts: FBAccount[];
  users: User[];
}

export const HQDashboardView: React.FC<HQDashboardViewProps> = ({ pages, accounts, users }) => {
  const staffUsers = users.filter(u => u.role === 'Staff');

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 font-outfit uppercase tracking-tight">HQ Dashboard</h2>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.2em] mt-1">ทีมงานและภาพรวมองค์กร • Team Aggregation</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-500 font-noto focus:ring-2 ring-emerald-100 outline-none">
            <option>กรองรายคน (Staff Filter)</option>
            {staffUsers.map(u => <option key={u.id}>{u.name}</option>)}
          </select>
          <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-500 font-noto focus:ring-2 ring-emerald-100 outline-none">
            <option>กรองตามสถานะ (Status)</option>
            <option>Live Only</option>
            <option>Restricted</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Pages', val: pages.length, icon: Settings, color: 'text-blue-500' },
          { label: 'Total Accounts', val: accounts.length, icon: Users, color: 'text-emerald-500' },
          { label: 'Team Activity', val: '98%', icon: Activity, color: 'text-blue-400' },
          { label: 'Avg Health', val: 'Good', icon: Activity, color: 'text-slate-700' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
              <stat.icon size={16} className={stat.color} />
            </div>
            <p className="text-2xl font-black text-slate-700 font-inter">{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/40 border border-dashed border-slate-200 rounded-[3rem] h-64 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <PieChart size={48} className="mx-auto mb-4 opacity-10" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Team Charts & Analytics Hub</p>
        </div>
      </div>
    </div>
  );
};
