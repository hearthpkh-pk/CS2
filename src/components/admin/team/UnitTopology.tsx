import React from 'react';
import { Plus, Trash2, ShieldAlert } from 'lucide-react';
import { Team, User, Role } from '@/types';
import { cn } from '@/lib/utils';

interface UnitTopologyProps {
  teams: Team[];
  users: User[];
  onDeleteTeam: (id: string) => void;
  onCreateTeam: (name: string) => void;
}

const UnitTopology: React.FC<UnitTopologyProps> = ({
  teams,
  users,
  onDeleteTeam,
  onCreateTeam
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800 font-outfit uppercase tracking-tight">Unit Topology</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-1">Manage organizational structure & leadership</p>
        </div>
        <button 
          onClick={() => onCreateTeam(`Alpha ${teams.length + 1}`)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200"
        >
          <Plus size={14} /> Initialize Unit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teams.map((team) => {
          const teamMembers = users.filter(u => u.teamId === team.id);
          const leader = teamMembers.find(m => m.role === Role.Manager || m.role === Role.Admin);
          
          return (
            <div key={team.id} className="group relative bg-white border border-slate-50 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start mb-10">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-slate-800 font-outfit uppercase tracking-tight">{team.name}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{teamMembers.length} Active personnel</span>
                  </div>
                </div>
                <button 
                  onClick={() => onDeleteTeam(team.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all active:scale-90"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Roster Preview */}
              <div className="relative mb-10 h-10 flex items-center">
                <div className="flex -space-x-3 overflow-hidden ml-1">
                  {teamMembers.slice(0, 5).map((member, i) => (
                    <div 
                      key={member.id}
                      title={member.name}
                      style={{ zIndex: 10 - i }}
                      className={cn(
                        "w-9 h-9 rounded-xl border-4 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-1 ring-slate-100",
                        member.role === Role.Admin ? 'bg-slate-900' : member.role === Role.Manager ? 'bg-indigo-600' : 'bg-blue-600'
                      )}
                    >
                      {member.name.charAt(0)}
                    </div>
                  ))}
                  {teamMembers.length > 5 && (
                    <div className="w-9 h-9 rounded-xl border-4 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 shadow-sm z-0 ring-1 ring-slate-100">
                      +{teamMembers.length - 5}
                    </div>
                  )}
                </div>
              </div>

              {/* Team Leader Section */}
              <div className="pt-8 border-t border-slate-50">
                <div className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-4">Unit Commanding</div>
                {leader ? (
                  <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-3xl border border-slate-50/50">
                    <div className={cn(
                      "w-10 h-10 rounded-2xl text-white flex items-center justify-center text-xs font-bold shadow-sm ring-4 ring-slate-50",
                      leader.role === Role.Admin ? 'bg-slate-900' : 'bg-indigo-600'
                    )}>
                      {leader.name.charAt(0)}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-700 block leading-none font-outfit">{leader.name}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 block">{leader.role}</span>
                    </div>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl text-[9px] font-bold uppercase tracking-widest border border-amber-100">
                    <ShieldAlert size={10} /> Needs Leader
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UnitTopology;
