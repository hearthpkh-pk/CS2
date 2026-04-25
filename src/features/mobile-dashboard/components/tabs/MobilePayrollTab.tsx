import React from 'react';
import { Building2 } from 'lucide-react';

export const MobilePayrollTab = ({ staffData }: { staffData: any[] }) => {
  return (
    <div className="animate-in fade-in duration-300 pb-8 bg-slate-50 min-h-full">
      <div className="bg-white mx-4 mt-6 rounded-[1.5rem] p-6 shadow-sm border border-slate-100">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] font-outfit mb-3">Payroll Validation</h3>
        <p className="text-4xl font-extrabold font-outfit tracking-tighter text-slate-800 leading-none">Security Mode</p>
        <p className="text-[10px] font-medium text-slate-500 font-noto mt-3 leading-relaxed">
          โหมดตรวจสอบความถูกต้องบัญชี สำหรับ Super Admin เพื่อป้องกันความผิดพลาด
        </p>
      </div>

      <div className="bg-white mx-4 mt-4 rounded-[1.5rem] p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[11px] font-bold text-slate-600 font-noto">บัญชีพนักงาน (ตรวจสอบ)</p>
            </div>
            <div className="text-right">
              <p className="text-base font-black text-[#054ab3] font-outfit">{staffData.length} <span className="text-[10px] text-slate-400 font-normal">Records</span></p>
            </div>
        </div>
        <div className="flex items-center justify-between opacity-50 grayscale mt-6">
            <div>
              <p className="text-[11px] font-bold text-slate-600 font-noto">ผลรวมประมาณการจ่าย</p>
            </div>
            <div className="text-right relative">
              <p className="text-base font-black text-slate-900 font-outfit blur-sm select-none">฿ 0</p>
              <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[8px] font-bold bg-slate-800 text-white px-2 py-0.5 rounded uppercase tracking-widest">Locked</span>
              </div>
            </div>
        </div>
      </div>
      
      <div className="mx-4 mt-4 px-6 py-6 opacity-60">
        <div className="flex items-start gap-4">
          <Building2 size={16} className="text-[#054ab3] mt-0.5" />
          <div>
            <p className="text-[10px] font-bold text-[#054ab3] font-outfit tracking-widest uppercase mb-1">Upcoming Module</p>
            <p className="text-[11px] font-noto text-slate-500 leading-relaxed">ระบบเจาะลึกดูสลิปแยกรายบุคคลแบบ Read-only กำลังตั้งค่าระบบความปลอดภัยขั้นสูง</p>
          </div>
        </div>
      </div>
    </div>
  );
};
