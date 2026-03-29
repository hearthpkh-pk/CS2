import React, { useState } from 'react';
import { Calculator, Target, TrendingUp, Trophy, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PolicyConfiguration } from '@/types';

interface CommissionCalculatorProps {
   settings: PolicyConfiguration;
}

// COMMISSION CALCULATOR COMPONENT - REFINED UX (Compact, Motivation-Oriented Matrix)
export const CommissionCalculator = ({ settings }: CommissionCalculatorProps) => {
   const [views, setViews] = useState(10);
   const [isAnimating, setIsAnimating] = useState(false);

   // Convert views (millions) to absolute numbers for comparison if needed, 
   // but keeping millions logic for ease of UI.
   
   // Calculation Logic Based on Dynamic Settings
   const calculateCommission = (v: number) => {
      const minTargetM = (settings.minViewTarget || 10000000) / 1000000;
      const superThresholdM = (settings.superBonusThreshold || 100000000) / 1000000;
      const step1Rate = settings.bonusStep1 || 1000;
      const step2Rate = settings.bonusStep2 || 1500;
      
      // 1. Penalty Check
      if (v < minTargetM) return -(settings.penaltyAmount || 2000);
      
      // 2. Milestone Logic (Every 10M)
      const currentMilestoneM = Math.floor(v / 10) * 10;
      
      // 3. Threshold Check: Commission only active for milestones > Target
      if (currentMilestoneM <= minTargetM) return 0;
      
      // 4. Rate Application
      const rate = v >= superThresholdM ? step2Rate : step1Rate;
      return (currentMilestoneM / 10) * rate;
   };

   const comm = calculateCommission(views);
   const minTargetM = (settings.minViewTarget || 10000000) / 1000000;
   const superThresholdM = (settings.superBonusThreshold || 100000000) / 1000000;
   const step1Rate = settings.bonusStep1 || 1000;
   const step2Rate = settings.bonusStep2 || 1500;
   
   const isSuperBonus = views >= superThresholdM;
   const isPenalty = views < minTargetM;

   return (
      <div className="flex flex-col space-y-5 animate-in fade-in duration-500 max-w-2xl font-noto mx-auto w-full">
         
         {/* INPUT SECTION & PROJECTED RETURN */}
         <div className="rounded-3xl border border-slate-200 p-6 flex flex-col space-y-5 transition-all hover:border-slate-300 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
               <div className="flex items-center gap-2">
                  <Calculator size={16} className="text-[#0a192f]" />
                  <h4 className="font-outfit text-xs font-semibold text-[#0a192f] uppercase tracking-widest leading-none">
                     Commission Simulator
                  </h4>
               </div>
               <div className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-full bg-slate-50">
                  <Target size={12} className="text-slate-500" />
                  <span className="font-outfit text-[9px] font-bold text-slate-600 uppercase tracking-widest leading-none">
                     Target: {minTargetM}M
                  </span>
               </div>
            </div>

            <div className="flex flex-col space-y-5">
               <div className="flex justify-between items-end">
                  <span className="font-outfit text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                     Total Views (Millions)
                  </span>
                  <div className="flex items-baseline gap-1">
                     <span className={cn(
                        "font-inter text-2xl font-bold tracking-tighter tabular-nums leading-none",
                        isSuperBonus ? "text-blue-600" : isPenalty ? "text-rose-600" : "text-[#0a192f]"
                     )}>
                        {views}
                     </span>
                     <span className="font-outfit text-[11px] font-bold text-slate-400 uppercase tracking-widest">M</span>
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
                        setTimeout(() => setIsAnimating(false), 300);
                     }}
                     className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-[#0a192f] transition-all hover:h-2"
                  />
               </div>

               <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <span className="font-outfit text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                     Projected Return
                  </span>
                  <div className={cn(
                     "font-inter text-3xl font-bold tracking-tighter tabular-nums transition-transform duration-300 leading-none flex items-baseline gap-1.5",
                     isPenalty ? "text-rose-600" : isSuperBonus ? "text-blue-600" : "text-emerald-600",
                     isAnimating && "scale-[1.02]"
                  )}>
                     {comm > 0 ? '+' : ''}{comm.toLocaleString()}
                     <span className="font-outfit text-[12px] font-semibold text-slate-400 uppercase tracking-widest">THB</span>
                  </div>
               </div>
            </div>
         </div>

         {/* OPERATIONAL MATRIX (TIERS) */}
         <div className="rounded-3xl border border-slate-200 overflow-hidden flex flex-col shadow-sm bg-white">
            <div className="bg-slate-50/80 border-b border-slate-100 p-3.5 px-5 flex items-center justify-between">
               <h3 className="font-outfit text-[10px] font-semibold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp size={14} className="text-slate-500" />
                  Operational Tiers Matrix
               </h3>
            </div>
            
            <div className="flex flex-col divide-y divide-slate-100 font-prompt">
               {/* PENALTY */}
               <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3.5 gap-2 transition-colors">
                  <span className="text-[11px] font-semibold text-rose-500 uppercase tracking-wide">
                     {"< "}{minTargetM}M Views
                  </span>
                  <span className="font-inter text-[12px] font-bold text-rose-600 tabular-nums">
                     -{settings.penaltyAmount?.toLocaleString() || '2,000'} THB 
                     <span className="text-[10px] ml-1.5 text-rose-400 font-medium uppercase tracking-widest inline-block">(Penalty)</span>
                  </span>
               </div>

               {/* BASE / TARGET RANGE */}
               <div className={cn(
                  "flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3.5 gap-2 transition-colors duration-300",
                  comm === 0 && !isPenalty ? "bg-slate-50" : ""
               )}>
                  <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                     {minTargetM}M - {Math.floor(minTargetM / 10 + 1) * 10 - 0.1}M Views
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 tabular-nums uppercase tracking-widest">
                     Normal Salary
                  </span>
               </div>

               {/* STEPPED BONUS EXAMPLES */}
               {(() => {
                  const firstMilestone = Math.floor(minTargetM / 10 + 1) * 10;
                  return [firstMilestone, firstMilestone + 10].map((tier) => (
                     <div key={tier} className={cn(
                        "flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3.5 gap-2 transition-colors duration-300",
                        views >= tier && views < tier + 10 && !isSuperBonus ? "bg-slate-50" : ""
                     )}>
                        <span className={cn(
                           "text-[11px] font-semibold uppercase tracking-wide",
                           views >= tier && views < tier + 10 && !isSuperBonus ? "text-[#0a192f]" : "text-slate-600"
                        )}>
                           {"≥ "}{tier}M Views
                        </span>
                        <span className={cn(
                           "font-inter text-[12px] font-bold tabular-nums",
                           views >= tier && views < tier + 10 && !isSuperBonus ? "text-emerald-600" : "text-slate-400"
                        )}>
                           +{(Math.floor(tier / 10) * step1Rate).toLocaleString()} THB
                        </span>
                     </div>
                  ));
               })()}

               {/* PROGRESSIVE RULE */}
               <div className="px-5 py-2 bg-slate-50/30">
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest">
                     * เพิ่มโบนัส +{step1Rate.toLocaleString()} ทุกๆ 10M ถัดไปจนถึง {superThresholdM}M
                  </p>
               </div>

               {/* SUPER BONUS TIER */}
               <div className={cn(
                  "flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 gap-3 transition-opacity duration-500 relative overflow-hidden",
                  isSuperBonus 
                     ? "bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 text-white" 
                     : "bg-slate-50/40"
               )}>
                  <div className="flex flex-col gap-1 relative z-10">
                     <div className="flex items-center gap-1.5">
                        <Trophy size={14} className={isSuperBonus ? "text-yellow-400" : "text-slate-400"} />
                        <span className={cn(
                           "font-outfit text-[11px] font-bold uppercase tracking-widest",
                           isSuperBonus ? "text-white" : "text-slate-700"
                        )}>
                           Super Bonus Threshold
                        </span>
                     </div>
                     <span className={cn(
                        "text-[10px] font-medium",
                        isSuperBonus ? "text-blue-100" : "text-slate-400"
                     )}>
                        เรทพิเศษ {step2Rate.toLocaleString()} บาท / 10M ตั้งแต่ {superThresholdM}M เป็นต้นไป
                     </span>
                  </div>
                  <span className={cn(
                     "font-inter text-[14px] font-bold tabular-nums relative z-10 flex items-center gap-1.5",
                     isSuperBonus ? "text-white" : "text-slate-500"
                  )}>
                     {isSuperBonus ? `+${comm.toLocaleString()} THB` : `+${(superThresholdM / 10 * step2Rate).toLocaleString()} THB MIN`}
                  </span>
               </div>
            </div>
         </div>

         {/* AUDIT ADVISORY */}
         <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/80 flex items-start gap-2.5">
            <AlertTriangle size={15} className="text-slate-400 shrink-0 mt-0.5" />
            <p className="font-noto text-[10px] text-slate-500 leading-relaxed uppercase tracking-wide">
               <span className="font-semibold text-slate-700">Audit Rule:</span> เงื่อนไขยอดวิว หากไม่ถึงเกณฑ์พ้นสภาพรับเงินเดือนพื้นฐาน และไม่มีข้อยกเว้นกรณีการลาทุกประเภท
            </p>
         </div>
      </div>
   );
};
