import React, { useState } from 'react';
import { Plus, Trash2, ShieldCheck, Edit2, Check, X, Users, Briefcase } from 'lucide-react';
import { Team, User, Role } from '@/types';
import { cn } from '@/lib/utils';
import { ROLE_THEME } from '@/constants/personnel';

interface UnitTopologyProps {
  teams: Team[];
  users: User[];
  onDeleteTeam: (id: string) => void;
  onCreateTeam: (name: string) => void;
  onUpdateTeam: (id: string, name: string) => void;
}

const UnitTopology: React.FC<UnitTopologyProps> = ({
  teams,
  users,
  onDeleteTeam,
  onCreateTeam,
  onUpdateTeam
}) => {
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleStartEdit = (team: Team) => {
    setEditingTeamId(team.id);
    setEditName(team.name);
  };

  const handleSaveEdit = (id: string) => {
    if (editName.trim()) {
      onUpdateTeam(id, editName.trim());
    }
    setEditingTeamId(null);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header & Action */}
      <div className="flex items-end justify-between border-b border-slate-100 pb-8">
        <div>
          <h3 className="text-2xl font-bold text-slate-800 font-outfit tracking-tight leading-none mb-1">UNIT TOPOLOGY</h3>
          <p className="text-[11px] text-slate-400 font-noto mt-2 flex items-center gap-2">
            <span className="text-[var(--primary-theme)] font-bold">โครงสร้างองค์กร</span> • Organizational Structure & Mapping
          </p>
        </div>
        <button 
          onClick={() => onCreateTeam(`New Unit ${teams.length + 1}`)}
          className="group flex items-center gap-3 px-8 py-4 bg-[var(--primary-theme)] text-white rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[var(--primary-theme-hover)] transition-all shadow-xl shadow-blue-100/50 active:scale-95"
        >
          <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform">
            <Plus size={14} />
          </div>
          Initialize New Unit
        </button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {teams.map((team) => {
          const teamMembers = users.filter(u => u.teamId === team.id);
          const leader = teamMembers.find(m => m.role === Role.Manager || m.role === Role.Admin);
          const isEditing = editingTeamId === team.id;
          
          return (
            <div key={team.id} className="group relative bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-1.5 transition-all duration-500 overflow-hidden">
              {/* Decorative Background */}
              <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50/30 rounded-bl-full -z-0 group-hover:scale-125 transition-transform duration-700"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                  <div className="flex-1 mr-4">
                    {isEditing ? (
                      <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-300">
                        <input 
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(team.id)}
                          autoFocus
                          className="bg-slate-50 border border-blue-200 rounded-xl px-4 py-2 text-lg font-bold text-[var(--primary-theme)] outline-none w-full"
                        />
                        <button onClick={() => handleSaveEdit(team.id)} className="p-2 bg-[var(--primary-theme)] text-white rounded-xl shadow-lg shadow-blue-100/50 hover:bg-[var(--primary-theme-hover)] transition-colors"><Check size={16} /></button>
                        <button onClick={() => setEditingTeamId(null)} className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:text-slate-600 transition-colors"><X size={16} /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <h4 className="text-xl font-bold text-slate-800 font-outfit tracking-tight leading-none">{team.name}</h4>
                        <button 
                          onClick={() => handleStartEdit(team)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-[var(--primary-theme)] transition-all"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 mt-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                        {teamMembers.length} Active Personnel
                      </span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => onDeleteTeam(team.id)}
                    className="opacity-0 group-hover:opacity-100 w-10 h-10 flex items-center justify-center rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-90"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Team Roster Avatars */}
                <div className="mb-12">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Users size={12} className="text-slate-300" /> Unit Roster
                    </span>
                  </div>
                  <div className="flex -space-x-3 items-center">
                    {teamMembers.slice(0, 6).map((member, i) => (
                      <div 
                        key={member.id}
                        title={member.name}
                        className={cn(
                          "w-11 h-11 rounded-2xl border-4 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-md transition-transform hover:scale-125 hover:z-50 cursor-default",
                          member.role === Role.Admin ? 'bg-slate-900' : 'bg-blue-600'
                        )}
                        style={{ zIndex: 10 - i }}
                      >
                        {member.name.charAt(0)}
                      </div>
                    ))}
                    {teamMembers.length > 6 && (
                      <div className="w-11 h-11 rounded-2xl border-4 border-white bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-400 shadow-sm z-0">
                        +{teamMembers.length - 6}
                      </div>
                    )}
                    {teamMembers.length === 0 && (
                      <div className="text-[10px] font-medium text-slate-300 italic">No assigned personnel</div>
                    )}
                  </div>
                </div>

                {/* Unit Leadership & Incentives */}
                <div className="pt-8 border-t border-slate-50">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Unit Commanding Officers</span>
                    {leader && (
                      <div className="px-2 py-1 bg-blue-50 text-[8px] font-bold text-blue-600 rounded-md uppercase tracking-tight">
                        Incentive Eligible
                      </div>
                    )}
                  </div>
                  
                  {leader ? (
                    <div className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-slate-50/50 border border-slate-100 group-hover:bg-white group-hover:border-blue-100 transition-colors shadow-sm group-hover:shadow-lg group-hover:shadow-blue-500/5">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl text-white flex items-center justify-center text-sm font-bold shadow-md",
                        leader.role === Role.Admin ? 'bg-slate-900' : 'bg-blue-600'
                      )}>
                        {leader.name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-[13px] font-bold text-slate-800 block leading-none font-outfit mb-1.5">{leader.name}</span>
                        <div className="flex items-center gap-2">
                           <ShieldCheck size={10} className="text-blue-500" />
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{leader.role}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-5 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/30">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                        <Users size={18} />
                      </div>
                      <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                        Awaiting Leadership Assignment
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UnitTopology;
