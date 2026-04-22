import React, { memo } from 'react';
import { Page } from '@/types';
import { CheckCircle2, Link as LinkIcon, Trash2, Video, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VirtualTableProps {
  pages: Page[];
  policy: any;
  submissionData: Record<string, string[]>;
  currentInputs: Record<string, string>;
  onAddLink: (pageId: string) => void;
  onRemoveLink: (pageId: string, index: number) => void;
  onInputChange: (pageId: string, value: string) => void;
}

interface RowProps {
  index: number;
  page: Page;
  policy: any;
  links: string[];
  currentVal: string;
  onAddLink: (pageId: string) => void;
  onRemoveLink: (pageId: string, index: number) => void;
  onInputChange: (pageId: string, value: string) => void;
}

const Row = memo(({ index, page, policy, links, currentVal, onAddLink, onRemoveLink, onInputChange }: RowProps) => {
  return (
    <div className="flex items-stretch border-b border-slate-100 group hover:bg-blue-50/30 transition-colors">
      <div className="p-4 pl-6 w-[100px] shrink-0 sticky left-0 z-10 bg-white group-hover:bg-blue-50/50 transition-colors shadow-[2px_0_10px_rgba(0,0,0,0.02)] border-r border-slate-50 flex items-center justify-center">
        <span className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 uppercase tracking-widest shadow-sm">
          {page.boxId || '-'}
        </span>
      </div>

      <div className="p-4 w-[200px] shrink-0 flex items-center">
        <div>
          {(page.facebookUrl || page.url) ? (
            <a href={page.facebookUrl || page.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline font-noto truncate max-w-[170px] block" title={page.name}>
              {page.name}
            </a>
          ) : (
            <p className="text-sm font-bold text-slate-900 font-noto truncate max-w-[170px]" title={page.name}>
              {page.name}
            </p>
          )}
          <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">Asset #{index + 1}</p>
        </div>
      </div>

      <div className="p-4 w-[120px] shrink-0 flex items-center justify-center gap-2">
        {links.length >= policy.clipsPerPageInLog ? (
          <CheckCircle2 className="text-emerald-500" size={16} strokeWidth={2.5} />
        ) : (
          <div className="w-4 h-4 rounded-full border-2 border-slate-200" />
        )}
        <p className="text-[10px] font-bold text-slate-400 whitespace-nowrap tabular-nums">
          {links.length} / {policy.clipsPerPageInLog}
        </p>
      </div>

      <div className="p-4 flex-1 min-w-[300px] flex items-center">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 w-full">
          {/* Input field is always shown to allow unlimited links */}
          <div className="flex items-center gap-2 shrink-0 relative min-w-[200px]">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
              <LinkIcon size={12} />
            </div>
            <input
              type="text"
              placeholder="วางลิงก์ผลงาน..."
              className="h-8 pl-8 pr-12 text-[11px] font-noto bg-slate-50 border border-slate-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[var(--primary-theme)]/20 focus:border-[var(--primary-theme)] focus:bg-white transition-all text-slate-700 shadow-sm"
              value={currentVal}
              onChange={(e) => onInputChange(page.id, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onAddLink(page.id);
                }
              }}
            />
            <button
              onClick={() => onAddLink(page.id)}
              disabled={!currentVal.trim()}
              className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-[var(--primary-theme)] hover:bg-[var(--primary-theme)] hover:text-white hover:border-[var(--primary-theme)] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title="Add Link"
            >
              <Plus size={14} strokeWidth={2.5} />
            </button>
          </div>

          {links.map((link: string, linkIdx: number) => {
            const href = link.startsWith('http') ? link : `https://${link}`;
            return (
              <div
                key={linkIdx}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg shrink-0 max-w-[160px] group/link shadow-sm"
                title={link}
              >
                <Video size={12} className="text-[var(--primary-theme)] shrink-0" />
                <a 
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[11px] font-medium text-slate-700 hover:text-blue-600 hover:underline truncate"
                >
                  {link}
                </a>
                <button
                  onClick={() => onRemoveLink(page.id, linkIdx)}
                  className="ml-1 text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-md transition-colors opacity-0 group-hover/link:opacity-100 shrink-0"
                  title="Remove Link"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.currentVal === nextProps.currentVal &&
    prevProps.links === nextProps.links &&
    prevProps.policy === nextProps.policy &&
    prevProps.page === nextProps.page
  );
});

Row.displayName = 'Row';

export const VirtualTable: React.FC<VirtualTableProps> = ({
  pages,
  policy,
  submissionData,
  currentInputs,
  onAddLink,
  onRemoveLink,
  onInputChange
}) => {
  return (
    <div className="w-full flex flex-col">
      {pages.map((page, index) => {
        const links = (submissionData[page.id] || []).filter((l: string) => l.trim() !== '');
        const currentVal = currentInputs[page.id] || '';
        
        return (
          <Row 
            key={page.id} 
            index={index} 
            page={page}
            policy={policy}
            links={links}
            currentVal={currentVal}
            onAddLink={onAddLink}
            onRemoveLink={onRemoveLink}
            onInputChange={onInputChange}
          />
        );
      })}
    </div>
  );
};
