'use client';

import React, { useState } from 'react';
import { User, Page, DailyLog, PolicyConfiguration } from '@/types';
import { CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Hooks
import { useMobileDashboardData } from '../hooks/useMobileDashboardData';

// Tabs
import { MobileDailyTab } from './tabs/MobileDailyTab';
import { MobileMonthlyTab } from './tabs/MobileMonthlyTab';
import { MobilePayrollTab } from './tabs/MobilePayrollTab';

// Shared
import { MobileStaffDetail } from './shared/MobileStaffDetail';

interface MobileHQDashboardProps {
  currentUser: User;
  pages: Page[];
  users: User[];
  logs: DailyLog[];
  policy: PolicyConfiguration;
}

export const MobileHQDashboard: React.FC<MobileHQDashboardProps> = ({ 
  currentUser, pages, users, logs, policy 
}) => {
  const [currentScreen, setCurrentScreen] = useState<'overview' | 'staffDetail'>('overview'); 
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'payroll'>('daily');
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

  // Hook into Shared Logistics
  const { sharedMetrics, staffData } = useMobileDashboardData(currentUser, pages, users, logs, policy);

  // Handlers
  const handleStaffClick = (staff: any) => {
    setSelectedStaff(staff);
    setCurrentScreen('staffDetail');
    if (staff.pageDetails.length > 0) {
      setSelectedPageId(staff.pageDetails[0].id);
    }
  };

  const handleBack = () => {
    setCurrentScreen('overview');
    setTimeout(() => {
      setSelectedStaff(null);
      setSelectedPageId(null);
    }, 300);
  };

  // --- MAIN OVERVIEW WRAPPER ---
  const renderOverview = () => {
    return (
      <div className="flex flex-col h-full w-full bg-slate-50">
        <div className="bg-white px-6 pt-8 pb-4 border-b border-slate-200 sticky top-0 z-20 rounded-b-3xl shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-[22px] font-bold text-slate-900 font-outfit tracking-tight leading-none">
                HQ CONTROL CENTER
              </h1>
              <div className="text-[10px] text-slate-400 font-noto flex items-center gap-1.5 mt-0.5">
                Executive Console <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-slate-500 font-outfit uppercase tracking-widest">{format(new Date(), 'dd MMM yyyy')}</span>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl">
             <button 
              onClick={() => setActiveTab('daily')}
              className={cn(
                "flex-1 py-2 text-center text-[11px] font-semibold font-outfit tracking-wider uppercase transition-all duration-200 rounded-lg",
                activeTab === 'daily' ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Operations
            </button>
            <button 
              onClick={() => setActiveTab('monthly')}
              className={cn(
                "flex-1 py-2 text-center text-[11px] font-semibold font-outfit tracking-wider uppercase transition-all duration-200 rounded-lg",
                activeTab === 'monthly' ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Analytics
            </button>
            <button 
              onClick={() => setActiveTab('payroll')}
              className={cn(
                "flex-1 py-2 text-center text-[11px] font-semibold font-outfit tracking-wider uppercase transition-all duration-200 rounded-lg",
                activeTab === 'payroll' ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Payroll
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'daily' && (
            <MobileDailyTab 
              staffData={staffData} 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
              onStaffClick={handleStaffClick} 
            />
          )}
          {activeTab === 'monthly' && (
            <MobileMonthlyTab 
              sharedMetrics={sharedMetrics} 
              staffData={staffData} 
            />
          )}
          {activeTab === 'payroll' && (
            <MobilePayrollTab 
              staffData={staffData} 
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-slate-50 z-[100] font-sans selection:bg-blue-100 overflow-hidden text-slate-900">
      <div 
        className="w-full h-full flex transition-transform duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{ transform: currentScreen === 'overview' ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        <div className="w-full h-full flex-shrink-0">
          {renderOverview()}
        </div>
        <div className="w-full h-full flex-shrink-0">
          <MobileStaffDetail 
            selectedStaff={selectedStaff}
            selectedPageId={selectedPageId}
            setSelectedPageId={setSelectedPageId}
            onBack={handleBack}
          />
        </div>
      </div>
    </div>
  );
};
