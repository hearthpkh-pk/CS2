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
import { HQDashboardView } from '@/components/admin/HQDashboardView';
import { TeamManagementView } from '@/components/admin/TeamManagementView';
import { PlaceholderView } from '@/components/ui/PlaceholderView';
import { Toast } from '@/components/ui/Toast';
import { dataService } from '@/services/dataService';
import { initialUsers, initialPages } from '@/services/mockData';
import { Page, DailyLog, FBAccount, User } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getFacebookPageData } from '@/utils/facebookUtils';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function CreatorApp() {
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]); // Default to Super Admin for dev
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'pages' | 'accounts'>('pages');
  const [pages, setPages] = useState<Page[]>([]);
  const [accounts, setAccounts] = useState<FBAccount[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  // Filters State (Stored here for Dashboard)
  const [selectedPage, setSelectedPage] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
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

  const handleSyncPage = async (id: string, url: string) => {
    showToast('กำลังซิงค์ข้อมูลจาก Facebook...');
    const meta = await getFacebookPageData(url);
    const page = pages.find(p => p.id === id);
    if (page) {
      const updatedPage = { ...page, facebookData: meta as any };
      dataService.savePage(updatedPage);
      setPages(dataService.getPages());
      showToast('ซิงค์ข้อมูลสำเร็จ');
    }
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

        <main className="flex-1 p-4 md:p-6 text-slate-900">
          {currentTab === 'dashboard' && (
            <DashboardView
              pages={pages}
              logs={logs}
              allPages={pages}
              allLogs={logs}
              selectedPage={selectedPage}
              setSelectedPage={setSelectedPage}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              onNavigateToTask={() => setCurrentTab('daily-task')}
              currentUser={currentUser}
              onSyncPage={handleSyncPage}
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
              currentUser={currentUser}
              onSave={handleSaveLogs}
            />
          )}

          {currentTab === 'hq-dashboard' && (
            <HQDashboardView 
              pages={pages} 
              accounts={accounts} 
              users={users} 
              logs={logs}
              currentUser={currentUser}
            />
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

          {currentTab === 'team' && (currentUser.role === 'Super Admin' || currentUser.role === 'Admin') ? (
            <TeamManagementView
              users={users}
              setUsers={setUsers}
              currentUser={currentUser}
            />
          ) : currentTab === 'team' ? (
            <PlaceholderView 
              title="Access Denied" 
              icon={Users} 
              description="You do not have permission to view Team Management." 
            />
          ) : null}

          {currentTab === 'reports' && (
            <PlaceholderView 
              title="Reports & Analytics" 
              icon={BarChart3} 
              description="Comprehensive performance metrics coming soon..." 
            />
          )}

          {currentTab === 'settings' && (
            <PlaceholderView 
              title="Company Settings" 
              icon={Building2} 
              description="Global organization configuration coming soon..." 
            />
          )}

          {currentTab === 'audit' && (
            <PlaceholderView 
              title="Activity Audit" 
              icon={HistoryIcon} 
              description="Security logs and activity tracking coming soon..." 
            />
          )}

          {currentTab === 'help' && (
            <PlaceholderView 
              title="Help Center" 
              icon={HelpCircle} 
              description="Documentation and tutorials coming soon..." 
            />
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
