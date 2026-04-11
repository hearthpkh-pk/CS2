import React from 'react';
import { Search, Filter, Edit3, MoreHorizontal } from 'lucide-react';
import { User, Role, Team } from '@/types';
import { cn } from '@/lib/utils';
import { ROLE_LABELS, ROLE_THEME, PERSONNEL_LABELS } from '@/constants/personnel';

interface PersonnelTableProps {
  users: User[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  roleFilter: Role | 'All';
  onRoleFilterChange: (val: Role | 'All') => void;
  onEdit: (user: User) => void;
  teams: Team[];
}

const PersonnelTable: React.FC<PersonnelTableProps> = ({
  users,
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  onEdit,
  teams
}) => {
  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search personnel by name or email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-2xl pl-14 pr-6 py-4 text-sm font-medium text-slate-600 outline-none focus:border-blue-500/20 focus:ring-8 focus:ring-blue-500/5 transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3 p-1 rounded-xl border border-slate-100 shadow-sm">
          {(['All', ...Object.keys(ROLE_LABELS).filter(r => r !== Role.SuperAdmin)] as const).map((role) => (
            <button
              key={role}
              onClick={() => onRoleFilterChange(role as any)}
              className={cn(
                "px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                roleFilter === role ? "bg-[var(--primary-theme)] text-white shadow-lg shadow-blue-100/50" : "text-slate-400 hover:text-[var(--primary-theme)]"
              )}
            >
              {role === 'All' ? 'All Personnel' : ROLE_LABELS[role as Role]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-8 pb-6 pt-8 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] font-outfit">Personnel Record</th>
                <th className="pb-6 pt-8 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] font-outfit text-center">System Identity</th>
                <th className="pb-6 pt-8 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] font-outfit">{PERSONNEL_LABELS.GROUP_HEADER}</th>
                <th className="pb-6 pt-8 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] font-outfit text-right">Placement Date</th>
                <th className="pb-6 pt-8 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] font-outfit text-center">Status</th>
                <th className="px-8 pb-6 pt-8 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] font-outfit text-right w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50/50">
              {users.map((user) => (
                <tr 
                  key={user.id} 
                  onClick={() => onEdit(user)}
                  className="group hover:bg-slate-50/30 transition-colors cursor-pointer"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-sm transition-transform group-hover:scale-110 overflow-hidden",
                        user.role === Role.Admin ? 'bg-slate-900' : 
                        user.role === Role.Manager ? 'bg-indigo-600' : 'bg-[var(--primary-theme)]'
                      )}>
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          user.name.trim().slice(-1)
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800 font-outfit tracking-tight leading-none mb-1">{user.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium font-inter">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 text-center">
                    <div className="text-[10px] font-bold text-slate-800 bg-slate-100/50 px-3 py-1.5 rounded-lg inline-block font-inter">
                      {user.username}
                    </div>
                  </td>
                  <td className="py-5">
                    <div className={cn(
                      "text-[10px] font-bold uppercase tracking-widest mb-1",
                      ROLE_THEME[user.role]?.color || 'text-slate-600'
                    )}>
                      {ROLE_LABELS[user.role]}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium tracking-tight">
                      {user.teamId ? 
                        `${PERSONNEL_LABELS.UNIT_PREFIX} ${teams.find(t => t.id === user.teamId)?.name || user.teamId}` : 
                        PERSONNEL_LABELS.UNASSIGNED
                      }
                    </div>
                  </td>
                  <td className="py-5 text-right">
                    <div className="text-[11px] font-bold text-slate-600 font-inter tracking-tight">{user.startDate || '—'}</div>
                  </td>
                  <td className="py-5">
                    <div className="flex justify-center">
                        <div className={cn(
                           "flex items-center gap-2 px-3 py-1.5 rounded-full",
                           user.isActive ? "bg-emerald-50" : "bg-slate-100"
                        )}>
                          <div className={cn("w-1.5 h-1.5 rounded-full", user.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                          <span className={cn(
                             "text-[9px] font-bold uppercase tracking-widest",
                             user.isActive ? "text-emerald-600" : "text-slate-400"
                          )}>
                            {user.isActive ? 'Active' : 'Offline'}
                          </span>
                        </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => onEdit(user)}
                      className="p-2.5 text-slate-300 hover:text-[var(--primary-theme)] hover:bg-blue-50 rounded-xl transition-all active:scale-95"
                    >
                      <Edit3 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PersonnelTable;
