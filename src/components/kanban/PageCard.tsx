'use client';

import React from 'react';
import { Trash2, ExternalLink, Shield } from 'lucide-react';
import { Page } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PageCardProps {
  page: Page;
  onEdit: (page: Page) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

export const PageCard = ({
  page,
  onEdit,
  onDelete,
  onDragStart
}: PageCardProps) => {
  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, page.id)}
      onClick={() => onEdit(page)}
      className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 cursor-grab active:cursor-grabbing hover:border-[var(--primary-blue)] hover:shadow-md transition-all group relative"
    >
      <div className="flex justify-between items-start mb-2">
        <div className={cn(
          "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-inter",
          page.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 
          page.status === 'Rest' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
        )}>
          {page.status}
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(page.id); }}
          className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={14} />
        </button>
      </div>
      
      <h4 className="font-bold text-slate-800 text-sm font-noto truncate mb-1">{page.name}</h4>
      <p className="text-[10px] text-slate-400 font-noto">{page.category}</p>
      
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
        <div className="flex items-center gap-2">
          {page.url && (
            <a 
              href={page.url} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[9px] text-[var(--primary-blue)] flex items-center gap-1 hover:underline font-bold"
            >
              <ExternalLink size={10} /> Link
            </a>
          )}
        </div>
        
        {page.adminIds && page.adminIds.length > 0 && (
          <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 rounded-full border border-indigo-100/50">
             <Shield size={10} className="text-indigo-600" />
             <span className="text-[10px] font-bold text-indigo-600 font-inter">{page.adminIds.length}</span>
          </div>
        )}
      </div>
    </div>
  );
};
