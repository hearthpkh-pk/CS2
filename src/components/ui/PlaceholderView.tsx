import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PlaceholderViewProps {
  title: string;
  icon: LucideIcon;
  description: string;
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({ title, icon: Icon, description }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 animate-in fade-in zoom-in duration-500">
      <div className="p-8 bg-white/50 rounded-[3rem] border border-dashed border-slate-200 mb-6 group hover:border-slate-300 transition-colors">
        <Icon size={64} className="opacity-20 group-hover:opacity-40 transition-opacity" />
      </div>
      <h3 className="text-xl font-bold text-slate-600 font-outfit uppercase tracking-tight">{title}</h3>
      <p className="text-sm font-medium mt-2">{description}</p>
      
      <div className="mt-12 flex gap-1.5 h-1.5">
        <div className="w-8 h-full bg-slate-200 rounded-full"></div>
        <div className="w-1.5 h-full bg-slate-100 rounded-full"></div>
        <div className="w-1.5 h-full bg-slate-100 rounded-full"></div>
      </div>
    </div>
  );
};
