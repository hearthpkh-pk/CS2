'use client';

import React, { useState } from 'react';
import { 
  Building2,
  Settings2, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle2, 
  Megaphone,
  Layers,
  ChevronRight,
  Globe,
  Trophy,
  Target,
  Flame,
  TrendingUp,
  Coins,
  ShieldAlert,
  Database,
  LayoutGrid,
  BellRing
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Brand, PolicyConfiguration, Role, User } from '@/types';
import { configService } from '@/services/configService';
import { useCompanyConfig } from '../hooks/useCompanyConfig';
import { AnnouncementManager } from './settings/AnnouncementManager';
import { GroupManager } from './settings/GroupManager';

interface CompanySettingsViewProps {
  currentUser: User;
  initialTab?: 'brands' | 'policy' | 'announcements' | 'groups';
}

export const CompanySettingsView: React.FC<CompanySettingsViewProps> = ({ currentUser, initialTab }) => {
  const { config, updatePerformancePolicy, refreshConfig } = useCompanyConfig();
  const [activeTab, setActiveTab] = useState<'brands' | 'policy' | 'announcements' | 'groups'>(initialTab || 'announcements');
  const [isSaved, setIsSaved] = useState(false);

  // Sync initialTab when it changes from props
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [newBrand, setNewBrand] = useState('');
  const [isAddingBrand, setIsAddingBrand] = useState(false);

  const handleAddBrand = () => {
    if (!newBrand) return;
    setIsAddingBrand(true);
    try {
      const brand: Brand = { id: `brand-${Date.now()}`, name: newBrand, isActive: true };
      configService.saveBrand(brand);
      refreshConfig();
      setNewBrand('');
    } finally {
      setIsAddingBrand(false);
    }
  };

  const handleDeleteBrand = (id: string) => {
    configService.deleteBrand(id);
    refreshConfig();
  };

  const handleCommit = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  if (currentUser.role !== Role.SuperAdmin && currentUser.role !== Role.Developer) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400 space-y-4 font-prompt">
        <Building2 size={32} strokeWidth={1.5} />
        <p className="text-sm uppercase tracking-[0.2em] font-medium">Access Restricted</p>
      </div>
    );
  }

  const tabs = [
    { id: 'announcements', label: 'Broadcast', icon: Megaphone, desc: 'Global Announcements' },
    { id: 'brands', label: 'Brands', icon: LayoutGrid, desc: 'Client Portfolios' },
    { id: 'groups', label: 'Groups', icon: Layers, desc: 'Team Unit Targets' },
    { id: 'policy', label: 'KPI Matrix', icon: Settings2, desc: 'Financial Matrix' },
  ] as const;

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 pb-10 flex flex-col gap-4 animate-in fade-in duration-700">
      
      {/* HQ COMPANY SETTINGS HEADER (Mode 2) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pt-4 pb-5 mb-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-[#0f172a] font-outfit uppercase tracking-tight leading-none">
            Company Settings
          </h1>
          <p className="text-[11px] text-slate-400 font-medium font-noto uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Admin Console & Operational Matrix • <span className="text-[var(--primary-theme)] font-bold">Enterprise View</span>
          </p>
        </div>

        {/* COMPACT ICON-ONLY TAB SWITCHER (ALIGNED RIGHT) */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm h-11 shrink-0">
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "p-2.5 rounded-xl transition-all duration-300 relative group shrink-0",
                activeTab === tab.id 
                  ? "bg-[var(--primary-theme)] text-white shadow-lg shadow-blue-600/20" 
                  : "text-slate-300 hover:text-[var(--primary-theme)]"
              )}
            >
              <tab.icon size={18} />
              
              <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl">
                {tab.label}
              </span>
            </button>
          ))}
          
          {isSaved && (
             <div className="px-3 text-emerald-500 animate-in fade-in zoom-in duration-300">
                <CheckCircle2 size={18} />
             </div>
          )}
        </div>
      </div>

      <div className="w-full animate-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 md:p-12 min-h-[600px] relative">
          
          {/* ANNOUNCEMENT MANAGER */}
          {activeTab === 'announcements' && (
            <AnnouncementManager />
          )}

          {/* BRAND MANAGEMENT (LEGIBILITY UPGRADE) */}
          {activeTab === 'brands' && (
            <div className="space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-50 pb-8">
                   <div className="space-y-1">
                      <h3 className="text-xl font-bold text-slate-800 font-outfit uppercase tracking-tight">Client Brand Assets</h3>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">โน้ตรายชื่อแบรนด์ลูกค้าสำหรับมอบหมายงาน</p>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="flex gap-2 p-1.5 bg-white border border-slate-100 rounded-xl focus-within:border-blue-400 transition-all shadow-sm w-[350px]">
                        <input 
                          placeholder="ชื่อแบรนด์ลูกค้า..."
                          value={newBrand}
                          onChange={(e) => setNewBrand(e.target.value.toUpperCase())}
                          className="flex-1 bg-transparent border-none px-4 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-300 uppercase"
                        />
                        <button 
                          onClick={handleAddBrand}
                          disabled={!newBrand || isAddingBrand}
                          className="bg-blue-600 text-white w-10 h-10 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-all shadow-sm disabled:opacity-30"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {config.brands.map(brand => (
                    <div key={brand.id} className="group relative p-6 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:border-blue-100 transition-all duration-300">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                           <LayoutGrid size={20} className="text-blue-600" />
                        </div>
                        <div className="space-y-1">
                           <span className="text-sm font-bold text-slate-800 uppercase tracking-tight truncate block max-w-[150px]">{brand.name}</span>
                           <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none">Registered Brand</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleDeleteBrand(brand.id)}
                        className="absolute top-5 right-5 text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
            </div>
          )}

          {/* GROUP MANAGEMENT */}
          {activeTab === 'groups' && (
            <GroupManager />
          )}

          {/* SYSTEM POLICY (KPI MATRIX - UNCHANGED AS REQUESTED) */}
          {activeTab === 'policy' && (
            <div className="space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-slate-50 pb-8">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-800 font-outfit uppercase tracking-tight">Core KPI Strategy Matrix</h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest text-left">กฎนโยบายการทำยอดและผลประโยชน์ของบริษัท</p>
                  </div>
                  <button 
                    onClick={handleCommit}
                    className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-md"
                  >
                    <Save size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                   {/* Monthly Performance Targets */}
                   <div className="space-y-10">
                      <div className="space-y-1">
                         <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2">
                           <Target size={14} className="text-blue-500" />
                           Performance Baseline
                         </h4>
                      </div>
                      
                      <div className="space-y-8">
                         <div className="space-y-2">
                            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest ml-1">เป้ายอดวิวขั้นต่ำ (Monthly Target - M)</label>
                            <div className="relative group">
                               <input 
                                 type="number"
                                 value={(config.performancePolicy.minViewTarget || 0) / 1000000}
                                 onChange={(e) => updatePerformancePolicy({ minViewTarget: (parseFloat(e.target.value) || 0) * 1000000 })}
                                 className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-base font-medium text-slate-900 focus:border-blue-500/20 focus:ring-8 focus:ring-blue-500/5 outline-none transition-all tabular-nums"
                               />
                               <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300 uppercase tracking-widest font-outfit">Millions (M)</span>
                            </div>
                            <p className="text-[10px] text-slate-400 italic ml-1">*ยอดที่ต้องทำให้ได้เพื่อรับเงินเดือนปกติ (เช่น กรอก 10 = 10,000,000 วิว)</p>
                         </div>
                         
                         <div className="space-y-2">
                            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest ml-1">ค่าปรับกรณีไม่ถึงเป้า (Monthly Penalty)</label>
                            <div className="relative group">
                               <input 
                                 type="number"
                                 value={config.performancePolicy.penaltyAmount}
                                 onChange={(e) => updatePerformancePolicy({ penaltyAmount: parseInt(e.target.value) || 0 })}
                                 className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-base font-medium text-rose-500 focus:border-rose-500/20 focus:ring-8 focus:ring-rose-500/5 outline-none transition-all tabular-nums"
                               />
                               <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300 uppercase tracking-widest font-outfit">THB</span>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Reward & Commission Logic */}
                   <div className="space-y-10">
                      <div className="space-y-1">
                         <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Coins size={14} className="text-emerald-500" />
                            Commission Logic (Stepped)
                         </h4>
                      </div>

                      <div className="space-y-8">
                         <div className="space-y-2">
                            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest ml-1">เรทคอมมิชชั่นปกติ (Standard Rate / 10M)</label>
                            <div className="relative group">
                               <input 
                                 type="number"
                                 value={config.performancePolicy.bonusStep1}
                                 onChange={(e) => updatePerformancePolicy({ bonusStep1: parseInt(e.target.value) || 0 })}
                                 className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-base font-medium text-emerald-600 focus:border-emerald-500/20 focus:ring-8 focus:ring-emerald-500/5 outline-none transition-all tabular-nums"
                               />
                               <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300 uppercase tracking-widest font-outfit">THB / 10M</span>
                            </div>
                            <p className="text-[10px] text-slate-400 italic ml-1">*เงินคอมมิชชั่นที่ได้รับต่อยอดทุกๆ 10 ล้านวิว (เช่น 1,000)</p>
                         </div>

                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest ml-1">Super Bonus (M)</label>
                               <input 
                                 type="number"
                                 value={(config.performancePolicy.superBonusThreshold || 0) / 1000000}
                                 onChange={(e) => updatePerformancePolicy({ superBonusThreshold: (parseFloat(e.target.value) || 0) * 1000000 })}
                                 className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-base font-medium text-slate-900 focus:border-blue-500/20 focus:ring-8 focus:ring-blue-500/5 outline-none transition-all tabular-nums"
                               />
                               <p className="text-[10px] text-slate-400 italic">*จุดที่ปรับเรทโบนัสพิเศษ (เช่น 100)</p>
                            </div>
                            <div className="space-y-2">
                               <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest ml-1">Super Rate / 10M</label>
                               <input 
                                 type="number"
                                 value={config.performancePolicy.bonusStep2}
                                 onChange={(e) => updatePerformancePolicy({ bonusStep2: parseInt(e.target.value) || 0 })}
                                 className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-base font-medium text-blue-600 focus:border-blue-500/20 focus:ring-8 focus:ring-blue-500/5 outline-none transition-all tabular-nums"
                               />
                               <p className="text-[10px] text-slate-400 italic">*เรทใหม่เมื่อทะลุเป้า Super</p>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                {/* AUDIT STATUS */}
                <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between opacity-30 grayscale">
                   <div className="space-y-0.5">
                      <p className="text-slate-800 font-bold text-[10px] tracking-tight">Intelligence Core v2.4</p>
                      <p className="text-slate-400 text-[8px] uppercase tracking-widest font-bold">Secure Parameter Sync</p>
                   </div>
                   <div className="flex items-center gap-4 text-slate-300">
                      <Globe size={12} />
                      <span className="text-[8px] font-bold uppercase tracking-widest">Persisted</span>
                   </div>
                </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
