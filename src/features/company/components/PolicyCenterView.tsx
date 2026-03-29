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

interface PolicyCenterViewProps {
   currentUser: User;
}

export const PolicyCenterView: React.FC<PolicyCenterViewProps> = ({ currentUser }) => {
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

   // COMMISSION CALCULATOR SUB-COMPONENT - REFINED UX & NO BOLD/BACKGROUNDS
   const CommissionCalculator = () => {
      const [views, setViews] = useState(10);
      const [isAnimating, setIsAnimating] = useState(false);

      // Calculation Logic Based on Reference
      const calculateCommission = (v: number) => {
         if (v < 10) return -2000;
         if (v < 20) return 0;
         if (v < 30) return 2000;
         if (v < 100) {
            return 3000 + (Math.floor((v - 30) / 10) * 1000);
         }
         return (Math.floor(v / 10) * 1500);
      };

      const comm = calculateCommission(views);
      const isSuperBonus = views >= 100;
      const isPenalty = views < 10;

      return (
         <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-full lg:max-w-3xl">
            {/* INPUT SECTION - SCALED DOWN */}
            <div className="rounded-[2rem] border border-slate-100 p-6 md:p-8 space-y-6 bg-transparent hover:border-blue-400/20 transition-all group">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                     <Calculator size={16} className="text-blue-500" strokeWidth={1.5} />
                     <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] leading-none">
                        Investment & Growth Simulator
                     </h4>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-1.5 border border-slate-50 rounded-xl">
                     <Target size={12} className="text-slate-300" />
                     <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest leading-none">
                        Target: 10M / Month
                     </span>
                  </div>
               </div>

               <div className="space-y-8">
                  <div className="space-y-4">
                     <div className="flex justify-between items-end px-1">
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                           ยอดวิวสะสม (ล้านวิว)
                        </span>
                        <div className="flex items-baseline gap-1">
                           <span className={cn("text-2xl font-medium tracking-tighter", isSuperBonus ? "text-blue-600" : "text-slate-800")}>
                              {views}
                           </span>
                           <span className="text-[10px] font-medium text-slate-300 uppercase tracking-widest">M</span>
                        </div>
                     </div>
                     <div className="relative pt-1 px-1">
                        <input
                           type="range"
                           min="0"
                           max="200"
                           step="5"
                           value={views}
                           onChange={(e) => {
                              setViews(Number(e.target.value));
                              setIsAnimating(true);
                              setTimeout(() => setIsAnimating(false), 500);
                           }}
                           className="w-full h-1 bg-slate-50 rounded-full appearance-none cursor-pointer accent-blue-600 transition-all hover:h-1.5"
                        />
                     </div>
                  </div>

                  <div className="flex flex-col items-center justify-center py-4 border-t border-slate-50 animate-in fade-in duration-700">
                     <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-2">Expected Net Profit</p>
                     <div className={cn(
                        "text-4xl md:text-5xl font-medium tracking-tighter transition-all duration-500 flex items-baseline gap-2",
                        isPenalty ? "text-rose-400" : isSuperBonus ? "text-blue-600" : "text-emerald-500",
                        isAnimating && "scale-105"
                     )}>
                        {comm >= 0 ? '+' : ''}{comm.toLocaleString()}
                        <span className="text-sm font-medium text-slate-300 uppercase tracking-normal">THB</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* STATUS TIERS - ADAPTIVE FOR VERTICAL/MOBILE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* SUPER BONUS TIER - PREMIUM DARK STYLE MATCHING HEADER */}
               <div className={cn(
                  "relative overflow-hidden rounded-[2rem] border p-8 space-y-4 transition-all duration-700 group flex flex-col justify-center",
                  isSuperBonus
                     ? "bg-gradient-to-br from-slate-950 via-blue-950 to-black border-white/10 text-white shadow-xl scale-[1.01]"
                     : "border-slate-100 opacity-60 grayscale hover:grayscale-0 hover:border-blue-200"
               )}>
                  <div className="flex items-center gap-2 mb-1">
                     <div className={cn(
                        "px-3 py-1 border rounded-full flex items-center gap-2",
                        isSuperBonus ? "border-blue-400/30" : "border-blue-600"
                     )}>
                        <Trophy size={12} className={isSuperBonus ? "text-blue-400" : "text-blue-600"} />
                        <span className={cn(
                           "text-[9px] font-medium uppercase tracking-[0.2em] leading-none",
                           isSuperBonus ? "text-blue-400" : "text-blue-600"
                        )}>Special Bonus Tier</span>
                     </div>
                  </div>
                  <h3 className={cn(
                     "text-xl font-medium tracking-tight",
                     isSuperBonus ? "text-white" : "text-slate-800"
                  )}>SUPER BONUS</h3>
                  <p className={cn(
                     "text-[12px] font-medium leading-relaxed font-noto",
                     isSuperBonus ? "text-slate-400" : "text-slate-500"
                  )}>
                     ปรับคอมมิชชันใหม่เป็น <span className={isSuperBonus ? "text-blue-400" : "text-blue-600"}>1,500 บาท / 10 ล้านวิว</span> ตั้งแต่ 100 ล้านวิวขึ้นไปต่อเดือน
                  </p>
                  {isSuperBonus && <Sparkles size={32} className="absolute -bottom-1 -right-1 text-blue-400/30 animate-pulse" strokeWidth={1} />}
               </div>

               {/* MILESTONE LIST - SCALED DOWN */}
               <div className="rounded-[2rem] border border-slate-100 p-8 space-y-4 group transition-all duration-500 hover:border-emerald-100 flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-1">
                     <h3 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <TrendingUp size={14} className="text-emerald-500" /> Tier Milestones
                     </h3>
                  </div>
                  <div className="space-y-3">
                     {[20, 30, 100].map(tier => (
                        <div key={tier} className="flex items-center justify-between text-[12px] font-medium">
                           <div className="flex items-center gap-3">
                              <div className={cn(
                                 "w-1 h-1 rounded-full transition-all duration-500",
                                 views >= tier ? (tier === 100 ? "bg-blue-600" : "bg-emerald-500") : "bg-slate-100 shadow-inner"
                              )} />
                              <span className={cn(
                                 "transition-all duration-300",
                                 views >= tier ? "text-slate-800" : "text-slate-300"
                              )}>
                                 ทะลุ {tier}M
                              </span>
                           </div>
                           <span className={cn(
                              "transition-all duration-300 font-medium tabular-nums py-0.5 border-b border-transparent",
                              views >= tier
                                 ? (tier === 100 ? "text-blue-600" : "text-emerald-600")
                                 : "text-slate-200"
                           )}>
                              +{tier === 100 ? '15,000' : tier === 30 ? '3,000' : '2,000'} THB
                           </span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* PENALTY ADVISORY - MINIMALIST */}
            <div className={cn(
               "flex items-center gap-4 px-8 py-4 rounded-[1.5rem] border transition-all duration-500",
               isPenalty ? "border-rose-100 opacity-100" : "border-slate-50 opacity-40 grayscale"
            )}>
               <AlertTriangle size={16} className={cn(isPenalty ? "text-rose-500" : "text-slate-300")} strokeWidth={1.5} />
               <p className="text-[11px] font-medium text-slate-500 font-noto leading-normal">
                  หมายเหตุ: หากยอดวิวไม่ถึง 10 ล้านวิว หักปรับ 2,000 บาท | ยอดตั้งแต่ 10 ล้านวิวขึ้นไป รับเงินเดือนปกติ
               </p>
            </div>
         </div>
      );
   };

   // INFOGRAPHIC RENDERER COMPONENT
   const RuleContentRenderer = ({ content, ruleId }: { content: string, ruleId: string }) => {
      const lines = content.split('\n').filter(l => l.trim().length > 0);

      // COMMISSION SPECIAL RENDERER
      if (ruleId === 'rule-commission' || content.toLowerCase().includes('commission') || content.includes('ค่าคอม')) {
         return <CommissionCalculator />;
      }

      if (ruleId === 'rule-responsibilities' || ruleId === 'rule-general' || content.includes('พนักงาน')) {
         return (
            <div className="space-y-4">
               {lines.map((line, i) => (
                  <div key={i} className="flex items-start gap-4 group cursor-default">
                     <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0 transition-all duration-300 group-hover:scale-150 group-hover:bg-blue-600 shadow-sm" />
                     <p className="text-[13px] text-slate-600 font-medium leading-relaxed font-noto transition-all duration-300 group-hover:text-slate-900 group-hover:translate-x-1 group-hover:scale-[1.02] origin-left">
                        {line.replace(/^- /, '')}
                     </p>
                  </div>
               ))}
            </div>
         );
      }

      if (content.includes('Tier 1') || content.includes('Tier 2') || content.includes('Commission')) {
         return (
            <div className="space-y-3">
               {lines.map((line, i) => {
                  const isTier = line.includes('Tier');
                  return (
                     <div key={i} className={cn(
                        "flex items-center gap-4 p-3 rounded-2xl border transition-all duration-300 font-prompt group cursor-default",
                        isTier ? "border-emerald-200 hover:border-emerald-400" : "border-slate-100 hover:border-blue-200"
                     )}>
                        <div className={cn(
                           "w-1.5 h-1.5 rounded-full shrink-0 ml-1 shadow-sm transition-all duration-300 group-hover:scale-125",
                           isTier ? "bg-emerald-500" : "bg-slate-300 group-hover:bg-blue-500"
                        )} />
                        <p className={cn(
                           "text-[13px] leading-relaxed font-medium transition-all duration-300 group-hover:translate-x-1 group-hover:scale-[1.01] origin-left",
                           isTier ? "text-emerald-900" : "text-slate-600 group-hover:text-slate-900"
                        )}>
                           {line.replace(/^- /, '')}
                        </p>
                     </div>
                  );
               })}
            </div>
         );
      }

      if (content.includes('วันจันทร์') || content.includes('ลางาน') || content.includes('เวลาทำงาน')) {
         return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               {lines.map((line, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-transparent border border-slate-100 group transition-all duration-300 hover:border-blue-200 cursor-default">
                     <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0 shadow-sm transition-all duration-300 group-hover:scale-150" />
                     <p className="text-[13px] text-slate-700 font-medium leading-normal font-noto transition-all duration-300 group-hover:text-slate-900 group-hover:scale-[1.02] origin-left">{line.replace(/^- /, '')}</p>
                  </div>
               ))}
            </div>
         );
      }

      if (content.includes('หักเงิน') || content.includes('เตือน') || content.includes('โทษ')) {
         return (
            <div className="space-y-5">
               <div className="p-6 rounded-[2rem] bg-transparent border border-rose-100 flex items-center gap-5 group transition-all duration-300 hover:border-rose-300 cursor-default">
                  <AlertTriangle size={24} className="text-rose-500 shrink-0 transition-transform duration-300 group-hover:scale-110" strokeWidth={1.5} />
                  <div className="space-y-1">
                     <h4 className="text-sm font-medium text-rose-900 leading-tight">มาตรการทางวินัย</h4>
                     <p className="text-[13px] text-rose-800 font-medium leading-relaxed font-noto transition-all duration-300 group-hover:text-rose-950 group-hover:scale-[1.01] origin-left">
                        {lines[0]}
                     </p>
                  </div>
               </div>
               {lines.length > 1 && (
                  <div className="space-y-3 pl-2">
                     {lines.slice(1).map((line, i) => (
                        <div key={i} className="flex items-start gap-4 group cursor-default">
                           <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0 shadow-sm transition-all duration-300 group-hover:scale-150" />
                           <p className="text-[13px] font-medium text-slate-500 font-noto transition-all duration-300 group-hover:text-slate-800 group-hover:translate-x-1 group-hover:scale-[1.02] origin-left">{line.replace(/^- /, '')}</p>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         );
      }

      return (
         <div className="space-y-3">
            {lines.map((line, i) => (
               <div key={i} className="flex items-start gap-4 group cursor-default">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0 shadow-sm transition-all duration-300 group-hover:scale-150" />
                  <p className="text-[13px] text-slate-600 font-medium font-noto leading-relaxed transition-all duration-300 group-hover:text-slate-900 group-hover:translate-x-1 group-hover:scale-[1.02] origin-left">{line.replace(/^- /, '')}</p>
               </div>
            ))}
         </div>
      );
   };

   return (
      <div className="p-4 md:p-8 space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-700 font-prompt pb-32">

         {/* PAGE HEADER */}
         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 px-2">
            <div className="space-y-1">
               <h1 className="text-2xl font-medium font-outfit tracking-tight text-slate-900 border-l-2 border-blue-600 pl-4 uppercase">
                  Governance & Standards
               </h1>
               <p className="text-sm text-slate-400 font-medium font-noto pl-4 uppercase tracking-[0.2em] text-[10px]">
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
                     <button
                        onClick={handleToggleEdit}
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
                  )}
               </div>
            </div>
         </div>

         {/* HERO SECTION */}
         <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-blue-950 to-black p-8 md:p-12 text-white shadow-2xl border border-white/5">
            <div className="relative z-10 max-w-3xl space-y-4">
               <h2 className="text-xl md:text-2xl font-medium leading-tight font-prompt">
                  ระเบียบปฏิบัติและ <span className="text-blue-500">มาตรฐานการทำงานภายใน</span>
               </h2>
               <p className="text-slate-400 text-[13px] md:text-sm font-medium leading-relaxed font-noto">
                  คู่มือการดำเนินงานที่เป็นมาตรฐาน เพื่อรักษาคุณภาพและระดับประสิทธิภาพสูงสุดร่วมกันในองค์กร
               </p>
            </div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
         </div>

         <div className="flex flex-col lg:flex-row gap-8 items-start">

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
                              setActiveRuleId(rule.id);
                              if (isEditMode) setEditForm({ ...rule });
                           }}
                           className={cn(
                              "w-full flex items-center justify-between px-5 py-4 rounded-2xl text-[13px] transition-all duration-300 border font-medium text-left",
                              activeRuleId === rule.id
                                 ? "text-blue-600 border-blue-600 bg-transparent shadow-lg shadow-blue-600/5 font-semibold"
                                 : "text-slate-500 border-slate-100 hover:border-blue-200 bg-transparent"
                           )}
                        >
                           <div className="flex items-center gap-3">
                              <span className={cn(
                                 "transition-transform group-hover:scale-110",
                                 activeRuleId === rule.id ? "text-blue-600" : "text-blue-500"
                              )}>
                                 {idx + 1}.
                              </span>
                              <span className="truncate max-w-[170px] font-medium">{rule.title.replace(/\s*\(.*\)/, '')}</span>
                           </div>
                           <ChevronRight size={14} className={cn(
                              "transition-transform duration-300",
                              activeRuleId === rule.id ? "translate-x-1 opacity-100 text-blue-600" : "opacity-0"
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
                        <RuleContentRenderer content={activeRule.content} ruleId={activeRule.id} />
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
