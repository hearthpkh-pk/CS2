import React from 'react';
import { ShieldCheck, Check } from 'lucide-react';
import { Role } from '@/types';
import { cn } from '@/lib/utils';

const AccessMatrix: React.FC = () => {
  const roles = [Role.Staff, Role.Manager, Role.Admin];
  const permissions = [
    { name: 'Core Dashboard Summary', access: [true, true, true] },
    { name: 'Personnel & Unit Registry', access: [false, true, true] },
    { name: 'Financial & Payroll Audit', access: [false, false, true] },
    { name: 'Policy Configuration', access: [false, false, true] },
    { name: 'Real-time Site Monitoring', access: [true, true, true] },
    { name: 'Team Performance Metrics', access: [false, true, true] },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-slate-50 pb-8">
        <div>
          <h3 className="text-lg font-bold text-slate-800 font-outfit uppercase tracking-tight">Access Control Matrix</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Defined system permissions per operational role</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 border border-blue-200 text-blue-600 rounded-xl text-[10px] font-bold uppercase tracking-widest">
           <ShieldCheck size={14} /> Matrix Verified
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="px-10 text-left pb-8 pt-10 text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Module / Capability</th>
              {roles.map(role => (
                <th key={role} className="text-center pb-8 pt-10 text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] w-28">{role}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {permissions.map((row, i) => (
              <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                <td className="px-10 py-6">
                  <span className="text-xs font-bold text-slate-700 font-outfit uppercase tracking-tight group-hover:text-blue-600 transition-colors">{row.name}</span>
                </td>
                {row.access.map((hasAccess, j) => (
                  <td key={j} className="text-center py-6">
                    <div className="flex justify-center">
                      {hasAccess ? (
                        <div className="w-6 h-6 rounded-lg text-emerald-500 flex items-center justify-center border border-emerald-100/50">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-100" />
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccessMatrix;
