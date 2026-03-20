'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar, MobileHeader, MobileBottomNav } from '@/components/layout/Navigation';
import { 
  Plus, Users, LayoutDashboard, FilePlus, 
  Settings, CreditCard, Activity, BarChart3, 
  Building2, History as HistoryIcon, HelpCircle,
  PieChart
} from 'lucide-react';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { TransactionsView } from '@/components/forms/TransactionsView';
import { SetupView } from '@/components/forms/SetupView';
import { CalendarView } from '@/components/workspace/CalendarView';
import { DailyTaskView } from '@/components/workspace/DailyTaskView';
import { LearningCenterView } from '@/components/workspace/LearningCenterView';
import { PolicyCenterView } from '@/components/workspace/PolicyCenterView';
import { PolicySettingsView } from '@/components/admin/PolicySettingsView';
import { Toast } from '@/components/ui/Toast';
import { dataService } from '@/services/dataService';
import { initialUsers, initialPages } from '@/services/mockData';
import { Page, DailyLog, FBAccount, User } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function CreatorApp() {
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]); // Default to Super Admin for dev
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentTab, setCurrentTab] = useState('setup');
  const [viewMode, setViewMode] = useState<'pages' | 'accounts'>('pages');
  const [pages, setPages] = useState<Page[]>([]);
  const [accounts, setAccounts] = useState<FBAccount[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  // Filters State (Stored here for Dashboard)
  const [selectedPage, setSelectedPage] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Load Initial Data - Reactive to currentUser
  useEffect(() => {
    setPages(dataService.getPages(currentUser));
    setAccounts(dataService.getAccounts(currentUser));
    setLogs(dataService.getLogs());
  }, [currentUser]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // --- Handlers ---
  const handleSaveLogs = (newLogs: DailyLog[]) => {
    dataService.saveLogs(newLogs);
    setLogs(dataService.getLogs()); // Refresh from storage
    showToast('บันทึกข้อมูลเรียบร้อย');
  };

  const handleAddPage = (pageData: Omit<Page, 'id'>) => {
    const newPage: Page = {
      ...pageData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    dataService.savePage(newPage);
    setPages(dataService.getPages());
    showToast('เพิ่มเพจสำเร็จ');
  };

  const handleUpdatePage = (updatedPage: Page) => {
    dataService.savePage(updatedPage);
    setPages(dataService.getPages());
    showToast('อัปเดตข้อมูลเรียบร้อย');
  };

  const handleTrashPage = (id: string) => {
    const page = pages.find(p => p.id === id);
    if (page) {
      dataService.savePage({ ...page, isDeleted: true, deletedAt: new Date().toISOString() });
      setPages(dataService.getPages());
      showToast('ย้ายเพจลงถังขยะเรียบร้อย');
    }
  };

  const handleRestorePage = (id: string) => {
    const page = pages.find(p => p.id === id);
    if (page) {
      dataService.savePage({ ...page, isDeleted: false, deletedAt: undefined });
      setPages(dataService.getPages());
      showToast('กู้คืนเพจเรียบร้อย');
    }
  };

  const handlePermanentDeletePage = (id: string) => {
    dataService.deletePage(id);
    setPages(dataService.getPages());
    setLogs(dataService.getLogs());
    showToast('ลบเพจถาวรเรียบร้อย');
  };

  const handleAddAccount = (accData: Omit<FBAccount, 'id'>) => {
    const newAcc: FBAccount = {
      ...accData,
      id: `acc-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    dataService.saveAccount(newAcc);
    setAccounts(dataService.getAccounts());
    showToast('เพิ่มบัญชีสำเร็จ');
  };

  const handleUpdateAccount = (updatedAcc: FBAccount) => {
    dataService.saveAccount(updatedAcc);
    setAccounts(dataService.getAccounts());
    showToast('อัปเดตบัญชีเรียบร้อย');
  };

  const handleTrashAccount = (id: string) => {
    const acc = accounts.find(a => a.id === id);
    if (acc) {
      dataService.saveAccount({ ...acc, isDeleted: true, deletedAt: new Date().toISOString() });
      setAccounts(dataService.getAccounts());
      showToast('ย้ายบัญชีลงถังขยะเรียบร้อย');
    }
  };

  const handleRestoreAccount = (id: string) => {
    const acc = accounts.find(a => a.id === id);
    if (acc) {
      dataService.saveAccount({ ...acc, isDeleted: false, deletedAt: undefined });
      setAccounts(dataService.getAccounts());
      showToast('กู้คืนบัญชีเรียบร้อย');
    }
  };

  const handlePermanentDeleteAccount = (id: string) => {
    dataService.deleteAccount(id);
    setAccounts(dataService.getAccounts());
    showToast('ลบบัญชีถาวรเรียบร้อย');
  };

  const handleClearTrash = () => {
    const deletedPages = pages.filter(p => p.isDeleted);
    const deletedAccounts = accounts.filter(a => a.isDeleted);

    deletedPages.forEach(p => dataService.deletePage(p.id));
    deletedAccounts.forEach(a => dataService.deleteAccount(a.id));

    setPages(dataService.getPages());
    setAccounts(dataService.getAccounts());
    showToast('ล้างถังขยะเรียบร้อย');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-prompt">
      {toast && <Toast message={toast} />}

      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
      />

      <div className={cn(
        "flex-1 md:ml-20 flex flex-col min-h-screen relative transition-colors duration-500",
        viewMode === 'pages' ? "theme-pages" : "theme-accounts"
      )}>
        <MobileHeader />

        <main className="flex-1 p-4 md:p-6">
          {currentTab === 'dashboard' && (
            <DashboardView
              pages={pages}
              logs={logs}
              selectedPage={selectedPage}
              setSelectedPage={setSelectedPage}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              onNavigateToTask={() => setCurrentTab('daily-task')}
              currentUser={currentUser}
            />
          )}

          {currentTab === 'calendar' && (
            <CalendarView currentUser={currentUser} />
          )}

          {currentTab === 'daily-task' && (
              <DailyTaskView currentUser={currentUser} pages={initialPages} />
            )}

          {currentTab === 'learning' && (
            <LearningCenterView currentUser={currentUser} />
          )}

          {currentTab === 'rules' && (
            <PolicyCenterView />
          )}

          {currentTab === 'payroll' && currentUser.role === 'Super Admin' && (
            <PolicySettingsView currentUser={currentUser} />
          )}

          {currentTab === 'transactions' && (
            <TransactionsView
              pages={pages}
              logs={logs}
              onSave={handleSaveLogs}
            />
          )}

          {currentTab === 'hq-dashboard' && (
             <div className="space-y-6 animate-in fade-in duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                   <div>
                      <h2 className="text-2xl font-bold text-slate-800 font-outfit uppercase tracking-tight">HQ Dashboard</h2>
                      <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.2em] mt-1">ทีมงานและภาพรวมองค์กร • Team Aggregation</p>
                   </div>
                   <div className="flex items-center gap-2">
                      <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-500 font-noto focus:ring-2 ring-emerald-100 outline-none">
                         <option>กรองรายคน (Staff Filter)</option>
                         {users.filter(u => u.role === 'Staff').map(u => <option key={u.id}>{u.name}</option>)}
                      </select>
                      <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-500 font-noto focus:ring-2 ring-emerald-100 outline-none">
                         <option>กรองตามสถานะ (Status)</option>
                         <option>Live Only</option>
                         <option>Restricted</option>
                      </select>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                   {[
                      { label: 'Total Pages', val: pages.length, icon: Settings, color: 'text-blue-500' },
                      { label: 'Total Accounts', val: accounts.length, icon: Users, color: 'text-emerald-500' },
                      { label: 'Team Activity', val: '98%', icon: Activity, color: 'text-purple-500' },
                      { label: 'Avg Health', val: 'Good', icon: Activity, color: 'text-orange-500' },
                   ].map((stat, i) => (
                      <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                         <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                            <stat.icon size={16} className={stat.color} />
                         </div>
                         <p className="text-2xl font-black text-slate-700 font-inter">{stat.val}</p>
                      </div>
                   ))}
                </div>

                <div className="bg-white/40 border border-dashed border-slate-200 rounded-[3rem] h-64 flex items-center justify-center text-slate-400">
                   <div className="text-center">
                      <PieChart size={48} className="mx-auto mb-4 opacity-10" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Team Charts & Analytics Hub</p>
                   </div>
                </div>
             </div>
          )}

          {currentTab === 'setup' && (
            <SetupView
              viewMode={viewMode}
              setViewMode={setViewMode}
              currentUser={currentUser}
              users={users}
              pages={pages}
              accounts={accounts}
              onAdd={handleAddPage}
              onUpdate={handleUpdatePage}
              onDelete={handleTrashPage}
              onRestorePage={handleRestorePage}
              onPermanentDeletePage={handlePermanentDeletePage}
              onAddAccount={handleAddAccount}
              onUpdateAccount={handleUpdateAccount}
              onDeleteAccount={handleTrashAccount}
              onRestoreAccount={handleRestoreAccount}
              onPermanentDeleteAccount={handlePermanentDeleteAccount}
              onClearTrash={handleClearTrash}
            />
          )}

          {currentTab === 'team' && (
             <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
                <Users size={64} className="mb-4 opacity-20" />
                <h3 className="text-xl font-bold text-slate-600">Team Management</h3>
                <p className="text-sm">Coming soon in Phase 2 Expansion...</p>
             </div>
          )}

          {currentTab === 'reports' && (
             <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
                <BarChart3 size={64} className="mb-4 opacity-20" />
                <h3 className="text-xl font-bold text-slate-600">Reports & Analytics</h3>
                <p className="text-sm">Comprehensive performance metrics coming soon...</p>
             </div>
          )}

          {currentTab === 'settings' && (
             <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
                <Building2 size={64} className="mb-4 opacity-20" />
                <h3 className="text-xl font-bold text-slate-600">Company Settings</h3>
                <p className="text-sm">Global organization configuration coming soon...</p>
             </div>
          )}

          {currentTab === 'audit' && (
             <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
                <HistoryIcon size={64} className="mb-4 opacity-20" />
                <h3 className="text-xl font-bold text-slate-600">Activity Audit</h3>
                <p className="text-sm">Security logs and activity tracking coming soon...</p>
             </div>
          )}

          {currentTab === 'help' && (
             <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
                <HelpCircle size={64} className="mb-4 opacity-20" />
                <h3 className="text-xl font-bold text-slate-600">Help Center</h3>
                <p className="text-sm">Documentation and tutorials coming soon...</p>
             </div>
          )}
        </main>
        <MobileBottomNav 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab} 
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}
