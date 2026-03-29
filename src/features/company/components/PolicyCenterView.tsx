'use client';

import React, { useState, useEffect } from 'react';
import {
   ShieldCheck,
   FileText,
   AlertTriangle,
   Info,
   ArrowRight,
   Users,
   Briefcase,
   Flame,
   ChevronRight,
   BookOpen,
   Lock,
   CheckCircle2,
   Edit3,
   X,
   Save,
   ArrowUp,
   ArrowDown,
   Plus,
   Trash2,
   Eye,
   EyeOff,
   Sparkles,
   RotateCcw,
   TrendingUp,
   Coins,
   Calculator,
   Trophy,
   Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { User, Role, CompanyRule } from '@/types';
import { useCompanyConfig } from '../hooks/useCompanyConfig';
import { configService } from '@/services/configService';
import { CommissionCalculator } from './CommissionCalculator';
import { RuleContentRenderer } from './RuleContentRenderer';

interface PolicyCenterViewProps {
   currentUser: User;
   onNavigate?: (tab: string, subTab?: string) => void;
}

export const PolicyCenterView: React.FC<PolicyCenterViewProps> = ({ currentUser, onNavigate }) => {
   const { config, getPolicyForUser, refreshConfig } = useCompanyConfig();
   const userPolicy = getPolicyForUser(currentUser);
   const userGroup = config.groups.find(g => g.id === currentUser.group);

   const isAdminOrDev = currentUser.role === Role.SuperAdmin || currentUser.role === Role.Developer;
   const [activeRuleId, setActiveRuleId] = useState<string | null>(null);

   // Admin Edit State
   const [isEditMode, setIsEditMode] = useState(false);
   const [editForm, setEditForm] = useState<Partial<CompanyRule> | null>(null);
   const [isSaving, setIsSaving] = useState(false);

   // Filter and Sort Rules
   const filteredRules = config.rules
      .filter(r => {
         if (isAdminOrDev && isEditMode) return true; // Show all in edit mode
         if (!r.targetRoles || r.targetRoles.length === 0) return true; // Default to all
         return r.targetRoles.includes(currentUser.role);
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));

   // Auto-select first rule
   useEffect(() => {
      if (filteredRules.length > 0 && !activeRuleId) {
         setActiveRuleId(filteredRules[0].id);
      }
   }, [filteredRules, activeRuleId]);

   const activeRule = config.rules.find(r => r.id === activeRuleId);

   // Administrative Handlers
   const handleToggleEdit = () => {
      if (!isEditMode && activeRule) {
         setEditForm({ ...activeRule });
      }
      setIsEditMode(!isEditMode);
   };

   const handleSaveEdit = async () => {
      if (!editForm || !editForm.id) return;
      setIsSaving(true);
      try {
         configService.saveRule(editForm as CompanyRule);
         refreshConfig();
         setIsEditMode(false);
         setEditForm(null);
      } finally {
         setIsSaving(false);
      }
   };

   const handleMoveRule = (ruleId: string, direction: 'up' | 'down') => {
      const currentIds = config.rules.sort((a, b) => (a.order || 0) - (b.order || 0)).map(r => r.id);
      const index = currentIds.indexOf(ruleId);
      if (index < 0) return;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= currentIds.length) return;

      const newOrder = [...currentIds];
      [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];

      configService.reorderRules(newOrder);
      refreshConfig();
   };

   const toggleRoleTarget = (role: Role) => {
      if (!editForm) return;
      const current = editForm.targetRoles || [];
      const updated = current.includes(role)
         ? current.filter(r => r !== role)
         : [...current, role];
      setEditForm({ ...editForm, targetRoles: updated });
   };

   return (
      <div className="p-4 md:p-8 space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-700 font-prompt pb-32">

         {/* PAGE HEADER */}
         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 px-2">
            <div className="space-y-1.5">
               <h1 className="text-3xl font-bold font-outfit tracking-tight text-slate-900 uppercase">
                  Governance & Standards
               </h1>
               <p className="text-[10px] text-slate-400 font-bold font-noto uppercase tracking-[0.25em]">
                  Internal Compliance & Operating Guidelines
               </p>
            </div>

            <div className="flex items-center gap-4">
               <div className="flex items-center gap-3 bg-transparent p-1">
                  <div className="flex items-center gap-3 px-6 py-2.5 border border-slate-100 rounded-2xl bg-transparent">
                     <Users size={16} className="text-blue-500" />
                     <h4 className="font-medium text-xs text-slate-700 uppercase tracking-widest leading-none">
                        {userGroup?.name || 'Standard'}
                     </h4>
                  </div>

                  {isAdminOrDev && (
                     <div className="flex items-center gap-2">
                        <button
                           onClick={() => {
                               if (activeRuleId === 'rule-commission' && onNavigate) {
                                  onNavigate('settings', 'policy');
                               } else {
                                  handleToggleEdit();
                               }
                           }}
                           className={cn(
                              "w-11 h-11 flex items-center justify-center rounded-2xl transition-all border shadow-sm",
                              isEditMode
                                 ? "text-rose-500 border-rose-500 hover:scale-105"
                                 : "text-slate-400 border-slate-200 hover:border-blue-500 hover:text-blue-500"
                           )}
                           title={isEditMode ? 'Exit Mode' : 'Modify Policy'}
                        >
                           {isEditMode ? <X size={20} /> : <Edit3 size={20} />}
                        </button>
                     </div>
                  )}
               </div>
            </div>
         </div>

         <div className="pt-2 flex flex-col lg:flex-row gap-10 items-start">

            {/* SIDEBAR */}
            <div className="w-full lg:w-80 shrink-0 lg:sticky lg:top-24 space-y-4 font-prompt">
               <div className="flex items-center justify-between px-2 text-slate-400 mb-2">
                  <div className="flex items-center gap-2">
                     <BookOpen size={16} strokeWidth={1.5} />
                     <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Index</span>
                  </div>
               </div>

               <nav className="space-y-1.5">
                  {filteredRules.map((rule, idx) => (
                     <div key={rule.id} className="relative group">
                        <button
                           onClick={() => {
                              if (rule.id === 'rule-commission' && isEditMode && onNavigate) {
                                 setIsEditMode(false);
                                 onNavigate('settings', 'policy');
                                 return;
                              }
                              setActiveRuleId(rule.id);
                              if (isEditMode) setEditForm({ ...rule });
                           }}
                           className={cn(
                              "w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[13px] transition-all duration-300 border font-medium text-left",
                              activeRuleId === rule.id
                                 ? "bg-[#2871df] text-white border-[#2871df] shadow-xl shadow-blue-600/20 font-semibold"
                                 : "text-slate-500 border-slate-100 hover:border-blue-200 bg-transparent"
                           )}
                        >
                           <div className="flex items-center gap-3">
                              <span className={cn(
                                 "transition-transform group-hover:scale-110",
                                 activeRuleId === rule.id ? "text-white" : "text-blue-500"
                              )}>
                                 {idx + 1}.
                              </span>
                              <span className="truncate max-w-[170px] font-medium">{rule.title.replace(/\s*\(.*\)/, '')}</span>
                           </div>
                           <ChevronRight size={14} className={cn(
                              "transition-transform duration-300",
                              activeRuleId === rule.id ? "translate-x-1 opacity-100 text-white" : "opacity-0"
                           )} />
                        </button>

                        {isEditMode && isAdminOrDev && (
                           <div className="absolute right-[-2.5rem] top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-100 transition-all">
                              <button
                                 disabled={idx === 0}
                                 onClick={(e) => { e.stopPropagation(); handleMoveRule(rule.id, 'up'); }}
                                 className="p-1 rounded-full bg-transparent border border-slate-200 text-slate-400 hover:text-blue-500 disabled:opacity-30"
                              >
                                 <ArrowUp size={14} />
                              </button>
                              <button
                                 disabled={idx === filteredRules.length - 1}
                                 onClick={(e) => { e.stopPropagation(); handleMoveRule(rule.id, 'down'); }}
                                 className="p-1 rounded-full bg-transparent border border-slate-200 text-slate-400 hover:text-blue-500 disabled:opacity-30"
                              >
                                 <ArrowDown size={14} />
                              </button>
                           </div>
                        )}
                     </div>
                  ))}
               </nav>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 min-w-0 bg-transparent border border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm min-h-[700px] animate-in slide-in-from-bottom-4 duration-500 font-prompt">
                               {isEditMode && editForm ? (
                  /* EDITOR VIEW */
                  <div className="space-y-10 animate-in fade-in duration-500">
                     <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                        <h2 className="text-3xl font-medium text-slate-800">Inline Editor</h2>
                        <div className="flex items-center gap-3">
                           <button
                              onClick={() => setIsEditMode(false)}
                              className="px-6 py-2.5 rounded-2xl text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                           >
                              Discard
                           </button>
                           <button
                              onClick={handleSaveEdit}
                              disabled={isSaving}
                              className="flex items-center gap-2 px-8 py-2.5 rounded-2xl text-xs font-semibold border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-lg shadow-blue-500/10 disabled:opacity-50"
                           >
                              {isSaving ? 'Processing...' : <><Save size={16} /> Save Changes</>}
                           </button>
                        </div>
                     </div>

                     <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-2">Title</label>
                              <input
                                 value={editForm.title || ''}
                                 onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                 className="w-full bg-transparent border border-slate-200 rounded-2xl px-6 py-4 text-base font-medium focus:border-blue-500 outline-none transition-all"
                                 placeholder="Enter title..."
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-2">Category</label>
                              <select
                                 value={editForm.category || 'General'}
                                 onChange={(e) => setEditForm({ ...editForm, category: e.target.value as any })}
                                 className="w-full bg-transparent border border-slate-200 rounded-2xl px-6 py-4 text-base font-medium focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                              >
                                 <option value="Operation">Operation / Duty</option>
                                 <option value="Finance">Financial / Commission</option>
                                 <option value="Safety">Safety / Penalty</option>
                                 <option value="Compliance">Compliance</option>
                                 <option value="General">General Information</option>
                              </select>
                           </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-2">Policy Content</label>
                           <textarea
                              value={editForm.content || ''}
                              onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                              className="w-full bg-transparent border border-slate-200 rounded-3xl px-6 py-5 text-base font-medium focus:border-blue-500 outline-none min-h-[300px] leading-relaxed font-noto transition-all"
                              placeholder="Content goes here..."
                           />
                        </div>

                        <div className="space-y-4 pt-6 mt-6 border-t border-slate-100">
                           <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-2 mb-4">Target Visibility</h4>
                           <div className="flex flex-wrap gap-3">
                              {[Role.Staff, Role.Manager, Role.SuperAdmin, Role.Developer].map(role => {
                                 const isActive = editForm.targetRoles?.includes(role) || (!editForm.targetRoles && role !== Role.Developer);
                                 return (
                                    <button
                                       key={role}
                                       onClick={() => toggleRoleTarget(role)}
                                       className={cn(
                                          "flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-semibold border transition-all",
                                          isActive
                                             ? "text-blue-600 border-blue-600 shadow-sm"
                                             : "text-slate-300 border-slate-100 grayscale opacity-40 hover:opacity-100"
                                       )}
                                    >
                                       {isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                                       {role}
                                    </button>
                                 );
                              })}
                           </div>
                        </div>
                     </div>
                  </div>
               ) : activeRule ? (
                  /* VIEW MODE */
                  <div className="space-y-8">
                     <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-100 pb-6">
                        <div className="space-y-2">
                           <h2 className="text-xl font-medium font-outfit text-slate-800 tracking-tight leading-tight uppercase">
                              {activeRule.title}
                           </h2>
                        </div>
                     </div>

                     <div className="prose prose-slate max-w-none">
                        <RuleContentRenderer 
                            content={activeRule.content} 
                            ruleId={activeRule.id} 
                            settings={config.performancePolicy}
                         />
                     </div>
                  </div>
               ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-200 space-y-4 text-center">
                     <FileText size={48} strokeWidth={1} className="opacity-20 mx-auto" />
                     <p className="font-semibold uppercase tracking-widest text-[10px]">Waiting Data Refresh...</p>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};
