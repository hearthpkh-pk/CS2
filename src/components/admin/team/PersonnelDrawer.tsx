import React from 'react';
import { X, TrendingUp } from 'lucide-react';
import { User, Team, Role } from '@/types';
import { cn } from '@/lib/utils';
import { ROLE_LABELS, PERSONNEL_LABELS } from '@/constants/personnel';

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
  viewerRole?: Role;
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
  users,
  viewerRole
}) => {
  if (!editingUser) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end items-stretch overflow-hidden">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-500"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out border-l border-slate-100 font-prompt">
        {/* Header */}
        <div className="flex items-center justify-between px-10 py-10 border-b border-slate-100 bg-slate-50/30">
          <div>
            <h3 className="text-2xl font-bold font-outfit text-slate-800 tracking-tight uppercase">
              {users.some(u => u.id === editingUser.id) ? 'Registry Profile' : 'New Personnel Entry'}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] opacity-70">HQ Personnel Documentation System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-300 hover:text-blue-600 hover:border-blue-100 shadow-sm transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-10 py-10 space-y-12 pb-40 custom-scrollbar">

          {/* Section: System Credentials */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-[10px]">ID</div>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 font-outfit">System Credentials</h4>
            </div>

            <div className="grid grid-cols-2 gap-6 px-1">
              <div className="space-y-2 relative pt-2">
                <label className="absolute -top-1.5 left-3 px-1.5 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10 transition-colors">Access Email</label>
                <input
                  type="email"
                  value={editingUser.email || ''}
                  onChange={(e) => onChange({ ...editingUser, email: e.target.value })}
                  placeholder="user@hq.com"
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 transition-all font-inter"
                />
              </div>
              <div className="space-y-2 relative pt-2">
                <label className="absolute -top-1.5 left-3 px-1.5 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10 transition-colors">Password</label>
                <input
                  type="text"
                  value={editingUser.temporaryPassword || ''}
                  onChange={(e) => onChange({ ...editingUser, temporaryPassword: e.target.value })}
                  placeholder="****"
                  className="w-full bg-slate-50 border border-transparent rounded-2xl px-5 py-3.5 text-xs font-bold text-blue-600 outline-none font-inter"
                />
              </div>
            </div>
          </div>

          {/* Section: Personnel Identity */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-[10px]">BIO</div>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 font-outfit">Identity & Assignment</h4>
            </div>
            <div className="space-y-6 px-1">
              <div className="space-y-2 relative pt-2">
                <label className="absolute -top-1.5 left-3 px-1.5 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10 transition-colors">Full Name (Registry)</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => onChange({ ...editingUser, name: e.target.value })}
                  placeholder="ชื่อ-นามสกุล"
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 transition-all font-noto"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 relative pt-2">
                  <label className="absolute -top-1.5 left-3 px-1.5 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10 transition-colors">Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => onChange({ ...editingUser, role: e.target.value as Role })}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-xs font-semibold text-slate-700 outline-none cursor-pointer focus:border-blue-500 transition-all font-inter"
                  >
                    {Object.entries(ROLE_LABELS).filter(([role]) => {
                      // RBAC: Cannot grant a role higher than your own
                      if (viewerRole === Role.SuperAdmin) return true;
                      if (viewerRole === Role.Admin) return role !== Role.SuperAdmin;
                      if (viewerRole === Role.Manager) return role === Role.Manager || role === Role.Staff;
                      return role === Role.Staff;
                    }).map(([role, label]) => (
                      <option key={role} value={role}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 relative pt-2">
                  <label className="absolute -top-1.5 left-3 px-1.5 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10 transition-colors">Unit Group</label>
                  <select
                    value={editingUser.teamId || ''}
                    onChange={(e) => onChange({ ...editingUser, teamId: e.target.value || undefined })}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-xs font-semibold text-slate-700 outline-none cursor-pointer focus:border-blue-500 transition-all font-inter"
                  >
                    <option value="">{PERSONNEL_LABELS.UNASSIGNED}</option>
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
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-[10px]">$</div>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 font-outfit">Financial Mapping</h4>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 relative overflow-hidden group/financial">
              <div className="absolute right-0 top-0 w-32 h-32 bg-blue-100/20 rounded-bl-full -z-0 group-hover/financial:scale-110 transition-transform duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-2 opacity-70">Active Salary Rate</label>
                    <div className="text-4xl font-bold text-slate-800 font-outfit tracking-tighter">
                      ฿{editingUser.salary?.toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onToggleAdjustSalary(!isAdjustingSalary);
                      onSalaryFormChange({ amount: editingUser.salary || 0, reason: '', effectiveDate: new Date().toISOString().split('T')[0] });
                    }}
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-90",
                      isAdjustingSalary ? "bg-slate-800 text-white shadow-slate-200" : "bg-blue-600 text-white shadow-blue-100"
                    )}
                  >
                    {isAdjustingSalary ? <X size={20} /> : <TrendingUp size={20} />}
                  </button>
                </div>

                {isAdjustingSalary && (
                  <div className="space-y-5 animate-in slide-in-from-top-4 duration-300 mb-8 p-8 bg-white rounded-3xl border border-blue-100 shadow-xl shadow-blue-100/20">
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Updated Amount (THB)</label>
                      <input
                        type="number"
                        value={salaryForm.amount || ''}
                        onChange={(e) => onSalaryFormChange({ ...salaryForm, amount: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-xl font-bold text-blue-600 font-inter outline-none focus:bg-white focus:border-blue-200 transition-all"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Adjustment Reason</label>
                      <input
                        type="text"
                        value={salaryForm.reason}
                        onChange={(e) => onSalaryFormChange({ ...salaryForm, reason: e.target.value })}
                        placeholder="Why this adjustment?"
                        className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-xs font-semibold text-slate-600 outline-none focus:bg-white focus:border-blue-200 transition-all font-noto"
                      />
                    </div>
                    <button
                      onClick={onConfirmSalary}
                      disabled={!salaryForm.reason || salaryForm.amount <= 0}
                      className="w-full bg-blue-600 text-white font-bold text-[11px] uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-30 shadow-xl shadow-blue-200"
                    >
                      Commit Adjustment
                    </button>
                  </div>
                )}

                {editingUser.salaryHistory && editingUser.salaryHistory.length > 0 && (
                  <div className="space-y-4 pt-8 border-t border-slate-200/50">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] opacity-80">Registry Audit Logs</h5>
                    </div>
                    <div className="space-y-3">
                      {editingUser.salaryHistory.map((adj) => (
                        <div key={adj.id} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm group/log hover:border-blue-100 transition-colors">
                          <div>
                            <div className="text-sm font-bold text-slate-700 font-inter group-hover/log:text-blue-600 transition-colors">฿{adj.newSalary.toLocaleString()}</div>
                            <div className="text-[10px] text-slate-400 font-semibold italic mt-1 font-noto">"{adj.reason}"</div>
                          </div>
                          <div className="text-[9px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg font-inter uppercase tracking-widest">
                            {adj.effectiveDate}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section: Employment Details */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-[10px]">FIX</div>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 font-outfit">Employment Details</h4>
            </div>

            <div className="grid grid-cols-2 gap-6 pb-4 px-1">
              <div className="space-y-2 relative pt-2">
                <label className="absolute -top-1.5 left-3 px-1.5 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10 transition-colors">Bank Profile</label>
                <input
                  type="text"
                  value={editingUser.bankName || ''}
                  onChange={(e) => onChange({ ...editingUser, bankName: e.target.value })}
                  placeholder="ชื่อธนาคาร"
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 transition-all font-noto"
                />
              </div>
              <div className="space-y-2 relative pt-2">
                <label className="absolute -top-1.5 left-3 px-1.5 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10 transition-colors">Account Pattern</label>
                <input
                  type="text"
                  value={editingUser.bankAccount || ''}
                  onChange={(e) => onChange({ ...editingUser, bankAccount: e.target.value })}
                  placeholder="000-0-00000-0"
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-800 outline-none font-inter"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 px-1">
              <div className="space-y-2 relative pt-2">
                <label className="absolute -top-1.5 left-3 px-1.5 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10 transition-colors">Enlistment Date</label>
                <input
                  type="date"
                  value={editingUser.startDate || ''}
                  onChange={(e) => onChange({ ...editingUser, startDate: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-700 outline-none font-inter"
                />
              </div>
              <div className="space-y-2 relative pt-2">
                <label className="absolute -top-1.5 left-3 px-1.5 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10 transition-colors">Clearance Date</label>
                <input
                  type="date"
                  value={editingUser.probationDate || ''}
                  onChange={(e) => onChange({ ...editingUser, probationDate: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-700 outline-none font-inter"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-10 pt-6 border-t border-slate-100 bg-white/95 backdrop-blur-md flex justify-end gap-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.05)]">
          <button
            onClick={onClose}
            className="px-8 py-3.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all font-inter"
          >
            Discard
          </button>
          <button
            onClick={() => onSave(editingUser)}
            className="px-12 py-4 bg-blue-600 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-95 font-inter"
          >
            Commit Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonnelDrawer;
