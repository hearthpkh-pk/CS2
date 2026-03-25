import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, UserPlus, ShieldAlert, Check, X, Search, Building, Key, Edit3, Plus, TrendingUp, Calendar, AlertCircle
} from 'lucide-react';
import { User, Role, Team, SalaryAdjustment } from '@/types';

interface Props {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  currentUser: User;
}

type TabKey = 'directory' | 'organization' | 'permissions';

export const TeamManagementView: React.FC<Props> = ({ users, setUsers, currentUser }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('directory');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Dynamic Teams State (Mock DB)
  const [teams, setTeams] = useState<Team[]>([
    { id: 'team-a', name: 'Team A (Alpha)' },
    { id: 'team-b', name: 'Team B (Beta)' }
  ]);
  const [newTeamName, setNewTeamName] = useState('');

  // Salary Adjustment State
  const [isAdjustingSalary, setIsAdjustingSalary] = useState(false);
  const [salaryForm, setSalaryForm] = useState({
    amount: 0,
    reason: '',
    effectiveDate: new Date().toISOString().split('T')[0]
  });

  const getFiltered = () => {
    // SECURITY RULE: Hide Super Admin from directory lists entirely
    let list = users.filter(u => u.role !== Role.SuperAdmin);
    
    if (searchTerm) {
      list = list.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())));
    }
    return list;
  };

  const handleCreateUser = () => {
    const newUser: User = {
      id: `u-${Date.now()}`,
      name: '',
      username: `u_${Date.now().toString().slice(-4)}`,
      email: '',
      temporaryPassword: '',
      role: Role.Staff,
      salary: 0,
      salaryHistory: [],
      bankName: '',
      bankAccount: '',
      startDate: new Date().toISOString().split('T')[0],
      isActive: true
    };
    setEditingUser(newUser);
    setIsAdjustingSalary(false);
  };

  const handleSaveUser = (updatedUser: User) => {
    const isNew = !users.some(u => u.id === updatedUser.id);
    if (isNew) {
      setUsers([...users, updatedUser]);
    } else {
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    }
    setEditingUser(null);
    setIsAdjustingSalary(false);
  };

  const handleConfirmSalary = () => {
    if (!editingUser) return;
    if (salaryForm.amount <= 0 || !salaryForm.reason) {
      alert("Please provide a valid amount and reason for the adjustment.");
      return;
    }

    const adjustment: SalaryAdjustment = {
      id: `adj-${Date.now()}`,
      newSalary: salaryForm.amount,
      reason: salaryForm.reason,
      effectiveDate: salaryForm.effectiveDate,
      createdAt: new Date().toISOString()
    };

    setEditingUser({
      ...editingUser,
      salary: salaryForm.amount,
      salaryHistory: [...(editingUser.salaryHistory || []), adjustment]
    });
    
    setIsAdjustingSalary(false);
  };

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) return;
    const newTeam: Team = {
      id: `team-${Date.now().toString().slice(-4)}`,
      name: newTeamName
    };
    setTeams([...teams, newTeam]);
    setNewTeamName('');
  };

  const handleDeleteTeam = (id: string) => {
    setTeams(teams.filter(t => t.id !== id));
    // Also unassign users in this team
    setUsers(users.map(u => u.teamId === id ? { ...u, teamId: undefined } : u));
  };

  return (
    <div className="animate-fade-in font-prompt max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-outfit tracking-tight flex items-center gap-3">
            <ShieldAlert className="text-blue-500" size={24} /> 
            Team Management
          </h2>
          <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase tracking-widest font-bold mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/60"></div>
            Human Resources Information System
          </div>
        </div>
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100 overflow-x-auto">
           <button 
             onClick={() => setActiveTab('directory')}
             className={`px-4 py-2 rounded-lg font-bold text-[9px] uppercase tracking-widest whitespace-nowrap transition-all
               ${activeTab === 'directory' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}
             `}
           >
             Directory
           </button>
           <button 
             onClick={() => setActiveTab('organization')}
             className={`px-4 py-2 rounded-lg font-bold text-[9px] uppercase tracking-widest whitespace-nowrap transition-all
               ${activeTab === 'organization' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}
             `}
           >
             Teams
           </button>
           <button 
             onClick={() => setActiveTab('permissions')}
             className={`px-4 py-2 rounded-lg font-bold text-[9px] uppercase tracking-widest whitespace-nowrap transition-all
               ${activeTab === 'permissions' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}
             `}
           >
             Access Config
           </button>
        </div>
      </div>

      {activeTab === 'directory' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex items-center justify-between">
            <div className="relative w-64 group">
               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500" />
               <input 
                 type="text" 
                 placeholder="Search personnel..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all"
               />
            </div>
            <button 
              onClick={handleCreateUser}
              title="New Employee"
              className="p-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/10 transition-all shrink-0 active:scale-95"
            >
              <UserPlus size={18} />
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm overflow-x-auto overflow-y-hidden">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Personnel</th>
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Record</th>
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role & Team</th>
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Start Date</th>
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-12 text-right">Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {getFiltered().map(user => {
                  const isSuperAdmin = user.role === Role.SuperAdmin;
                  const canEdit = currentUser.role === Role.SuperAdmin || (currentUser.role === Role.Admin && !isSuperAdmin);

                  const teamName = teams.find(t => t.id === user.teamId)?.name || 'Unassigned';

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-sm
                            ${user.role === Role.Admin ? 'bg-cyan-500' : 
                              user.role === Role.Manager ? 'bg-blue-500' : 'bg-slate-300'}
                          `}>
                            {user.name.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-700">{user.name || 'Unnamed'}</div>
                            <div className="text-[10px] font-medium text-slate-400">ID: {user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="text-xs font-semibold text-slate-500">{user.email || 'No email provided'}</div>
                      </td>
                      <td className="py-4">
                        <div className={`text-[10px] font-bold uppercase tracking-widest mb-0.5
                          ${user.role === Role.Admin ? 'text-cyan-600' : 
                            user.role === Role.Manager ? 'text-blue-600' : 'text-slate-500'}
                        `}>
                          {user.role}
                        </div>
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{teamName}</div>
                      </td>
                      <td className="py-4 text-right">
                        <span className="text-xs font-semibold text-slate-600">{user.startDate || '-'}</span>
                      </td>
                      <td className="py-4 text-center">
                        <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest 
                          ${user.isActive ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        {canEdit && (
                          <button 
                            onClick={() => {
                              setEditingUser(user);
                              setIsAdjustingSalary(false);
                            }}
                            className="p-2 text-slate-300 hover:text-blue-500 hover:bg-white rounded-lg transition-all inline-block border border-transparent hover:border-slate-100 hover:shadow-sm"
                            title="Edit Personnel"
                          >
                            <Edit3 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'organization' && (
        <div className="space-y-8 animate-in fade-in duration-500 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-700">Operational Teams</h3>
              <p className="text-xs text-slate-400 font-medium">Manage team structure and leadership assignments.</p>
            </div>
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
              <input 
                type="text" 
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Team Name..."
                className="bg-transparent px-3 py-1.5 text-xs font-semibold outline-none flex-1 min-w-[120px]"
              />
              <button 
                onClick={handleCreateTeam}
                disabled={!newTeamName.trim()}
                title="Create Team"
                className="p-2 bg-slate-800 text-white hover:bg-black disabled:bg-slate-200 rounded-xl transition-all shrink-0"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map(team => {
              const teamMembers = users.filter(u => u.teamId === team.id && u.role !== Role.SuperAdmin);
              const potentialLeaders = teamMembers.filter(u => u.role === Role.Manager || u.role === Role.Admin);
              const leader = potentialLeaders.find(u => u.role === Role.Admin) || potentialLeaders.find(u => u.role === Role.Manager);
              
              return (
                <div key={team.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm relative group hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-base font-bold text-slate-800">{team.name}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Users size={12} className="text-slate-300" />
                        <span className="text-xs font-semibold text-slate-400">{teamMembers.length} active personnel</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteTeam(team.id)}
                      className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all active:scale-95"
                      title="Delete Team"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-slate-300 mb-2">Team Leader</div>
                      {leader ? (
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg text-white flex items-center justify-center text-[10px] font-bold shadow-sm
                            ${leader.role === Role.Admin ? 'bg-cyan-500' : 'bg-blue-500'}
                          `}>
                            {leader.name.charAt(0)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-700 block leading-tight">{leader.name}</span>
                            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-tight">{leader.role}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[10px] font-semibold text-amber-500 bg-amber-50/50 px-2 py-1 rounded-lg flex items-center gap-1">
                          <AlertCircle size={10} /> Needs Leader
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="flex items-center justify-center h-80 bg-slate-50 border border-slate-100 rounded-[2.5rem]">
           <div className="text-center">
             <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center mx-auto mb-4">
               <Key size={32} className="text-slate-300" />
             </div>
             <p className="text-slate-700 font-bold text-sm">Access Permissions Control</p>
             <p className="text-slate-400 font-semibold text-[11px] mt-1 uppercase tracking-widest">Available in sub-page version 3</p>
           </div>
        </div>
      )}

      {/* Editor Drawer - CONTEXT-SCOPED OVERLAY */}
      {editingUser && (
        <div className="fixed inset-0 z-[45] flex justify-end items-stretch overflow-hidden">
          {/* Backdrop blur that covers the main content but stays below Sidebar z-50 */}
          <div 
            className="absolute inset-0 bg-slate-900/10 backdrop-blur-md transition-opacity animate-in fade-in duration-500" 
            onClick={() => setEditingUser(null)}
          ></div>
          
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out border-l border-slate-100">
            
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-7 border-b border-slate-50">
              <h3 className="text-xl font-bold font-outfit text-slate-800 tracking-tight">
                {users.some(u => u.id === editingUser.id) ? 'Personnel Profile' : 'New Personnel Entry'}
              </h3>
              <button 
                onClick={() => setEditingUser(null)}
                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-12 pb-32 scrollbar-hide font-prompt">
              
              {/* Section: System Access */}
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40"></div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 font-outfit">System Access</h4>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Login Email</label>
                    <input 
                      type="email" 
                      value={editingUser.email || ''}
                      onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                      placeholder="email@organization.com"
                      className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 transition-all font-prompt placeholder:font-prompt placeholder:text-slate-300"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Security Password</label>
                    <input 
                      type="text" 
                      value={editingUser.temporaryPassword || ''}
                      onChange={(e) => setEditingUser({...editingUser, temporaryPassword: e.target.value})}
                      placeholder="Set initial password..."
                      className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 transition-all font-mono placeholder:font-prompt placeholder:text-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Identity */}
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40"></div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 font-outfit">Identity Record</h4>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Display Name (Code Name)</label>
                  <input 
                    type="text" 
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                    placeholder="Enter unique codename..."
                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 transition-all font-prompt placeholder:font-prompt placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* Section: Role & Placement */}
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40"></div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 font-outfit">Role & Placement</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Job Role</label>
                    <div className="relative group">
                      <select 
                        value={editingUser.role}
                        onChange={(e) => setEditingUser({...editingUser, role: e.target.value as Role})}
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500/30 transition-all appearance-none cursor-pointer font-prompt"
                      >
                        <option value={Role.Staff}>Staff</option>
                        <option value={Role.Manager}>Manager</option>
                        <option value={Role.Admin}>Admin</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Team Assignment</label>
                    <select 
                      value={editingUser.teamId || ''}
                      onChange={(e) => setEditingUser({...editingUser, teamId: e.target.value || undefined})}
                      className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500/30 transition-all appearance-none cursor-pointer font-prompt"
                    >
                      <option value="">Unassigned</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Section: Compensation */}
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40"></div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 font-outfit">Compensation Model</h4>
                </div>
                
                <div className="bg-slate-50/80 border border-slate-100 rounded-[2rem] p-6 shadow-sm ring-1 ring-slate-100/50">
                  <div className="flex items-center justify-between mb-5">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-outfit">Base Salary (THB)</label>
                    <button 
                      onClick={() => {
                         setIsAdjustingSalary(!isAdjustingSalary);
                         setSalaryForm({ amount: editingUser.salary || 0, reason: '', effectiveDate: new Date().toISOString().split('T')[0] });
                      }}
                      className="text-[9px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-all px-2 py-1 bg-blue-50 rounded-lg font-outfit"
                    >
                      {isAdjustingSalary ? 'Cancel Update' : 'Adjust Record'}
                    </button>
                  </div>
                  
                  {!isAdjustingSalary ? (
                    <div className="text-3xl font-bold text-slate-800 tracking-tight font-prompt">
                      ฿{(editingUser.salary || 0).toLocaleString()}
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in zoom-in-95 duration-200">
                      <input 
                        type="number" step="1" min="0"
                        onKeyDown={(e) => { if (e.key === '.') e.preventDefault(); }}
                        value={salaryForm.amount || ''}
                        onChange={(e) => setSalaryForm({...salaryForm, amount: parseInt(e.target.value) || 0})}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none shadow-sm font-prompt placeholder:font-prompt placeholder:text-slate-300"
                        placeholder="Amount..."
                      />
                      <input 
                        type="text" 
                        value={salaryForm.reason}
                        onChange={(e) => setSalaryForm({...salaryForm, reason: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-600 outline-none font-prompt placeholder:font-prompt placeholder:text-slate-300"
                        placeholder="Reason for adjustment..."
                      />
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] font-semibold text-slate-400 uppercase font-outfit">Effective:</span>
                         <input 
                           type="date" 
                           value={salaryForm.effectiveDate}
                           onChange={(e) => setSalaryForm({...salaryForm, effectiveDate: e.target.value})}
                           className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 outline-none font-prompt"
                         />
                      </div>
                      <button 
                        onClick={handleConfirmSalary}
                        disabled={!salaryForm.reason || salaryForm.amount <= 0}
                        className="w-full bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest py-3 rounded-xl hover:bg-black transition-all disabled:opacity-30 font-outfit"
                      >
                        Confirm Salary Change
                      </button>
                    </div>
                  )}

                  {editingUser.salaryHistory && editingUser.salaryHistory.length > 0 && !isAdjustingSalary && (
                    <div className="mt-6 pt-6 border-t border-slate-100">
                      <h5 className="text-[9px] font-semibold text-slate-300 uppercase tracking-widest mb-4 font-outfit">Audit History Log</h5>
                      <div className="space-y-4">
                        {editingUser.salaryHistory.map((adj) => (
                          <div key={adj.id} className="flex justify-between items-start gap-4 font-prompt">
                            <div className="flex-1">
                               <div className="text-xs font-bold text-slate-700">฿{adj.newSalary.toLocaleString()}</div>
                               <div className="text-[10px] text-slate-400 font-medium mt-0.5 italic">"{adj.reason}"</div>
                            </div>
                            <div className="text-[9px] font-semibold text-slate-400 bg-slate-100 rounded px-2 py-0.5">
                               {adj.effectiveDate}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section: Timeline */}
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40"></div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 font-outfit">Timeline Milestones</h4>
                </div>
                <div className="grid grid-cols-1 gap-4 font-prompt">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Hiring Date</label>
                    <input 
                      type="date" 
                      value={editingUser.startDate || ''}
                      onChange={(e) => setEditingUser({...editingUser, startDate: e.target.value})}
                      className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">Probation Outcome</label>
                    <input 
                      type="date" 
                      value={editingUser.probationDate || ''}
                      onChange={(e) => setEditingUser({...editingUser, probationDate: e.target.value})}
                      className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-8 pt-6 border-t border-slate-50 bg-white/95 backdrop-blur-md flex justify-end gap-4 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.05)] font-outfit">
              <button 
                onClick={() => setEditingUser(null)}
                className="px-6 py-3 text-xs font-bold text-slate-400 hover:text-slate-600 transition-all hover:bg-slate-50 rounded-xl"
              >
                Discard
              </button>
              <button 
                onClick={() => handleSaveUser(editingUser)}
                className="px-8 py-3 bg-blue-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Save Record
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
