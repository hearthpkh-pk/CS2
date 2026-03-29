'use client';

import React, { useState } from 'react';
import { 
  Building2,
  Tag,
  FileText, 
  Settings2, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Globe,
  Briefcase,
  Megaphone,
  Layers,
  Edit3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Brand, CompanyRule, PolicyConfiguration, Role, User } from '@/types';
import { configService } from '@/services/configService';
import { useCompanyConfig } from '../hooks/useCompanyConfig';
import { AnnouncementManager } from './settings/AnnouncementManager';
import { GroupManager } from './settings/GroupManager';

interface CompanySettingsViewProps {
  currentUser: User;
}

export const CompanySettingsView: React.FC<CompanySettingsViewProps> = ({ currentUser }) => {
  const { config, refreshConfig } = useCompanyConfig();
  const [activeTab, setActiveTab] = useState<'brands' | 'rules' | 'policy' | 'announcements' | 'groups'>('brands');
  const [isSaved, setIsSaved] = useState(false);

  const handleSavePolicy = (updatedPolicy: PolicyConfiguration) => {
    configService.updateConfig({ ...config, performancePolicy: updatedPolicy });
    refreshConfig();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // --- Brand Logic ---
  const [newBrand, setNewBrand] = useState('');
  const handleAddBrand = () => {
    if (!newBrand) return;
    const brand: Brand = { id: `brand-${Date.now()}`, name: newBrand, isActive: true };
    configService.saveBrand(brand);
    refreshConfig();
    setNewBrand('');
  };

  const handleDeleteBrand = (id: string) => {
    configService.deleteBrand(id);
    refreshConfig();
  };

  // --- Rule Logic ---
  const [newRule, setNewRule] = useState<Partial<CompanyRule>>({ title: '', content: '', category: 'General' });
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  const handleSaveRule = () => {
    if (!newRule.title || !newRule.content) return;
    const rule: CompanyRule = { 
      id: editingRuleId || `rule-${Date.now()}`, 
      title: newRule.title || '', 
      content: newRule.content || '', 
      category: (newRule.category as any) || 'General',
      order: newRule.order || (config.rules.length + 1),
      targetRoles: newRule.targetRoles,
      lastUpdated: new Date().toISOString() 
    };
    configService.saveRule(rule);
    refreshConfig();
    setNewRule({ title: '', content: '', category: 'General' });
    setEditingRuleId(null);
  };

  const handleEditRule = (rule: CompanyRule) => {
    setNewRule(rule);
    setEditingRuleId(rule.id);
  };

  const handleDeleteRule = (id: string) => {
    configService.deleteRule(id);
    refreshConfig();
  };

  if (currentUser.role !== Role.SuperAdmin && currentUser.role !== Role.Developer) {
    return <div className="p-8 text-slate-500 font-prompt">Access Denied. Super Admin only.</div>;
  }

  return (
    <div className="p-4 md:p-8 pb-32 space-y-10 max-w-[1400px] mx-auto animate-in fade-in duration-700 font-prompt">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">
            <span>Admin Control Panel</span>
            <span className="w-1 h-1 rounded-full bg-slate-200"></span>
            <span>Enterprise Configuration</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 font-outfit tracking-tight flex items-center gap-3">
            <Building2 size={28} className="text-blue-600" />
            Company Settings
          </h1>
        </div>

        {isSaved && (
          <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 px-4 py-2 rounded-xl text-xs font-bold animate-in slide-in-from-top-2">
            <CheckCircle2 size={16} />
            Data Synchronized
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-100 p-2 shadow-sm space-y-1">
            <button 
              onClick={() => setActiveTab('brands')}
              className={cn(
                "w-full flex items-center gap-3 p-4 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest",
                activeTab === 'brands' ? "bg-slate-900 text-white shadow-lg shadow-black/5" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              )}
            >
              <Tag size={16} /> Portfolio
            </button>
            <button 
              onClick={() => setActiveTab('rules')}
              className={cn(
                "w-full flex items-center gap-3 p-4 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest",
                activeTab === 'rules' ? "bg-slate-900 text-white shadow-lg shadow-black/5" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              )}
            >
              <FileText size={16} /> Policy Rules
            </button>
            <button 
              onClick={() => setActiveTab('groups')}
              className={cn(
                "w-full flex items-center gap-3 p-4 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest",
                activeTab === 'groups' ? "bg-slate-900 text-white shadow-lg shadow-black/5" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              )}
            >
              <Layers size={16} /> Groups
            </button>
            <button 
              onClick={() => setActiveTab('announcements')}
              className={cn(
                "w-full flex items-center gap-3 p-4 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest",
                activeTab === 'announcements' ? "bg-slate-900 text-white shadow-lg shadow-black/5" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              )}
            >
              <Megaphone size={16} /> Broadcaster
            </button>
            <button 
              onClick={() => setActiveTab('policy')}
              className={cn(
                "w-full flex items-center gap-3 p-4 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest",
                activeTab === 'policy' ? "bg-slate-900 text-white shadow-lg shadow-black/5" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              )}
            >
              <Settings2 size={16} /> KPI Matrix
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* BRAND MANAGEMENT */}
          {activeTab === 'brands' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Ad Portfolio Brands</h3>
                  <p className="text-slate-400 text-xs mt-1">Manage official brands for ad-placement and performance reporting.</p>
                </div>

                <div className="flex gap-2">
                  <input 
                    placeholder="New Brand Name..."
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 ring-blue-500 outline-none font-medium placeholder:text-slate-300"
                  />
                  <button 
                    onClick={handleAddBrand}
                    className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100"
                  >
                    <Plus size={18} /> Add
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {config.brands.map(brand => (
                    <div key={brand.id} className="group flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-blue-600 font-black text-xs shadow-sm">
                           {brand.name.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{brand.name}</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteBrand(brand.id)}
                        className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* RULES EDITOR */}
          {activeTab === 'rules' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-8">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">Dynamic Policy Publisher</h3>
                      <p className="text-slate-400 text-xs mt-1">Manage content displayed in the Unified Policy Center.</p>
                    </div>
                    {editingRuleId && (
                       <button 
                         onClick={() => { setEditingRuleId(null); setNewRule({title: '', content: '', category: 'General' }); }}
                         className="text-slate-400 text-xs font-bold hover:text-slate-600"
                       >
                         Cancel Edit
                       </button>
                    )}
                  </div>

                  <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{editingRuleId ? 'Modify Strategy' : 'Construct New Policy'}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        placeholder="Rule Title..."
                        value={newRule.title}
                        onChange={(e) => setNewRule({...newRule, title: e.target.value})}
                        className="bg-white border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 ring-blue-500 outline-none font-bold"
                      />
                        <select 
                          value={newRule.category}
                          onChange={(e) => setNewRule({...newRule, category: e.target.value as any})}
                          className="bg-white border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 ring-blue-500 outline-none font-bold"
                        >
                          <option value="Operation">Operation</option>
                          <option value="Finance">Finance</option>
                          <option value="Safety">Safety</option>
                          <option value="Compliance">Compliance</option>
                          <option value="General">General</option>
                        </select>
                    </div>
                    <textarea 
                      placeholder="Policy Content & Details (Use - for bullets)..."
                      value={newRule.content}
                      onChange={(e) => setNewRule({...newRule, content: e.target.value})}
                      className="w-full bg-white border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 ring-blue-500 outline-none font-medium h-32 whitespace-pre-wrap"
                    />
                    <button 
                      onClick={handleSaveRule}
                      className="w-full bg-slate-900 text-white py-4 rounded-2xl text-xs font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/5"
                    >
                      {editingRuleId ? <Save size={18} /> : <Plus size={18} />} 
                      {editingRuleId ? 'Commit Rule Changes' : 'Publish Official Rule'}
                    </button>
                  </div>

                  <div className="space-y-4">
                    {config.rules.map(rule => (
                      <div key={rule.id} className="p-6 bg-white border border-slate-100 rounded-3xl group relative hover:border-blue-100 transition-all shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                           <div className="flex items-center gap-3">
                              <span className={cn(
                                "px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter",
                                rule.category === 'Finance' ? "bg-emerald-50 text-emerald-600" : 
                                rule.category === 'Safety' ? "bg-rose-50 text-rose-600" : 
                                rule.category === 'Operation' ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-600"
                              )}>
                                {rule.category}
                              </span>
                              <h4 className="font-bold text-slate-800">{rule.title}</h4>
                           </div>
                           <div className="flex items-center gap-1">
                              <button 
                                onClick={() => handleEditRule(rule)}
                                className="p-2 text-slate-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteRule(rule.id)}
                                className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                           </div>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-noto line-clamp-2">{rule.content}</p>
                        <p className="text-[9px] text-slate-300 mt-4 uppercase font-bold tracking-widest leading-none">
                          Sync Hash: {rule.id.substring(0, 8)} • Updated: {new Date(rule.lastUpdated).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          )}

          {/* GROUP MANAGEMENT */}
          {activeTab === 'groups' && (
            <GroupManager />
          )}

          {/* ANNOUNCEMENT MANAGER */}
          {activeTab === 'announcements' && (
            <AnnouncementManager />
          )}

          {/* SYSTEM POLICY */}
          {activeTab === 'policy' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-8 font-prompt font-noto">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 font-outfit tracking-tight">Financial Performance Policy</h3>
                      <p className="text-slate-400 text-xs mt-1">Configure global view targets, penalties, and baseline thresholds.</p>
                    </div>
                    <button 
                      onClick={() => handleSavePolicy(config.performancePolicy)}
                      className="bg-emerald-600 text-white px-8 py-3 rounded-2xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100"
                    >
                      <Save size={18} /> Update Matrix
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Globe size={14} className="text-blue-500" /> Organizational Targets
                        </p>
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-600 ml-1">Daily Minimum View Target (Total)</label>
                          <input 
                            type="number"
                            value={config.performancePolicy.minViewTarget}
                            onChange={(e) => configService.updateConfig({...config, performancePolicy: {...config.performancePolicy, minViewTarget: parseInt(e.target.value)}})}
                            className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 ring-blue-500 outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                             <label className="text-[11px] font-bold text-slate-600 ml-1">Pages Per Day</label>
                             <input 
                               type="number"
                               value={config.performancePolicy.requiredPagesPerDay}
                               onChange={(e) => configService.updateConfig({...config, performancePolicy: {...config.performancePolicy, requiredPagesPerDay: parseInt(e.target.value)}})}
                               className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 ring-blue-500 outline-none"
                             />
                           </div>
                           <div className="space-y-2">
                             <label className="text-[11px] font-bold text-slate-600 ml-1">Clips Per Page</label>
                             <input 
                               type="number"
                               value={config.performancePolicy.clipsPerPageInLog}
                               onChange={(e) => configService.updateConfig({...config, performancePolicy: {...config.performancePolicy, clipsPerPageInLog: parseInt(e.target.value)}})}
                               className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 ring-blue-500 outline-none"
                             />
                           </div>
                        </div>
                     </div>

                     <div className="space-y-6 p-6 bg-amber-50/30 rounded-3xl border border-amber-100/50">
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                          <Briefcase size={14} /> Compensation Matrix
                        </p>
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-600 ml-1 font-prompt">หักเงินประกันเพจ (บาท/ครั้ง)</label>
                          <input 
                            type="number"
                            value={config.performancePolicy.penaltyAmount}
                            onChange={(e) => configService.updateConfig({...config, performancePolicy: {...config.performancePolicy, penaltyAmount: parseInt(e.target.value)}})}
                            className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 ring-amber-500 outline-none text-rose-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-600 ml-1 font-prompt">โบนัสวิวสะสม (บาท/ล้านวิว)</label>
                          <input 
                            type="number"
                            value={config.performancePolicy.bonusStep1}
                            onChange={(e) => configService.updateConfig({...config, performancePolicy: {...config.performancePolicy, bonusStep1: parseInt(e.target.value)}})}
                            className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 ring-emerald-500 outline-none text-emerald-600"
                          />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
