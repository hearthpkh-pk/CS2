'use client';

import React, { useState } from 'react';
import { Save, ShieldCheck, TrendingUp, AlertCircle, DollarSign, Target, Settings2, RefreshCcw } from 'lucide-react';
import { User, PolicyConfiguration } from '@/types';
import { REVENUE_CONFIG } from '@/constants/hrConfig';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PolicySettingsViewProps {
  currentUser: User;
}

export const PolicySettingsView: React.FC<PolicySettingsViewProps> = ({ currentUser }) => {
  const [policy, setPolicy] = useState<PolicyConfiguration>({
    minViewTarget: 10000000,        // 10M
    penaltyAmount: 2000,            // 2,000 THB
    bonusStep1: 1000,               // 1,000 / 10M
    superBonusThreshold: 100000000, // 100M
    bonusStep2: 1500,               // 1,500 / 10M
    requiredPagesPerDay: 10,
    clipsPerPageInLog: 4
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setShowStatus(true);
    setTimeout(() => setShowStatus(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-xl shadow-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <ShieldCheck size={160} className="rotate-12 -mr-10 -mt-10" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-500 rounded-2xl">
              <Settings2 size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black font-outfit uppercase tracking-tight">Business Policy Settings</h2>
              <p className="text-blue-100/40 text-[10px] font-bold uppercase tracking-[0.2em]">จัดการเกณฑ์การคำนวณและกฎระเบียบบริษัท</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
             <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <p className="text-[10px] font-bold text-blue-100/40 uppercase tracking-widest mb-1">Target Views</p>
                <p className="text-xl font-black font-outfit">10,000,000</p>
             </div>
             <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <p className="text-[10px] font-bold text-blue-100/40 uppercase tracking-widest mb-1">Standard Rate</p>
                <p className="text-xl font-black font-outfit">1,000 / 10M</p>
             </div>
             <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <p className="text-[10px] font-bold text-blue-100/40 uppercase tracking-widest mb-1">Super Bonus</p>
                <p className="text-xl font-black font-outfit">1,500 / 10M</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
        {/* Commission Tiers Card */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-lg font-black text-slate-800 font-outfit uppercase tracking-tight flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-500" />
            Commission & Multi-Tier Settings
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-2">ยอดวิวขั้นต่ำต่อเดือน (Min Target)</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -track-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                  <Target size={18} />
                </div>
                <input 
                  type="number" 
                  value={policy.minViewTarget}
                  onChange={(e) => setPolicy({...policy, minViewTarget: Number(e.target.value)})}
                  className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 ring-blue-100 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-2">เรทมาตรฐาน (Standard)</label>
                  <input 
                    type="number" 
                    value={policy.bonusStep1}
                    onChange={(e) => setPolicy({...policy, bonusStep1: Number(e.target.value)})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 text-sm font-bold focus:ring-2 ring-blue-100 outline-none"
                    placeholder="บาท / 10 ล้านวิว"
                  />
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-2">เรท Super Bonus</label>
                  <input 
                    type="number" 
                    value={policy.bonusStep2}
                    onChange={(e) => setPolicy({...policy, bonusStep2: Number(e.target.value)})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 text-sm font-bold focus:ring-2 ring-blue-100 outline-none"
                    placeholder="บาท / 10 ล้านวิว"
                  />
               </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-2">เกณฑ์ปลดล็อค Super Bonus (Threshold)</label>
              <input 
                type="number" 
                value={policy.superBonusThreshold}
                onChange={(e) => setPolicy({...policy, superBonusThreshold: Number(e.target.value)})}
                className="w-full bg-emerald-50/50 border border-emerald-100/50 text-emerald-600 rounded-2xl px-4 py-4 text-sm font-black focus:ring-2 ring-emerald-100 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Penalties & Operations Card */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-lg font-black text-slate-800 font-outfit uppercase tracking-tight flex items-center gap-2">
            <AlertCircle size={20} className="text-red-500" />
            Penalties & Operations
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-2">ยอดหักเงินหากไม่ถึงเป้า (Penalty)</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -track-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors">
                  <DollarSign size={18} />
                </div>
                <input 
                  type="number" 
                  value={policy.penaltyAmount}
                  onChange={(e) => setPolicy({...policy, penaltyAmount: Number(e.target.value)})}
                  className="w-full bg-red-50/30 border border-red-100/30 text-red-600 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 ring-red-100 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-2">จำนวนเพจต่อวัน</label>
                  <input 
                    type="number" 
                    value={policy.requiredPagesPerDay}
                    onChange={(e) => setPolicy({...policy, requiredPagesPerDay: Number(e.target.value)})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 text-sm font-bold focus:ring-2 ring-blue-100 outline-none"
                  />
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-2">คลิปต่อเพจต่อวัน</label>
                  <input 
                    type="number" 
                    value={policy.clipsPerPageInLog}
                    onChange={(e) => setPolicy({...policy, clipsPerPageInLog: Number(e.target.value)})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 text-sm font-bold focus:ring-2 ring-blue-100 outline-none"
                  />
               </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  <RefreshCcw size={12} /> Currency Exchange Rate
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-600">1 USD =</span>
                  <div className="flex items-center gap-2">
                     <span className="text-sm font-black text-slate-800">35.50</span>
                     <span className="text-[10px] font-bold text-slate-400 uppercase">THB</span>
                  </div>
               </div>
            </div>
          </div>

          <div className="pt-4">
             <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-slate-900 text-white py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
             >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : showStatus ? (
                  <>
                    <ShieldCheck size={16} className="text-emerald-400" />
                    Updated Policy
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    บันทึกการเปลี่ยนแปลง
                  </>
                )}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
