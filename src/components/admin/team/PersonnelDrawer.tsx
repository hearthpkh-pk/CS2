import React from 'react';
import { X, TrendingUp } from 'lucide-react';
import { User, Team, Role } from '@/types';

interface PersonnelDrawerProps {
  editingUser: User | null;
  onClose: () => void;
  onSave: (user: User) => void;
  onChange: (user: User) => void;
  teams: Team[];
  isAdjustingSalary: boolean;
  onToggleAdjustSalary: (val: boolean) => void;
  salaryForm: { amount: number; reason: string; effectiveDate: string };
  onSalaryFormChange: (form: { amount: number; reason: string; effectiveDate: string }) => void;
  onConfirmSalary: () => void;
  users: User[]; // for existence check
}

const PersonnelDrawer: React.FC<PersonnelDrawerProps> = ({
  editingUser,
  onClose,
  onSave,
  onChange,
  teams,
  isAdjustingSalary,
  onToggleAdjustSalary,
  salaryForm,
  onSalaryFormChange,
  onConfirmSalary,
  users
}) => {
  if (!editingUser) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end items-stretch overflow-hidden">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-500" 
        onClick={onClose}
      ></div>
      
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out border-l border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-10 py-8 border-b border-slate-50">
          <div>
            <h3 className="text-xl font-bold font-outfit text-slate-800 tracking-tight">
              {users.some(u => u.id === editingUser.id) ? 'Registry Profile' : 'New Entry'}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Personnel Documentation System</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-slate-900 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-10 py-10 space-y-16 pb-32 scrollbar-hide">
          
          {/* Section: System Credentials */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-800 font-outfit">System Access</h4>
            </div>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Access Email</label>
                  <input 
                    type="email" 
                    value={editingUser.email || ''}
                    onChange={(e) => onChange({...editingUser, email: e.target.value})}
                    placeholder="user@hq.com"
                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-5 py-3.5 text-xs font-medium text-slate-700 outline-none focus:bg-white focus:border-blue-500/20 focus:ring-8 focus:ring-blue-500/5 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Temporary Token</label>
                  <input 
                    type="text" 
                    value={editingUser.temporaryPassword || ''}
                    onChange={(e) => onChange({...editingUser, temporaryPassword: e.target.value})}
                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500/20 focus:ring-8 focus:ring-blue-500/5 transition-all font-inter"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Personnel Identity */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-800 font-outfit">Identity & Assignment</h4>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Legal Name (Registry)</label>
                <input 
                  type="text" 
                  value={editingUser.name}
                  onChange={(e) => onChange({...editingUser, name: e.target.value})}
                  className="w-full bg-slate-50 border border-transparent rounded-2xl px-5 py-3.5 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-blue-500/20 focus:ring-8 focus:ring-blue-500/5 transition-all font-outfit"
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Operating Role</label>
                  <select 
                    value={editingUser.role}
                    onChange={(e) => onChange({...editingUser, role: e.target.value as Role})}
                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-700 outline-none cursor-pointer"
                  >
                    <option value={Role.Staff}>Staff Personnel</option>
                    <option value={Role.Manager}>Unit Manager</option>
                    <option value={Role.Admin}>System Admin</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Unit Assignment</label>
                  <select 
                    value={editingUser.teamId || ''}
                    onChange={(e) => onChange({...editingUser, teamId: e.target.value || undefined})}
                    className="w-full bg-slate-50 border border-transparent rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Compensation Registry */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-800 font-outfit">Financial Mapping</h4>
            </div>
            
            <div className="bg-slate-50/50 rounded-[2.5rem] p-8 border border-slate-100/50">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <label className="text-[9px] font-bold text-slate-300 uppercase tracking-widest block mb-1">Active Salary Rate</label>
                  <div className="text-3xl font-bold text-slate-800 font-inter tracking-tighter">
                    ฿{editingUser.salary?.toLocaleString()}
                  </div>
                </div>
                <button 
                  onClick={() => {
                     onToggleAdjustSalary(!isAdjustingSalary);
                     onSalaryFormChange({ amount: editingUser.salary || 0, reason: '', effectiveDate: new Date().toISOString().split('T')[0] });
                  }}
                  className="p-3 bg-white text-blue-600 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all active:scale-95"
                >
                  {isAdjustingSalary ? <X size={18} /> : <TrendingUp size={18} />}
                </button>
              </div>
              
              {isAdjustingSalary && (
                <div className="space-y-4 animate-in zoom-in-95 duration-200 mb-8 p-6 bg-white rounded-3xl border border-blue-100/30">
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Updated Amount (THB)</label>
                    <input 
                      type="number" 
                      value={salaryForm.amount || ''}
                      onChange={(e) => onSalaryFormChange({...salaryForm, amount: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 font-inter outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Authorization Reason</label>
                    <input 
                      type="text" 
                      value={salaryForm.reason}
                      onChange={(e) => onSalaryFormChange({...salaryForm, reason: e.target.value})}
                      placeholder="Why this change?"
                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-xs font-medium text-slate-600 outline-none"
                    />
                  </div>
                  <button 
                    onClick={onConfirmSalary}
                    disabled={!salaryForm.reason || salaryForm.amount <= 0}
                    className="w-full bg-blue-600 text-white font-bold text-[10px] uppercase tracking-widest py-4 rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-30 shadow-lg shadow-blue-100"
                  >
                    Commit Adjustment
                  </button>
                </div>
              )}

              {editingUser.salaryHistory && editingUser.salaryHistory.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-slate-100/50">
                  <h5 className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] mb-4">Registry Audit Logs</h5>
                  {editingUser.salaryHistory.map((adj) => (
                    <div key={adj.id} className="flex justify-between items-center bg-white/40 p-3 rounded-2xl">
                      <div>
                        <div className="text-[11px] font-bold text-slate-700 font-inter">฿{adj.newSalary.toLocaleString()}</div>
                        <div className="text-[9px] text-slate-400 font-medium italic mt-0.5">"{adj.reason}"</div>
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg font-inter">
                         {adj.effectiveDate}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-5 mt-6">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Bank Name</label>
                <input 
                  type="text" 
                  value={editingUser.bankName || ''}
                  onChange={(e) => onChange({...editingUser, bankName: e.target.value})}
                  className="w-full bg-slate-50 border border-transparent rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-700 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Account Pattern</label>
                <input 
                  type="text" 
                  value={editingUser.bankAccount || ''}
                  onChange={(e) => onChange({...editingUser, bankAccount: e.target.value})}
                  className="w-full bg-slate-50 border border-transparent rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-800 outline-none font-inter"
                />
              </div>
            </div>
          </div>

          {/* Section: Milestones */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-800 font-outfit">Roster Milestones</h4>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Enlistment Date</label>
                <input 
                  type="date" 
                  value={editingUser.startDate || ''}
                  onChange={(e) => onChange({...editingUser, startDate: e.target.value})}
                  className="w-full bg-slate-50 border border-transparent rounded-2xl px-5 py-3 text-xs font-bold text-slate-700 outline-none font-inter"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Probation Clearance</label>
                <input 
                  type="date" 
                  value={editingUser.probationDate || ''}
                  onChange={(e) => onChange({...editingUser, probationDate: e.target.value})}
                  className="w-full bg-slate-50 border border-transparent rounded-2xl px-5 py-3 text-xs font-bold text-slate-700 outline-none font-inter"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-10 pt-6 border-t border-slate-50 bg-white/95 backdrop-blur-md flex justify-end gap-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.05)]">
          <button 
            onClick={onClose}
            className="px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
          >
            Discard
          </button>
          <button 
            onClick={() => onSave(editingUser)}
            className="px-10 py-3.5 bg-slate-900 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-95"
          >
            Commit Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonnelDrawer;
