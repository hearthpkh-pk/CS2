import React from 'react';
import { X, TrendingUp, Mail } from 'lucide-react';
import { User, Team, Role } from '@/types';
import { cn } from '@/lib/utils';
import { ROLE_LABELS, PERSONNEL_LABELS } from '@/constants/personnel';
import { useCompanyConfig } from '@/features/company/hooks/useCompanyConfig';

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
  users: User[];
  viewerRole?: Role;
}

// Shared input class — single consistent style throughout
const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 transition-colors shadow-sm";
const labelCls = "absolute -top-2 left-3 px-1.5 bg-white text-[9px] font-bold text-slate-400 uppercase tracking-widest z-10";

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
  const { config } = useCompanyConfig();
  if (!editingUser) return null;

  const isExisting = users.some(u => u.id === editingUser.id);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end items-stretch overflow-hidden font-inter">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 ease-out border-l border-slate-100">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-7 border-b border-slate-100 flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight uppercase">
              {isExisting ? 'Registry Profile' : 'New Personnel Entry'}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest">HQ Personnel Documentation System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-7 space-y-7 custom-scrollbar">

          {/* LOGIN EMAIL — full width */}
          <div className="space-y-2 relative pt-2">
            <label className={labelCls}>LOGIN EMAIL</label>
            <div className="relative">
              <input
                type="email"
                value={editingUser.email || ''}
                onChange={(e) => onChange({ ...editingUser, email: e.target.value })}
                placeholder="user@hq.com"
                className={cn(inputCls, "pl-10")}
              />
              <Mail size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* STATUS + PASSWORD */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 relative pt-2">
              <label className={labelCls}>STATUS</label>
              <select
                value={editingUser.status || 'Pending'}
                onChange={(e) => onChange({ ...editingUser, status: e.target.value as any })}
                className={cn(
                  "w-full border rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer transition-colors shadow-sm bg-white",
                  editingUser.status === 'Official' ? "border-emerald-200 text-emerald-600" :
                  editingUser.status === 'Probation' ? "border-amber-200 text-amber-600" :
                  editingUser.status === 'Resigned'  ? "border-rose-200 text-rose-500" :
                                                       "border-blue-200 text-blue-600"
                )}
              >
                <option value="Pending">PENDING</option>
                <option value="Probation">PROBATION</option>
                <option value="Official">ACTIVE</option>
                <option value="Resigned">RESIGNED</option>
              </select>
            </div>
            <div className="space-y-2 relative pt-2">
              <label className={labelCls}>TEMPORARY PASSWORD</label>
              <input
                type="text"
                value={editingUser.temporaryPassword || ''}
                onChange={(e) => onChange({ ...editingUser, temporaryPassword: e.target.value })}
                placeholder="(auto-generated)"
                className={inputCls}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* PHONE + LINE */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 relative pt-2">
              <label className={labelCls}>PHONE NUMBER</label>
              <input
                type="tel"
                value={editingUser.phone || ''}
                onChange={(e) => onChange({ ...editingUser, phone: e.target.value })}
                placeholder="0XX-XXX-XXXX"
                className={inputCls}
              />
            </div>
            <div className="space-y-2 relative pt-2">
              <label className={labelCls}>LINE ID</label>
              <input
                type="text"
                value={editingUser.lineId || ''}
                onChange={(e) => onChange({ ...editingUser, lineId: e.target.value })}
                placeholder="@id_line"
                className={inputCls}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* FULL NAME */}
          <div className="space-y-2 relative pt-2">
            <label className={labelCls}>FULL NAME</label>
            <input
              type="text"
              value={editingUser.name}
              onChange={(e) => onChange({ ...editingUser, name: e.target.value })}
              placeholder="ชื่อ-นามสกุล"
              className={cn(inputCls, "text-sm font-bold text-slate-800")}
            />
          </div>

          {/* ROLE + WORKLOAD GROUP */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 relative pt-2">
              <label className={labelCls}>ROLE</label>
              <select
                value={editingUser.role}
                onChange={(e) => onChange({ ...editingUser, role: e.target.value as Role })}
                className={inputCls}
              >
                {Object.entries(ROLE_LABELS).filter(([role]) => {
                  if (role === Role.Developer) return false;
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
              <label className={labelCls}>WORKLOAD GROUP</label>
              <select
                value={editingUser.group || ''}
                onChange={(e) => onChange({
                  ...editingUser,
                  group: e.target.value,
                  department: config.groups.find(g => g.id === e.target.value)?.name
                })}
                className={inputCls}
              >
                <option value="">UNASSIGNED</option>
                {(config.groups || []).map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* TEAM ASSIGNMENT */}
          <div className="space-y-2 relative pt-2">
            <label className={labelCls}>TEAM ASSIGNMENT</label>
            <select
              value={editingUser.teamId || ''}
              onChange={(e) => onChange({ ...editingUser, teamId: e.target.value || undefined })}
              className={inputCls}
            >
              <option value="">{PERSONNEL_LABELS.UNASSIGNED}</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* SALARY SECTION */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">ACTIVE SALARY RATE</p>
                <p className="text-3xl font-bold text-slate-800 tracking-tight">
                  ฿{(editingUser.salary || 0).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => {
                  onToggleAdjustSalary(!isAdjustingSalary);
                  onSalaryFormChange({ amount: editingUser.salary || 0, reason: '', effectiveDate: new Date().toISOString().split('T')[0] });
                }}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90",
                  isAdjustingSalary
                    ? "bg-slate-700 text-white"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                {isAdjustingSalary ? <X size={16} /> : <TrendingUp size={16} />}
              </button>
            </div>

            {isAdjustingSalary && (
              <div className="space-y-3 p-5 border border-slate-200 rounded-xl animate-in slide-in-from-top-2 duration-200">
                <div className="space-y-2 relative pt-2">
                  <label className={labelCls}>NEW AMOUNT (THB)</label>
                  <input
                    type="number"
                    value={salaryForm.amount || ''}
                    onChange={(e) => onSalaryFormChange({ ...salaryForm, amount: parseInt(e.target.value) || 0 })}
                    className={cn(inputCls, "text-base font-bold text-blue-600")}
                  />
                </div>
                <div className="space-y-2 relative pt-2">
                  <label className={labelCls}>ADJUSTMENT REASON</label>
                  <input
                    type="text"
                    value={salaryForm.reason}
                    onChange={(e) => onSalaryFormChange({ ...salaryForm, reason: e.target.value })}
                    placeholder="Reason for adjustment"
                    className={inputCls}
                  />
                </div>
                <button
                  onClick={onConfirmSalary}
                  disabled={!salaryForm.reason || salaryForm.amount <= 0}
                  className="w-full bg-blue-600 text-white font-bold text-[10px] uppercase tracking-widest py-3.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-30"
                >
                  Commit Adjustment
                </button>
              </div>
            )}

            {editingUser.salaryHistory && editingUser.salaryHistory.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">AUDIT LOG</p>
                {editingUser.salaryHistory.map((adj) => (
                  <div key={adj.id} className="flex justify-between items-center py-3 border-b border-slate-50">
                    <div>
                      <p className="text-sm font-bold text-slate-700">฿{adj.newSalary.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{adj.reason}</p>
                    </div>
                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                      {adj.effectiveDate}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* EMPLOYMENT DETAILS */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 relative pt-2">
                <label className={labelCls}>BANK NAME</label>
                <input
                  type="text"
                  value={editingUser.bankName || ''}
                  onChange={(e) => onChange({ ...editingUser, bankName: e.target.value })}
                  placeholder="ชื่อธนาคาร"
                  className={inputCls}
                />
              </div>
              <div className="space-y-2 relative pt-2">
                <label className={labelCls}>ACCOUNT NUMBER</label>
                <input
                  type="text"
                  value={editingUser.bankAccount || ''}
                  onChange={(e) => onChange({ ...editingUser, bankAccount: e.target.value })}
                  placeholder="000-0-00000-0"
                  className={inputCls}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 relative pt-2">
                <label className={labelCls}>START DATE</label>
                <input
                  type="date"
                  value={editingUser.startDate || ''}
                  onChange={(e) => onChange({ ...editingUser, startDate: e.target.value })}
                  className={cn(inputCls, "[color-scheme:light]")}
                />
              </div>
              <div className="space-y-2 relative pt-2">
                <label className={labelCls}>END DATE</label>
                <input
                  type="date"
                  value={editingUser.probationDate || ''}
                  onChange={(e) => onChange({ ...editingUser, probationDate: e.target.value })}
                  className={cn(inputCls, "[color-scheme:light]")}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Footer — sticky, never overlaps */}
        <div className="flex-shrink-0 border-t border-slate-100 bg-white px-8 py-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
          >
            Discard
          </button>
          <button
            onClick={() => onSave(editingUser)}
            className="px-8 py-2.5 bg-blue-600 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-colors active:scale-95 shadow-sm"
          >
            Commit Changes
          </button>
        </div>

      </div>
    </div>
  );
};

export default PersonnelDrawer;
