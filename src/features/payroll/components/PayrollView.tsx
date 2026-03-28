import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { User, PolicyConfiguration, Role } from '@/types';
import { reportService } from '@/features/reports/services/reportService';
import { historicalReportsLogs } from '@/features/reports/mocks/reportMocks';
import { allMockUsers, mockDashboardPages } from '@/features/hq-dashboard/mocks/dashboardMocks';
import { 
  DollarSign, Download, Gem, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PayrollViewProps {
  currentUser: User;
  policy: PolicyConfiguration;
}

export const PayrollView: React.FC<PayrollViewProps> = ({ 
  currentUser, policy 
}) => {
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const payrollData = useMemo(() => {
    return reportService.getMonthlyReport(
      currentUser,
      allMockUsers,
      mockDashboardPages,
      historicalReportsLogs,
      policy,
      selectedMonth,
      selectedYear
    );
  }, [currentUser, policy, selectedMonth, selectedYear]);

  if (currentUser.role !== Role.SuperAdmin) {
    return <div className="p-8 text-slate-500">Access Denied. Super Admin only.</div>;
  }

  return (
    <div className="p-8 pb-32 space-y-10 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">
            <span>Enterprise Finance</span>
            <span className="w-1 h-1 rounded-full bg-slate-200"></span>
            <span>Payroll Management</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-800 font-outfit tracking-tight">
            Financial Performance
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl px-3 py-1.5 shadow-sm">
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none text-xs font-medium text-slate-600 outline-none cursor-pointer font-prompt min-w-[100px]"
            >
              {Array.from({length: 12}).map((_, i) => (
                <option key={i} value={(i+1).toString().padStart(2, '0')}>
                  {format(new Date(2026, i, 1), 'MMMM', { locale: th })}
                </option>
              ))}
            </select>
            <div className="w-px h-3 bg-slate-200"></div>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent border-none text-xs font-medium text-slate-600 outline-none cursor-pointer font-prompt"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
          <button className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-medium hover:bg-slate-700 transition-colors">
            <Download size={14} /> Export Financial Report
          </button>
        </div>
      </div>

      {/* FINANCIAL SUMMARY TABLE */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <Gem size={14} className="text-amber-500" strokeWidth={1.5} /> Payroll Matrix (฿)
          </h3>
          <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest font-prompt">นโยบาย: {policy.minViewTarget.toLocaleString()} วิว / {policy.requiredPagesPerDay * policy.clipsPerPageInLog} คลิป</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-center">Staff</th>
                <th className="px-8 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-right">Base Salary</th>
                <th className="px-8 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-right text-emerald-600">Bonus</th>
                <th className="px-8 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-right text-rose-500">Penalty</th>
                <th className="px-8 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-right bg-slate-100/30">Net Pay (฿)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[13px] font-prompt">
              {payrollData.financials.map(fin => (
                <tr key={fin.userId} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-4 font-medium text-slate-700">{fin.userName}</td>
                  <td className="px-8 py-4 text-right text-slate-500 tabular-nums">{fin.baseSalary.toLocaleString()}</td>
                  <td className="px-8 py-4 text-right text-emerald-600 font-semibold tabular-nums">+{fin.bonus.toLocaleString()}</td>
                  <td className="px-8 py-4 text-right text-rose-500 font-semibold tabular-nums">-{fin.penalty.toLocaleString()}</td>
                  <td className="px-8 py-4 text-right font-bold text-slate-800 bg-slate-100/10 tabular-nums">
                    {fin.netPay.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50/80 border-t border-slate-100 font-bold">
              <tr>
                <td className="px-8 py-6 text-[10px] uppercase tracking-widest text-slate-400">Company Total</td>
                <td className="px-8 py-6 text-right tabular-nums">
                  {payrollData.financials.reduce((sum, f) => sum + f.baseSalary, 0).toLocaleString()}
                </td>
                <td className="px-8 py-6 text-right text-emerald-700 tabular-nums">
                  +{payrollData.financials.reduce((sum, f) => sum + f.bonus, 0).toLocaleString()}
                </td>
                <td className="px-8 py-6 text-right text-rose-600 tabular-nums">
                  -{payrollData.financials.reduce((sum, f) => sum + f.penalty, 0).toLocaleString()}
                </td>
                <td className="px-8 py-6 text-right text-slate-900 text-lg tabular-nums">
                  {payrollData.financials.reduce((sum, f) => sum + f.netPay, 0).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-center text-[10px] font-medium text-slate-300 uppercase tracking-[0.2em] px-4 font-prompt">
        <p>Verified Financial Intelligence • Enterprise Edition</p>
        <p>© 2026 Creator Space</p>
      </div>
    </div>
  );
};
