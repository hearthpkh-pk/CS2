import React from 'react';
import { Edit3, MoreHorizontal } from 'lucide-react';
import { User, Role, Team } from '@/types';
import { cn } from '@/lib/utils';
import { ROLE_LABELS, ROLE_THEME, PERSONNEL_LABELS } from '@/constants/personnel';

interface PersonnelTableProps {
  users: User[];
  onEdit: (user: User) => void;
  teams: Team[];
}

const PersonnelTable: React.FC<PersonnelTableProps> = ({
  users,
  onEdit,
  teams
}) => {
  const roleWeights: Record<string, number> = {
    [Role.SuperAdmin]: 4,
    [Role.Admin]: 3,
    [Role.Manager]: 2,
    [Role.Staff]: 1
  };

  const sortedUsers = [...users].sort((a, b) => {
    return (roleWeights[b.role] || 0) - (roleWeights[a.role] || 0);
  });

  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <table className="w-full border-collapse min-w-[1000px]">
        <thead>
          <tr className="border-b border-slate-50">
            <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Personnel Identity</th>
            <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
            <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workload Group</th>
            <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Brand Assignment</th>
            <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50/50">
          {sortedUsers.map((user) => {
            const teamName = teams.find(t => t.id === user.teamId)?.name || PERSONNEL_LABELS.UNASSIGNED;
            const theme = ROLE_THEME[user.role] || ROLE_THEME[Role.Staff];
            
            return (
              <tr 
                key={user.id} 
                className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                onClick={() => onEdit(user)}
              >
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm transition-transform group-hover:scale-105 overflow-hidden",
                      theme.bg, theme.color
                    )}>
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      ) : user.email ? (
                        <img 
                          src={`https://www.gravatar.com/avatar/${btoa(user.email).substring(0, 32)}?d=404`} 
                          alt={user.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : null}
                      <span className="absolute">{user.name.trim().slice(-1)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 tracking-tight">{user.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{user.email || 'No email provided'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest",
                        theme.bg, theme.color
                      )}>
                        {ROLE_LABELS[user.role]}
                      </span>
                    </div>
                    {user.status && (
                      <p className="text-[9px] font-semibold text-blue-500 uppercase tracking-widest">
                        {user.status === 'Pending' && 'รอเริ่มงาน'}
                        {user.status === 'Probation' && 'ทดลองงาน'}
                        {user.status === 'Official' && 'พนักงานประจำ'}
                        {user.status === 'Resigned' && 'ลาออก'}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">
                      {user.department || 'General'}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  {user.brand ? (
                    <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-blue-100">
                      {user.brand}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">
                      No Brand
                    </span>
                  )}
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(user);
                      }}
                      className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50 transition-all shadow-sm"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button 
                      className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                    >
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PersonnelTable;
