'use client';

import React, { useState, useCallback } from 'react';
import { BarChart2 } from 'lucide-react';
import { DailyReport } from '@/types';
import { reportService } from '../services/reportService';
import { personnelService } from '@/services/personnelService';
import { ExecutiveStats } from './PerformanceAudit/ExecutiveStats';
import { LeaveAuditReport } from './LeaveAuditReport';
import { ReportsHeader } from './Common/ReportsHeader';
import { OperationalMatrix } from './PerformanceAudit/OperationalMatrix';
import { ReportDrillDown } from './PerformanceAudit/ReportDrillDown';

interface ReportsViewProps {
  currentUser: any;
  policy: any;
}

export const ReportsView = ({ currentUser, policy }: ReportsViewProps) => {
  // --- 1. Global State Management ---
  const [reports, setReports] = useState<DailyReport[]>(reportService.getDailyStatus(currentUser));
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [viewMode, setViewMode] = useState<'report' | 'stats' | 'leaves'>('report');
  
  // Filtering & Search State
  const [filterMode, setFilterMode] = useState<'all' | 'brand' | 'department' | 'tag'>('all');
  const [activeFilterValue, setActiveFilterValue] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(
    new Set(reports.filter(r => r.isPinned).map(r => r.id))
  );

  // Reorder Mode
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // --- 2. Derived Data & Logic ---
  const uniqueDepartments = Array.from(new Set(reports.map(r => r.department)));
  const uniqueBrands = Array.from(new Set(reports.map(r => r.brand).filter(b => b !== 'None')));
  const uniqueTags = Array.from(new Set(reports.flatMap(r => r.tags || [])));

  const togglePin = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newPinned = new Set(pinnedIds);
    if (newPinned.has(id)) newPinned.delete(id);
    else newPinned.add(id);
    setPinnedIds(newPinned);
  };

  const selectFilter = (mode: 'all' | 'brand' | 'department' | 'tag', value: string | null = null) => {
    if (filterMode === mode && !value) {
      setFilterMode('all');
      setActiveFilterValue(null);
    } else {
      setFilterMode(mode);
      setActiveFilterValue(value);
    }
  };

  // Sorting Logic: sortOrder first (manual), then pinned, then alphabetical
  const sortedReports = [...reports].sort((a, b) => {
    const aOrder = a.sortOrder ?? 999;
    const bOrder = b.sortOrder ?? 999;
    if (aOrder !== bOrder) return aOrder - bOrder;
    const aPinned = pinnedIds.has(a.id);
    const bPinned = pinnedIds.has(b.id);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return a.userName.localeCompare(b.userName);
  });

  // Final Filtered Dataset
  const filteredReports = sortedReports.filter(r => {
    if (searchTerm && !r.userName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterMode === 'all') return true;
    if (filterMode === 'department') return activeFilterValue ? r.department === activeFilterValue : true;
    if (filterMode === 'brand') return activeFilterValue ? r.brand === activeFilterValue : r.brand !== 'None';
    if (filterMode === 'tag') return activeFilterValue ? r.tags?.includes(activeFilterValue) : r.tags && r.tags.length > 0;
    return true;
  });

  // --- 3. Reorder Handlers ---
  const handleReorder = useCallback((reorderedReports: DailyReport[]) => {
    // อัปเดต sortOrder ในแต่ละรายการ
    const updated = reports.map(report => {
      const newIndex = reorderedReports.findIndex(r => r.id === report.id);
      if (newIndex !== -1) {
        return { ...report, sortOrder: newIndex + 1 };
      }
      return report;
    });
    setReports(updated);
  }, [reports]);

  const handleSaveOrder = useCallback(async () => {
    setIsSavingOrder(true);
    try {
      const orderedItems = reports
        .filter(r => r.sortOrder !== undefined)
        .map(r => ({ id: r.userId, sortOrder: r.sortOrder! }));

      await personnelService.updateSortOrder(orderedItems);
      setIsReorderMode(false);
    } catch (error) {
      console.error('Error saving sort order:', error);
    } finally {
      setIsSavingOrder(false);
    }
  }, [reports]);

  return (
    <div className="w-full max-w-[1600px] mx-auto flex flex-col gap-8 px-4 md:px-8 pb-10 overflow-x-hidden text-slate-900 font-prompt">
      
      {/* 🏛️ COMPONENT 1: STANDARDIZED HEADER */}
      <ReportsHeader 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isReorderMode={isReorderMode}
        onToggleReorder={(filterMode === 'all' && !searchTerm) ? () => setIsReorderMode(!isReorderMode) : undefined}
        onSaveOrder={handleSaveOrder}
        isSavingOrder={isSavingOrder}
      />

      {/* 🚀 COMPONENT 2: MAIN VIEW ORCHESTRATION */}
      {currentUser.role === 'Developer' ? (
        <div className="bg-white rounded-[3rem] border border-slate-100 p-16 text-center shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
           <div className="max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mx-auto ring-8 ring-blue-50/50 group-hover:rotate-12 transition-transform duration-500">
                 <BarChart2 size={40} className="text-[var(--primary-theme)]" />
              </div>
              <div className="space-y-3">
                 <h3 className="text-2xl font-bold text-slate-800 font-outfit tracking-tight">System Developer Console</h3>
                 <p className="text-slate-400 font-medium text-[13px] leading-relaxed">
                    คุณกำลังอยู่ในโหมด <span className="text-[var(--primary-theme)] font-bold">Root Architecture</span> ข้อมูลรายงานทางธุรกิจของผู้อื่นจะถูกจำกัดไว้เพื่อความเป็นส่วนตัว
                 </p>
              </div>
              <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100/50">
                 <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                    โปรดใช้ปุ่ม <span className="text-[var(--primary-theme)]">FAB (Developer Tool)</span> มุมขวาล่าง <br/> เพื่อสวมสิทธิ์เป็นผู้ใช้งานที่ต้องการตรวจสอบข้อมูลครับ
                 </p>
              </div>
           </div>
        </div>
      ) : viewMode === 'report' ? (
        <OperationalMatrix 
          reports={reports}
          filteredReports={filteredReports}
          filterMode={filterMode}
          onFilterChange={selectFilter}
          activeFilterValue={activeFilterValue}
          onActiveFilterChange={setActiveFilterValue}
          uniqueDepartments={uniqueDepartments}
          uniqueBrands={uniqueBrands}
          uniqueTags={uniqueTags}
          onSelectReport={setSelectedReport}
          pinnedIds={pinnedIds}
          onTogglePin={togglePin}
          isReorderMode={isReorderMode}
          onReorder={handleReorder}
        />
      ) : viewMode === 'stats' ? (
        <ExecutiveStats reports={reports} />
      ) : (
        <LeaveAuditReport />
      )}

      {/* 📋 COMPONENT 3: DETAIL DRILL-DOWN ANALYTICS */}
      <ReportDrillDown 
        selectedReport={selectedReport}
        onClose={() => setSelectedReport(null)}
      />

    </div>
  );
};
