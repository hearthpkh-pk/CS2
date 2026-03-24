import React from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { Page } from '@/types';

interface ActivePagesSectionProps {
  pages: Page[];
  selectedPage: string;
}

export const ActivePagesSection: React.FC<ActivePagesSectionProps> = ({ pages, selectedPage }) => {
  return (
    <div className="mt-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-primary-navy font-outfit uppercase tracking-wider">Active Pages (Smart Insights)</h3>
          <p className="text-xs text-slate-400 font-noto mt-1 uppercase tracking-widest px-1">เรียลไทม์ข้อมูลจาก Facebook Page ของคุณ</p>
        </div>
        <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-2">
          <Activity size={14} /> Smart Sync Active
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-3 md:gap-4">
        {pages
          .filter(p => p.status === 'Active' && (selectedPage === 'all' || p.id === selectedPage))
          .sort((a, b) => (Number(a.boxId) || 0) - (Number(b.boxId) || 0))
          .map((page, idx) => (
            <a
              key={page.id}
              href={page.facebookUrl || page.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-[1.25rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group relative overflow-hidden flex flex-col min-h-[300px] cursor-pointer"
            >
              {!page.facebookData ? (
                <>
                  {/* Top Image Section - Subtle Gray */}
                  <div className="relative h-36 w-full bg-slate-50 border-b border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                    {/* Index Number */}
                    <div className="absolute top-4 left-4 flex items-center justify-center w-5 h-5 rounded-full bg-black/5 border border-black/5 z-10">
                      <span className="text-[9px] font-bold text-slate-400">{idx + 1}</span>
                    </div>

                    <Activity className="text-slate-200 w-12 h-12" />
                  </div>

                  {/* Content Section (Centered) */}
                  <div className="p-5 flex-1 flex flex-col justify-between text-center">
                    <div className="flex flex-col items-center">
                      <h3 className="font-bold text-slate-800 text-[13px] leading-tight group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                        {page.name}
                      </h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                        กำลังรอข้อมูล...
                      </p>
                      
                      <p className="text-[10px] text-slate-400 line-clamp-2 font-noto italic leading-relaxed px-2">
                        ระบบกำลังรออัปเดตข้อมูลอัตโนมัติจาก Worker
                      </p>
                    </div>

                    {/* Footer Last Sync */}
                    <div className="mt-4 pt-3 border-t border-slate-50 w-full flex items-center justify-center">
                      <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1">
                        <RefreshCw size={8} /> Pending Sync
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Top Image Section */}
                  <div className="relative h-36 w-full bg-slate-100 overflow-hidden shrink-0">
                    {/* Index Number */}
                    <div className="absolute top-4 left-4 flex items-center justify-center w-5 h-5 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 z-10">
                      <span className="text-[9px] font-bold text-white/90">{idx + 1}</span>
                    </div>

                    <img
                      src={page.facebookData.profilePic || 'https://images.unsplash.com/photo-1614850523598-92751cd01d1d?w=400&q=80'}
                      alt={page.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-[8px] font-bold text-slate-800 uppercase tracking-widest">Active</span>
                    </div>
                  </div>

                  {/* Content Section (Centered) */}
                  <div className="p-5 flex-1 flex flex-col justify-between text-center">
                    <div className="flex flex-col items-center">
                      <h3 className="font-bold text-slate-900 text-[13px] leading-tight group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                        {page.name}
                      </h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                        <span className="text-blue-600">{page.facebookData.followers?.toLocaleString() || '---'}</span> Followers
                      </p>
                      
                      <p className="text-[10px] text-slate-500 line-clamp-2 font-noto italic leading-relaxed px-2">
                        {page.facebookData.description || 'ไม่มีคำอธิบายเพจ กรุณาอัปเดตข้อมูล'}
                      </p>
                    </div>

                    {/* Footer Last Sync */}
                    <div className="mt-4 pt-3 border-t border-slate-50 w-full flex items-center justify-center">
                      <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1">
                        <RefreshCw size={8} /> 
                        {page.facebookData.lastSyncAt ? `อัปเดต ${new Date(page.facebookData.lastSyncAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}` : 'Not synced'}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </a>
          ))}
      </div>
    </div>
  );
};
