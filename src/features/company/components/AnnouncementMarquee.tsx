'use client';

import React from 'react';
import { useCompanyConfig } from '../hooks/useCompanyConfig';
import { User } from '@/types';
import { cn } from '@/lib/utils';
import { AlertCircle, BellRing, Info } from 'lucide-react';

interface AnnouncementMarqueeProps {
  currentUser: User;
}

export const AnnouncementMarquee: React.FC<AnnouncementMarqueeProps> = ({ currentUser }) => {
  const { getActiveAnnouncements } = useCompanyConfig();
  const activeAnnouncements = getActiveAnnouncements(currentUser);

  if (activeAnnouncements.length === 0) return null;

  // Determine highest alert level
  const hasCritical = activeAnnouncements.some(a => a.type === 'critical');
  const hasWarning = activeAnnouncements.some(a => a.type === 'warning');

  const barStyles = cn(
    "sticky top-0 left-0 right-0 z-[100] h-9 flex items-center overflow-hidden border-b pointer-events-auto select-none font-prompt transition-all duration-700 shadow-xl border-white/10",
    hasCritical ? "bg-rose-600" : 
    hasWarning ? "bg-amber-500" : 
    "bg-[#054ab3]"
  );

  return (
    <div className={barStyles}>
      <div className={cn(
        "absolute left-0 top-0 bottom-0 px-4 z-10 flex items-center gap-2 border-r border-white/10 pointer-events-none",
        hasCritical ? "bg-rose-600" : 
        hasWarning ? "bg-amber-500" : 
        "bg-[#054ab3]"
      )}>
        <div className={cn(
          "w-2 h-2 rounded-full animate-pulse",
          hasCritical ? "bg-white" : hasWarning ? "bg-amber-200" : "bg-blue-200"
        )} />
        <span className="text-[10px] font-semibold text-white/70 uppercase tracking-widest whitespace-nowrap">Official Broadcaster</span>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="animate-marquee inline-flex items-center gap-[10vw]">
          {activeAnnouncements.map((ann, idx) => (
            <div key={ann.id} className="flex items-center gap-2.5 py-1">
               <div className="flex items-center justify-center text-white/80">
                 {ann.type === 'critical' ? <AlertCircle size={18} strokeWidth={2} /> :
                  ann.type === 'warning' ? <BellRing size={18} strokeWidth={2} /> : 
                  <Info size={18} strokeWidth={2} />}
               </div>
               <span className="text-sm font-medium text-white/90 tracking-wide">
                 {ann.message}
               </span>
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {activeAnnouncements.map((ann) => (
            <div key={`${ann.id}-dup`} className="flex items-center gap-2.5 py-1">
               <span className="text-sm font-medium text-white/90 tracking-wide">
                 {ann.message}
               </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
