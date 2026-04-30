'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { User, DailyLog, Page, PolicyConfiguration, Role } from '@/types';
import { 
  Calendar, CheckCircle, ExternalLink, Activity, Users, 
  FileText, Link as LinkIcon, Search, ChevronRight, X, AlertCircle, Briefcase,
  ChevronLeft, Pin, AlertTriangle, MessageSquare, Send, BookOpen,
  ShieldCheck, ShieldAlert, ShieldQuestion
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO, subDays, addDays } from 'date-fns';
import { createPortal } from 'react-dom';
import { validateSubmittedLink, validateAllLinks, type LinkValidationStatus } from '@/utils/linkValidator';

interface ReportsViewProps {
  currentUser: User;
  policy: PolicyConfiguration;
  users: User[];
  logs: DailyLog[];
  pages: Page[];
}

export const ReportsView = ({ currentUser, policy, users, logs, pages }: ReportsViewProps) => {
  // 1. State
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // New Features State
  const [pinnedUsers, setPinnedUsers] = useState<string[]>([]);
  const [activeDepartmentFilter, setActiveDepartmentFilter] = useState<string>('All');
  const [activeBrandFilter, setActiveBrandFilter] = useState<string>('All');
  
  // Private Notes State (mock saving to local state for demo, in real app save to DB)
  const [privateNotes, setPrivateNotes] = useState<Record<string, string>>({});
  const [editingNoteForId, setEditingNoteForId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState('');

  // Issue Reporting Modal State
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [issueTargetPage, setIssueTargetPage] = useState<Page | null>(null);
  const [issueType, setIssueType] = useState<'Flag' | 'Note' | 'Warning'>('Warning');
  const [issueMessage, setIssueMessage] = useState('');
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);

  // 2. Data Processing for Selected Date
  const logsForDate = useMemo(() => {
    return logs.filter(log => log.date.startsWith(selectedDate));
  }, [logs, selectedDate]);

  const activeStaffIds = Array.from(new Set(logsForDate.map(l => l.staffId)));
  
  // Aggregate stats per user
  const userStats = useMemo(() => {
    const stats: Record<string, { totalPages: number, totalLinks: number, logs: DailyLog[] }> = {};
    
    logsForDate.forEach(log => {
      if (!stats[log.staffId]) {
        stats[log.staffId] = { totalPages: 0, totalLinks: 0, logs: [] };
      }
      stats[log.staffId].logs.push(log);
      
      const validLinks = log.links?.filter(l => l && l.trim().length > 0) || [];
      const linksCount = validLinks.length > 0 ? validLinks.length : Number(log.clipsCount || 0);
      
      // นับเฉพาะเพจที่มีลิงก์จริงๆ (ไม่นับ empty payload)
      if (linksCount > 0) {
        stats[log.staffId].totalPages += 1;
      }
      stats[log.staffId].totalLinks += linksCount;
    });

    return stats;
  }, [logsForDate]);

  // Extract unique departments/brands from users
  const uniqueDepartments = useMemo(() => {
    const deps = new Set<string>();
    users.forEach(u => {
      if (u.role !== Role.SuperAdmin && u.role !== Role.Developer && u.department) {
        deps.add(u.department);
      }
    });
    return ['All', ...Array.from(deps).sort()];
  }, [users]);

  const uniqueBrands = useMemo(() => {
    const brands = new Set<string>();
    users.forEach(u => {
      if (u.role !== Role.SuperAdmin && u.role !== Role.Developer && u.brand) {
        brands.add(u.brand);
      }
    });
    return ['All', ...Array.from(brands).sort()];
  }, [users]);

  // Filter and Sort Users
  const displayUsers = useMemo(() => {
    return users.filter(u => 
      u.role !== Role.SuperAdmin && 
      u.role !== Role.Developer &&
      (searchTerm === '' || u.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (activeDepartmentFilter === 'All' || u.department === activeDepartmentFilter) &&
      (activeBrandFilter === 'All' || u.brand === activeBrandFilter)
    ).sort((a, b) => {
      // 1. Pinned users first
      const aPinned = pinnedUsers.includes(a.id);
      const bPinned = pinnedUsers.includes(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;

      // 2. Submission Status (Submitted first)
      const aStats = userStats[a.id];
      const bStats = userStats[b.id];
      if (aStats && !bStats) return -1;
      if (!aStats && bStats) return 1;

      // 3. Alphabetical
      return a.name.localeCompare(b.name);
    });
  }, [users, searchTerm, activeDepartmentFilter, activeBrandFilter, pinnedUsers, userStats]);

  const totalDailyLinks = Object.values(userStats).reduce((sum, s) => sum + s.totalLinks, 0);
  const totalDailyPages = Object.values(userStats).reduce((sum, s) => sum + s.totalPages, 0);
  const submittedStaffCount = activeStaffIds.length;
  const totalActivePages = pages.filter(p => p.status === 'Active' && !p.isDeleted).length;

  // Handlers
  const togglePin = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    setPinnedUsers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleDateChange = (days: number) => {
    const current = parseISO(selectedDate);
    const newDate = addDays(current, days);
    setSelectedDate(format(newDate, 'yyyy-MM-dd'));
  };

  const handleIssueSubmit = () => {
    setIsSubmittingIssue(true);
    setTimeout(() => {
      setIsSubmittingIssue(false);
      setIssueModalOpen(false);
      setIssueMessage('');
      // In real app, save issue to database here
    }, 600);
  };

  const savePrivateNote = (userId: string) => {
    setPrivateNotes(prev => ({ ...prev, [userId]: tempNoteText }));
    setEditingNoteForId(null);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 pb-10 flex flex-col gap-4">
      
      {/* --- PAGE HEADER (Enterprise Standard) --- */}
      <div className="flex justify-between items-center border-b border-slate-200 pt-4 pb-6 mb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-[#0f172a] font-outfit uppercase tracking-tight leading-none">
              DAILY OPERATIONS AUDIT
            </h2>
          </div>
          <div className="text-slate-400 font-noto text-[11px] mt-1.5 flex items-center gap-2">
            ตรวจสอบผลการปฏิบัติงานรายวัน และข้อมูลการส่งลิงก์ • <span className="text-[var(--primary-theme)] font-bold">Admin Hub</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Date Navigation */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-sm">
            <button onClick={() => handleDateChange(-2)} className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-white hover:text-slate-800 rounded-lg transition-all">
              -2 Days
            </button>
            <button onClick={() => handleDateChange(-1)} className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-white hover:text-slate-800 rounded-lg transition-all">
              Yesterday
            </button>
            <button onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))} className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-white hover:text-slate-800 rounded-lg transition-all">
              Today
            </button>
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm hover:border-[var(--primary-theme)] transition-colors">
            <Calendar size={14} className="text-[var(--primary-theme)]" />
            <div className="w-px h-3 bg-slate-200 mx-1"></div>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-[11px] font-bold text-slate-700 outline-none cursor-pointer font-prompt min-w-[100px] uppercase tracking-wider"
            />
          </div>
        </div>
      </div>

      {/* --- KPI STRIP --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-2">
        {[
          { label: 'Active Staffs', value: `${submittedStaffCount} / ${displayUsers.length}`, icon: Users },
          { label: 'Total Active Pages', value: totalActivePages.toLocaleString(), icon: Briefcase },
          { label: 'Pages Submitted', value: totalDailyPages.toLocaleString(), icon: FileText },
          { label: 'Links Submitted', value: totalDailyLinks.toLocaleString(), icon: LinkIcon },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-[1.5rem] p-5 border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <stat.icon size={14} className="text-[var(--primary-theme)]" strokeWidth={1.5} />
              <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{stat.label}</h3>
            </div>
            <div className="relative z-10">
              <span className="text-3xl font-bold text-slate-800 font-outfit tracking-tighter">
                {stat.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px] mt-4 flex flex-col">
        {/* Table Header / Controls */}
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row items-center gap-4 bg-slate-50/50">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search personnel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-5 py-3 text-xs font-medium outline-none focus:border-[var(--primary-theme)] transition-all shadow-sm"
            />
          </div>
          
          <div className="flex flex-wrap md:flex-nowrap items-center gap-3 shrink-0 w-full md:w-auto">
             {uniqueDepartments.length > 1 && (
               <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm hover:border-[var(--primary-theme)] transition-colors focus-within:border-[var(--primary-theme)]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">Group:</span>
                  <select 
                    value={activeDepartmentFilter}
                    onChange={e => setActiveDepartmentFilter(e.target.value)}
                    className="bg-transparent border-none text-xs font-bold text-slate-700 outline-none cursor-pointer uppercase tracking-wider"
                  >
                    {uniqueDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
               </div>
             )}
             
             {uniqueBrands.length > 1 && (
               <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm hover:border-[var(--primary-theme)] transition-colors focus-within:border-[var(--primary-theme)]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">Brand:</span>
                  <select 
                    value={activeBrandFilter}
                    onChange={e => setActiveBrandFilter(e.target.value)}
                    className="bg-transparent border-none text-xs font-bold text-slate-700 outline-none cursor-pointer uppercase tracking-wider"
                  >
                    {uniqueBrands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
               </div>
             )}
          </div>
        </div>

        {/* Staff Table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-12 text-center">Pin</th>
                <th className="px-2 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Personnel</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-32">Workload Group</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-32">Brand</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-28">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center w-24">Pages</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center w-24">Links</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center w-24">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayUsers.map(user => {
                const stats = userStats[user.id];
                const hasSubmitted = !!stats;
                const isPinned = pinnedUsers.includes(user.id);

                return (
                  <tr key={user.id} className={cn(
                    "transition-colors group",
                    isPinned ? "bg-blue-50/30 hover:bg-blue-50/60" : "hover:bg-slate-50/50"
                  )}>
                    <td className="px-6 py-4 text-center">
                        <button 
                          onClick={(e) => togglePin(e, user.id)}
                          className={cn(
                            "p-2 rounded-xl transition-all border",
                            isPinned 
                              ? "bg-blue-100 border-blue-200 text-[var(--primary-theme)] shadow-sm" 
                              : "bg-white border-slate-200 text-slate-300 hover:text-[var(--primary-theme)] hover:border-blue-200"
                          )}
                          title={isPinned ? "Unpin staff" : "Pin staff to top"}
                        >
                          <Pin size={14} className={isPinned ? "fill-current" : ""} />
                        </button>
                      </td>
                      <td className="px-2 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 border border-slate-200 overflow-hidden">
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-bold uppercase">{user.name.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-700 font-prompt">{user.name}</p>
                            <p className="text-[10px] text-slate-400 font-noto uppercase tracking-wider">{user.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">
                            {user.department || 'General'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.brand ? (
                          <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-blue-100">
                            {user.brand}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">
                            No Brand
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {hasSubmitted ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Submitted</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs font-bold text-slate-600 font-outfit">{hasSubmitted ? stats.totalPages : '-'}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs font-bold text-slate-600 font-outfit">{hasSubmitted ? stats.totalLinks : '-'}</span>
                      </td>
                      <td className="px-8 py-4 text-center">
                        <button 
                          onClick={() => setSelectedUser(user)}
                          className={cn(
                            "inline-flex items-center justify-center p-2 rounded-xl transition-all border shadow-sm",
                            hasSubmitted 
                              ? "bg-white border-slate-200 text-[var(--primary-theme)] hover:text-white hover:bg-[var(--primary-theme)] hover:border-[var(--primary-theme)]" 
                              : "bg-white border-slate-200 text-slate-400 hover:text-slate-700"
                          )}
                          title="Daily Audit & Assets"
                        >
                          <Search size={14} />
                        </button>
                      </td>
                    </tr>
                );
              })}
              
              {displayUsers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                       <Users size={32} className="text-slate-200" />
                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No personnel found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- DRILL-DOWN DRAWER (Pro Aesthetic) --- */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/40 backdrop-blur-sm transition-all">
          <div 
            className="absolute inset-0" 
            onClick={() => {
              setSelectedUser(null);
              setEditingNoteForId(null);
            }}
          ></div>
          <div className="relative w-full max-w-[650px] bg-slate-50 h-full shadow-2xl flex flex-col animate-slide-in-right border-l border-white/20">
            
            {/* Drawer Header */}
            <div className="px-8 py-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                   <h2 className="text-xl font-bold text-[#0f172a] font-outfit uppercase tracking-tight leading-none">
                     WORK AUDIT
                   </h2>
                   <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-[var(--primary-theme)] text-white shadow-sm">
                     {format(parseISO(selectedDate), 'dd MMM yyyy')}
                   </span>
                </div>
                <p className="text-slate-400 font-noto text-[11px] mt-1 flex items-center gap-1.5">
                  Personnel: <strong className="text-slate-700">{selectedUser.name}</strong> ({selectedUser.role})
                </p>
              </div>
              <button 
                onClick={() => {
                  setSelectedUser(null);
                  setEditingNoteForId(null);
                }}
                className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors shadow-sm"
              >
                <X size={14} />
              </button>
            </div>

            {/* Private Note Section (Admin Only) */}
            <div className="px-8 pt-6 pb-2 shrink-0">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                <div className="absolute -right-4 -top-4 text-amber-100 opacity-50 pointer-events-none">
                   <BookOpen size={64} />
                </div>
                <div className="flex items-center justify-between mb-2 relative z-10">
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} className="text-amber-600" />
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-amber-800">Private Admin Note</h3>
                  </div>
                  {editingNoteForId !== selectedUser.id && (
                    <button 
                      onClick={() => {
                        setTempNoteText(privateNotes[selectedUser.id] || '');
                        setEditingNoteForId(selectedUser.id);
                      }}
                      className="text-[10px] font-bold uppercase tracking-widest text-amber-600 hover:text-amber-800 transition-colors"
                    >
                      {privateNotes[selectedUser.id] ? 'Edit Note' : 'Add Note'}
                    </button>
                  )}
                </div>
                
                <div className="relative z-10">
                  {editingNoteForId === selectedUser.id ? (
                    <div className="flex flex-col gap-2">
                      <textarea 
                        className="w-full bg-white border border-amber-200 rounded-xl p-3 text-xs font-noto text-slate-800 outline-none focus:border-amber-400 transition-all resize-none shadow-inner"
                        rows={3}
                        placeholder="Secret notes about this submission or staff performance... (Only visible to you)"
                        value={tempNoteText}
                        onChange={(e) => setTempNoteText(e.target.value)}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                         <button 
                           onClick={() => setEditingNoteForId(null)}
                           className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
                         >
                           Cancel
                         </button>
                         <button 
                           onClick={() => savePrivateNote(selectedUser.id)}
                           className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-amber-500 text-white hover:bg-amber-600 rounded-xl shadow-sm transition-all"
                         >
                           Save Note
                         </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs font-medium font-noto text-amber-900/80 leading-relaxed min-h-[20px]">
                      {privateNotes[selectedUser.id] || <span className="italic opacity-50">No private notes for this personnel.</span>}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-6 mt-4">
              {(() => {
                const activePages = pages
                  .filter(p => p.ownerId === selectedUser.id && p.status === 'Active' && !p.isDeleted)
                  .sort((a, b) => a.boxId - b.boxId);
                
                if (activePages.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center h-40 opacity-50 space-y-3">
                      <AlertCircle size={24} className="text-slate-400" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">No active assets assigned</p>
                    </div>
                  );
                }

                return activePages.map(page => {
                  const log = userStats[selectedUser.id]?.logs.find(l => l.pageId === page.id);
                  
                  return (
                    <div key={page.id} className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden group">
                      {/* Page Matrix Header */}
                      <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-800 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-inner relative">
                            {page.name.charAt(0).toUpperCase()}
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-slate-800 font-prompt truncate max-w-[150px] sm:max-w-xs">{page.name}</p>
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest bg-slate-200 text-slate-500 shadow-sm">Box {page.boxId}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Briefcase size={10} className="text-slate-400" />
                              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-medium">{page.category || 'No Category'}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Issue Report Button */}
                        <button 
                          onClick={() => {
                            setIssueTargetPage(page);
                            setIssueModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-rose-200 text-rose-500 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-rose-50 transition-colors shadow-sm"
                        >
                          <AlertTriangle size={12} />
                          Report Issue
                        </button>
                      </div>

                      {/* Links Payload OR Pending State */}
                      <div className="p-5">
                        {log ? (
                          (() => {
                            const linksToShow = log.links?.filter(l => l && l.trim().length > 0) || [];
                            const validation = linksToShow.length > 0 
                              ? validateAllLinks(linksToShow, page.facebookUrl, page.name)
                              : null;

                            return (
                              <>
                                <div className="flex items-center justify-between mb-3">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <LinkIcon size={12} />
                                    Payload Links ({linksToShow.length || log.clipsCount || 0})
                                  </p>
                                  {validation && linksToShow.length > 0 && (
                                    <div className="flex items-center gap-2">
                                      {validation.summary.valid > 0 && (
                                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 text-[9px] font-bold uppercase tracking-widest">
                                          <ShieldCheck size={10} /> {validation.summary.valid}
                                        </span>
                                      )}
                                      {validation.summary.suspicious > 0 && (
                                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-[9px] font-bold uppercase tracking-widest">
                                          <ShieldAlert size={10} /> {validation.summary.suspicious}
                                        </span>
                                      )}
                                      {validation.summary.unverifiable > 0 && (
                                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 text-[9px] font-bold uppercase tracking-widest">
                                          <ShieldQuestion size={10} /> {validation.summary.unverifiable}
                                        </span>
                                      )}
                                      {validation.summary.invalid > 0 && (
                                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[9px] font-bold uppercase tracking-widest">
                                          <AlertTriangle size={10} /> {validation.summary.invalid} FRAUD
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                {linksToShow.length > 0 ? (
                                  <div className="space-y-2">
                                    {linksToShow.map((link, idx) => {
                                      const result = validation?.results[idx];
                                      const statusColors: Record<LinkValidationStatus, string> = {
                                        valid: 'border-emerald-200 bg-emerald-50/30',
                                        suspicious: 'border-rose-200 bg-rose-50/30',
                                        unverifiable: 'border-amber-200 bg-amber-50/20',
                                        invalid: 'border-red-300 bg-red-50/40',
                                      };
                                      const statusIcons: Record<LinkValidationStatus, React.ReactNode> = {
                                        valid: <ShieldCheck size={12} className="text-emerald-500" />,
                                        suspicious: <ShieldAlert size={12} className="text-rose-500" />,
                                        unverifiable: <ShieldQuestion size={12} className="text-amber-500" />,
                                        invalid: <AlertTriangle size={12} className="text-red-600" />,
                                      };

                                      return (
                                        <div key={idx} className={cn(
                                          "flex items-center justify-between p-3 rounded-xl border transition-all group/link",
                                          result ? statusColors[result.status] : 'border-slate-200 bg-white'
                                        )}>
                                          <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                                            <span className="text-[10px] font-bold text-slate-300 uppercase w-4 shrink-0">L{idx+1}</span>
                                            {result && statusIcons[result.status]}
                                            <a 
                                              href={link} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-[11px] text-slate-600 font-medium font-prompt truncate hover:text-[var(--primary-theme)] transition-colors"
                                            >
                                              {link}
                                            </a>
                                          </div>
                                          <div className="flex items-center gap-2 ml-2 shrink-0">
                                            {result && (
                                              <span className={cn(
                                                "text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded",
                                                result.status === 'valid' && 'text-emerald-600 bg-emerald-100',
                                                result.status === 'suspicious' && 'text-rose-600 bg-rose-100',
                                                result.status === 'unverifiable' && 'text-amber-600 bg-amber-100',
                                                result.status === 'invalid' && 'text-red-700 bg-red-100'
                                              )}>
                                                {result.status === 'valid' ? 'VERIFIED' : result.status === 'suspicious' ? 'MISMATCH' : result.status === 'unverifiable' ? 'SHARE URL' : 'NOT FB'}
                                              </span>
                                            )}
                                            <a href={link} target="_blank" rel="noopener noreferrer">
                                              <ExternalLink size={14} className="text-slate-300 hover:text-[var(--primary-theme)] transition-colors" />
                                            </a>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : log.clipsCount ? (
                                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 border-dashed flex flex-col items-center justify-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{log.clipsCount} Links Logged (No URLs)</span>
                                  </div>
                                ) : (
                                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 border-dashed flex flex-col items-center justify-center gap-1">
                                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Empty Payload</span>
                                  </div>
                                )}
                              </>
                            );
                          })()
                        ) : (
                          <div className="py-4 flex flex-col items-center justify-center gap-2 opacity-50">
                             <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">No submission yet today</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* --- ISSUE REPORTING MODAL (Portaled) --- */}
      {issueModalOpen && issueTargetPage && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200 p-4">
          <div className="bg-white w-full max-w-[450px] rounded-[2rem] p-8 shadow-2xl border border-slate-200 animate-in slide-in-from-bottom-8 duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center rounded-2xl shadow-inner">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-outfit uppercase tracking-tight leading-none mb-1">Issue Reporting</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-noto">
                    Target: <span className="text-slate-700">{issueTargetPage.name}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIssueModalOpen(false)} 
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm"
              >
                <X size={14} />
              </button>
            </div>

            <div className="mb-6">
              <h4 className="text-[10px] font-bold text-slate-500 font-noto mb-3 uppercase tracking-widest">Select Request Type</h4>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIssueType('Warning')}
                  className={cn(
                    "py-4 px-3 rounded-2xl flex flex-col items-center gap-2 transition-all text-[11px] font-bold font-noto border shadow-sm", 
                    issueType === 'Warning' 
                      ? "bg-rose-500 text-white border-rose-600 shadow-md scale-105" 
                      : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                  )}
                >
                  <AlertTriangle size={18} />
                  แจ้งปัญหา / แก้ไขด่วน
                </button>
                <button
                  onClick={() => setIssueType('Note')}
                  className={cn(
                    "py-4 px-3 rounded-2xl flex flex-col items-center gap-2 transition-all text-[11px] font-bold font-noto border shadow-sm", 
                    issueType === 'Note' 
                      ? "bg-[var(--primary-theme)] text-white border-[var(--primary-theme)] shadow-md scale-105" 
                      : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                  )}
                >
                  <MessageSquare size={18} />
                  ฝากข้อความทั่วไป
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-[10px] font-bold text-slate-500 font-noto mb-3 uppercase tracking-widest">Message Details</h4>
              <textarea
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-noto text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[var(--primary-theme)] focus:ring-1 focus:ring-[var(--primary-theme)] resize-none h-28 transition-all shadow-inner"
                placeholder="ระบุปัญหา หรือลิงก์ที่ต้องการให้ตรวจสอบ..."
                value={issueMessage}
                onChange={(e) => setIssueMessage(e.target.value)}
              />
            </div>

            {/* Quick Templates */}
            <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden mb-8 pb-1">
              {['เปลี่ยนเพจด่วน', 'แก้ลิงก์เพจใหม่', 'เปลื่ยนแบนเนอร์', 'ส่งลิงก์ผิด', 'แก้สถานะเพจ'].map(tmpl => (
                <button
                  key={tmpl}
                  onClick={() => setIssueMessage(tmpl)}
                  className="shrink-0 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 transition-colors shadow-sm"
                >
                  {tmpl}
                </button>
              ))}
            </div>

            <button
              onClick={handleIssueSubmit}
              disabled={isSubmittingIssue || issueMessage.trim() === ''}
              className="w-full flex items-center justify-center gap-2 py-4 bg-[#0f172a] text-white rounded-2xl font-bold font-noto text-[11px] uppercase tracking-widest shadow-xl disabled:opacity-50 transition-all hover:bg-slate-800"
            >
              {isSubmittingIssue ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Submit Report
                </>
              )}
            </button>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
