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
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { User } from '@/types';
import { useCompanyConfig } from '../hooks/useCompanyConfig';

interface PolicyCenterViewProps {
  currentUser: User;
}

export const PolicyCenterView: React.FC<PolicyCenterViewProps> = ({ currentUser }) => {
  const { config, getPolicyForUser } = useCompanyConfig();
  const userPolicy = getPolicyForUser(currentUser);
  const userGroup = config.groups.find(g => g.id === currentUser.group);
  
  const [activeRuleId, setActiveRuleId] = useState<string | null>(null);

  // Initialize with the first rule or submission rule
  useEffect(() => {
    if (config.rules.length > 0 && !activeRuleId) {
      const submissionRule = config.rules.find(r => r.id.includes('submissions'));
      setActiveRuleId(submissionRule ? submissionRule.id : config.rules[0].id);
    }
  }, [config.rules, activeRuleId]);

  const activeRule = config.rules.find(r => r.id === activeRuleId);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-700 font-prompt pb-32">
      
      {/* HEADER SECTION (CLEANER) */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 md:p-10 text-white shadow-2xl border border-white/5">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
           <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest">
                <ShieldCheck size={14} /> Official Corporate Policy v2.4
              </div>
              <h1 className="text-3xl md:text-4xl font-bold font-outfit tracking-tight leading-none">
                Unified Policy & Compliance <span className="text-blue-500">Manual</span>
              </h1>
              <p className="text-slate-400 text-sm font-medium leading-relaxed font-noto">
                มาตรฐานการทำงานและเกณฑ์การวัดผลระดับสากล เพื่อรักษาคุณภาพและวัฒนธรรมองค์กรที่มีประสิทธิภาพสูง
              </p>
           </div>

           {/* User Group Context Card (Smaller & Semibold) */}
           <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 space-y-3 w-full md:w-72">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
                    <Users size={18} className="text-white" />
                 </div>
                 <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Target Group</p>
                    <h4 className="font-semibold text-base text-white">{userGroup?.name || 'Standard Personnel'}</h4>
                 </div>
              </div>
              
              <div className="space-y-1 pt-2 border-t border-white/5">
                 <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Min Pages/Day</span>
                    <span className="text-blue-400 font-bold">{userPolicy.requiredPagesPerDay} Pages</span>
                 </div>
                 <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Clips/Page</span>
                    <span className="text-blue-400 font-bold">{userPolicy.clipsPerPageInLog} Clips</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* DUAL PANE LAYOUT (TOC STYLE) */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* TABLE OF CONTENTS (SIDEBAR) */}
        <div className="w-full lg:w-80 shrink-0 lg:sticky lg:top-24 space-y-4">
           <div className="flex items-center gap-2 px-2 text-slate-400 mb-2">
              <BookOpen size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Table of Contents</span>
           </div>
           
           <nav className="space-y-1.5">
              {config.rules.map((rule) => (
                 <button
                   key={rule.id}
                   onClick={() => setActiveRuleId(rule.id)}
                   className={cn(
                     "w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm transition-all duration-300 border font-medium group text-left",
                     activeRuleId === rule.id
                       ? "bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/20"
                       : "bg-white text-slate-600 border-slate-100 hover:border-blue-200 hover:bg-blue-50/50"
                   )}
                 >
                   <div className="flex items-center gap-3">
                      <div className={cn(
                        "transition-transform group-hover:scale-110 duration-500",
                        activeRuleId === rule.id ? "text-white" : "text-blue-500"
                      )}>
                         {rule.category === 'Finance' ? <Briefcase size={16} /> : 
                          rule.category === 'Safety' ? <AlertTriangle size={16} /> : 
                          rule.id.includes('submissions') ? <Flame size={16} /> : <FileText size={16} />}
                      </div>
                      <span className="truncate max-w-[180px]">{rule.title.replace(/\s*\(.*\)/, '')}</span>
                   </div>
                   <ChevronRight size={14} className={cn(
                     "transition-transform duration-300",
                     activeRuleId === rule.id ? "translate-x-1 opacity-100" : "opacity-0"
                   )} />
                 </button>
              ))}

              <div className="pt-4 mt-4 border-t border-slate-100">
                 <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500">
                       <Lock size={14} />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Security Level</p>
                       <p className="text-xs font-semibold text-slate-600">Enterprise Standard</p>
                    </div>
                 </div>
              </div>
           </nav>
        </div>

        {/* ACTIVE CONTENT AREA */}
        <div className="flex-1 min-w-0 bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-12 shadow-sm min-h-[600px] animate-in slide-in-from-bottom-4 duration-500">
           {activeRule ? (
              <div className="space-y-10">
                 <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-50 pb-8">
                    <div className="space-y-3">
                       <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                         {activeRule.category} Policy
                       </span>
                       <h2 className="text-3xl font-bold font-outfit text-slate-800 tracking-tight">
                         {activeRule.title}
                       </h2>
                    </div>
                    
                    <div className="flex items-center gap-2 text-slate-300 text-[10px] font-bold uppercase tracking-widest pt-2">
                       Validated: {new Date(activeRule.lastUpdated).toLocaleDateString()}
                    </div>
                 </div>

                 <div className="prose prose-slate max-w-none">
                    <div className="text-lg text-slate-600 font-medium leading-[1.8] font-noto whitespace-pre-wrap">
                       {activeRule.content}
                    </div>

                    {/* Submission Specialized Highlight */}
                    {activeRule.id.includes('submissions') && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-10">
                           <div className="bg-slate-950 rounded-3xl p-7 border border-white/5 shadow-2xl relative overflow-hidden group">
                              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2 relative z-10">Target Pages</p>
                              <p className="text-5xl font-bold text-white relative z-10 tracking-tighter">
                                {userPolicy.requiredPagesPerDay}
                                <span className="text-sm text-slate-500 font-bold ml-3 uppercase tracking-normal">Pages / Day</span>
                              </p>
                              <Flame size={80} className="absolute -bottom-4 -right-4 text-white/5 group-hover:text-blue-500/10 transition-colors duration-700 -rotate-12" />
                           </div>
                           
                           <div className="bg-blue-600 rounded-3xl p-7 shadow-xl shadow-blue-600/20 relative overflow-hidden group border border-white/10">
                              <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-2 relative z-10">Submission Quota</p>
                              <p className="text-5xl font-bold text-white relative z-10 tracking-tighter">
                                {userPolicy.requiredPagesPerDay * userPolicy.clipsPerPageInLog}
                                <span className="text-sm text-white/50 font-bold ml-3 uppercase tracking-normal">Clips / Day</span>
                              </p>
                              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full" />
                              <ShieldCheck size={80} className="absolute -bottom-4 -right-4 text-white/5 group-hover:text-white/10 transition-colors duration-700" />
                           </div>
                        </div>
                    )}
                 </div>

                 {/* Action/Help Card inside content */}
                 <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 flex items-center justify-between gap-8 mt-20">
                    <div className="space-y-2">
                       <h4 className="text-lg font-bold text-slate-800 tracking-tight">Need help with this rule?</h4>
                       <p className="text-sm text-slate-500 font-medium font-noto max-w-md">
                         หากคุณมีข้อสงสัยเกี่ยวกับรายละเอียดของหัวข้อนี้ โปรดติดต่อแผนกบุคคลผ่านช่องทางแชทพนักงาน
                       </p>
                    </div>
                    <button className="h-14 px-8 bg-white border border-slate-200 text-slate-800 rounded-2xl text-xs font-bold uppercase tracking-widest hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm shrink-0 flex items-center gap-2">
                       Contact Support <ArrowRight size={16} />
                    </button>
                 </div>
              </div>
           ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4">
                 <FileText size={64} className="opacity-20" />
                 <p className="font-bold uppercase tracking-widest text-xs">Waiting for selection...</p>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};
