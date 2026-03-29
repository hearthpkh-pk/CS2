import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PolicyConfiguration } from '@/types';
import { CommissionCalculator } from './CommissionCalculator';

interface RuleContentRendererProps {
   content: string;
   ruleId: string;
   settings: PolicyConfiguration;
}

export const RuleContentRenderer = ({ content, ruleId, settings }: RuleContentRendererProps) => {
   const lines = content.split('\n').filter(l => l.trim().length > 0);

   // COMMISSION SPECIAL RENDERER
   if (ruleId === 'rule-commission' || content.toLowerCase().includes('commission') || content.includes('ค่าคอม')) {
      return <CommissionCalculator settings={settings} />;
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
