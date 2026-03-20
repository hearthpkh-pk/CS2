'use client';

import React, { useMemo } from 'react';
import { Users, Eye, Filter, Calendar, Activity, RefreshCw } from 'lucide-react';
import { Page, DailyLog, User } from '@/types';
import { CombinedAreaChart } from './CombinedAreaChart';

interface Props {
  pages: Page[];
  logs: DailyLog[];
  selectedPage: string;
  setSelectedPage: (id: string) => void;
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
  selectedYear: string;
  setSelectedYear: (y: string) => void;
  onNavigateToTask: () => void;
  currentUser: User;
  onSyncPage?: (id: string, url: string) => void;
}

const thaiMonths = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

export const DashboardView = ({
  pages, logs, selectedPage, setSelectedPage,
  selectedMonth, setSelectedMonth, selectedYear, setSelectedYear,
  onNavigateToTask, currentUser, onSyncPage
}: Props) => {

  const chartData = useMemo(() => {
    const relevantPages = selectedPage === 'all' ? pages : pages.filter(p => p.id === selectedPage);
    const relevantPageIds = relevantPages.map(p => p.id);

    let filteredLogs = logs.filter(l => {
      const inPages = relevantPageIds.includes(l.pageId);
      const lDate = new Date(l.date);
      const inYear = lDate.getFullYear().toString() === selectedYear;
      const inMonth = selectedMonth === 'all' ? true : (lDate.getMonth() + 1).toString().padStart(2, '0') === selectedMonth;
      return inPages && inYear && inMonth;
    });

    filteredLogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const grouped: Record<string, { date: string; views: number; followersSum: number }> = {};
    filteredLogs.forEach(log => {
      if (!grouped[log.date]) grouped[log.date] = { date: log.date, views: 0, followersSum: 0 };
      grouped[log.date].views += Number(log.views);
      grouped[log.date].followersSum += Number(log.followers);
    });

    return Object.values(grouped).map(g => ({
      date: g.date,
      views: g.views,
      followers: selectedPage === 'all' ? Math.floor(g.followersSum / Math.max(relevantPageIds.length, 1)) : g.followersSum
    }));
  }, [pages, logs, selectedPage, selectedMonth, selectedYear]);

  const totals = useMemo(() => {
    let currentViews = 0;
    let currentFollowers = chartData.length > 0 ? chartData[chartData.length - 1].followers : 0;
    chartData.forEach(d => currentViews += d.views);
    const prevViews = Math.floor(currentViews * 0.85);
    return { views: currentViews, prevViews, followers: currentFollowers };
  }, [chartData]);

  const showSubmissionPrompt = currentUser.role === 'Staff' || currentUser.role === 'Admin';

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-primary-navy font-outfit uppercase tracking-tight">Dashboard</h2>
          <p className="text-slate-400 font-noto text-sm mt-1">ภาพรวมการเติบโตและสถิติสะสมของคุณ</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-5 py-2.5 shadow-sm">
            <Filter size={18} className="text-slate-300" />
            <select value={selectedPage} onChange={e => setSelectedPage(e.target.value)} className="bg-transparent text-slate-700 text-sm font-semibold font-noto outline-none min-w-[150px]">
              <option value="all">ทุกเพจพร้อมกัน</option>
              {pages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-5 py-2.5 shadow-sm">
            <Calendar size={18} className="text-slate-300" />
            <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="bg-transparent text-slate-700 text-sm font-semibold font-noto outline-none">
              <option value="all">ทุกเดือน</option>
              {thaiMonths.map((m, i) => <option key={i} value={(i + 1).toString().padStart(2, '0')}>{m}</option>)}
            </select>
            <div className="w-px h-4 bg-slate-100"></div>
            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="bg-transparent text-slate-700 text-sm font-semibold font-noto outline-none">
              <option value="2024">2567</option>
              <option value="2025">2568</option>
              <option value="2026">2569</option>
            </select>
          </div>
        </div>
      </div>

      {showSubmissionPrompt && (
        <div className="mb-10 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-100 relative overflow-hidden group cursor-pointer" onClick={onNavigateToTask}>
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
             <Eye size={120} className="rotate-12 -mr-10 -mt-10" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                 🔥 Goal: 40 Clips / Day
              </div>
              <h3 className="text-2xl font-black font-outfit uppercase tracking-tight">คุณยังไม่ได้ส่งงานของวันนี้หรือเปล่า?</h3>
              <p className="text-blue-100/70 text-sm font-noto mt-1">คลิกที่นี่เพื่อไปที่หน้าส่งคลิปงาน 40 ลิงก์ (10 เพจ) เพื่อรักษาสถิติการทำงานของคุณ</p>
            </div>
            <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all shadow-lg">
              ไปที่หน้าส่งงาน
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-slate-200">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <Users className="text-primary-navy" size={26} />
            </div>
            <div className="px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider font-inter">+{((totals.followers / Math.max(totals.followers * 0.9, 1)) * 10 - 10).toFixed(1)}%</span>
            </div>
          </div>
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.15em] font-noto mb-2">Total Followers</p>
          <h3 className="text-4xl font-bold text-primary-navy font-inter tracking-tight">
            {totals.followers.toLocaleString()}
          </h3>
        </div>

        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-slate-200">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <Eye className="text-primary-navy" size={26} />
            </div>
            <div className="px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                +{((totals.views - totals.prevViews) / Math.max(totals.prevViews, 1) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.15em] font-noto mb-2">Total Views Performance</p>
          <h3 className="text-4xl font-bold text-primary-navy font-inter tracking-tight">
            {totals.views.toLocaleString()}
          </h3>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h3 className="text-xl font-bold text-primary-navy font-outfit uppercase tracking-wider">Growth Performance</h3>
            <p className="text-xs text-slate-400 font-noto mt-1 uppercase tracking-widest">Statistical Trend Analysis</p>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-[#facc15] shadow-[0_0_12px_rgba(250,204,21,0.5)]"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] font-noto">ผู้ติดตาม</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-slate-300"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] font-noto">ยอดการรับชม</span>
            </div>
          </div>
        </div>
        <CombinedAreaChart data={chartData} />
      </div>

      {/* Active Pages (Smart Insights) */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {pages
             .filter(p => p.status === 'Active' && (selectedPage === 'all' || p.id === selectedPage))
             .sort((a, b) => (Number(a.boxId) || 0) - (Number(b.boxId) || 0))
             .map(page => (
               <a 
                 key={page.id} 
                 href={page.facebookUrl} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group relative overflow-hidden flex flex-col min-h-[250px] cursor-pointer"
               >
                 {!page.facebookData ? (
                   <div className="flex-1 flex flex-col justify-center items-center text-center p-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 border-dashed">
                         <Activity className="text-slate-300 animate-pulse" size={24} />
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm font-noto mb-1 truncate w-full">{page.name}</h4>
                      <p className="text-[10px] text-slate-400 font-noto mb-6 lowercase tracking-tight">Waiting for smart sync...</p>
                      
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onSyncPage?.(page.id, page.facebookUrl || `https://facebook.com/${page.id}`);
                        }}
                        className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-100 transition-all"
                      >
                         Sync Now
                      </button>
                   </div>
                 ) : (
                   <>
                     <div className="flex items-start justify-between mb-4">
                        <div className="relative">
                           <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-50 group-hover:border-blue-100 transition-colors">
                              <img 
                                src={page.facebookData.profilePic || 'https://images.unsplash.com/photo-1614850523598-92751cd01d1d?w=400&q=80'} 
                                alt={page.name} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                              />
                           </div>
                           <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white shadow-sm shadow-emerald-200"></div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <button 
                             onClick={(e) => {
                               e.preventDefault();
                               e.stopPropagation();
                               onSyncPage?.(page.id, page.facebookUrl || '');
                             }}
                             className="p-1.5 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-100"
                             title="Refresh Metadata"
                           >
                             <RefreshCw size={12} className="hover:rotate-180 transition-transform duration-500" />
                           </button>
                           <div className="text-right">
                              <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest block mb-1">Followers</span>
                              <span className="text-sm font-black text-slate-800 font-inter tracking-tight">
                                 {page.facebookData.followers?.toLocaleString() || '---'}
                              </span>
                           </div>
                        </div>
                     </div>

                     <div className="mb-4 flex-1">
                        <h3 className="font-bold text-slate-900 text-base leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">{page.name}</h3>
                        <p className="text-[10px] text-slate-500 line-clamp-2 mt-2 font-inter italic leading-relaxed">
                           {page.facebookData.description || 'ดึงข้อมูลจากระบบ Facebook โดยตรงเพื่อวิเคราะห์ประสิทธิภาพ'}
                        </p>
                     </div>

                     <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                           <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Live Status</span>
                        </div>
                        <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
                          {page.facebookData.lastSyncAt ? `Sync ${new Date(page.facebookData.lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Not synced'}
                        </span>
                     </div>
                   </>
                 )}
               </a>
             ))}
        </div>
      </div>
    </div>
  );
};
