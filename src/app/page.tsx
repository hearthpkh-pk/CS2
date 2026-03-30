'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar, MobileHeader, MobileBottomNav } from '@/components/layout/Navigation';
import { 
  Users, Building2, History as HistoryIcon, HelpCircle
} from 'lucide-react';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { TransactionsView } from '@/components/forms/TransactionsView';
import { SetupView } from '@/components/forms/SetupView';
import { CalendarView } from '@/components/workspace/CalendarView';
import { DailyTaskView } from '@/components/workspace/DailyTaskView';
import { LearningCenterView } from '@/components/workspace/LearningCenterView';
import { HQDashboardView } from '@/features/hq-dashboard/components/HQDashboardView';
import { ReportsView } from '@/features/reports/components/ReportsView';
import { TeamManagementView } from '@/components/admin/TeamManagementView';
import { CompanySettingsView } from '@/features/company/components/CompanySettingsView';
import { PolicyCenterView } from '@/features/company/components/PolicyCenterView';
import { PlaceholderView } from '@/components/ui/PlaceholderView';
import { Toast } from '@/components/ui/Toast';
import { dataService } from '@/services/dataService';
import { configService } from '@/services/configService';
import { initialUsers, initialPages } from '@/services/mockData';
import { PayrollView } from '@/features/payroll/components/PayrollView';
import { Page, DailyLog, FBAccount, Role, User } from '@/types';
import { getFacebookPageData } from '@/utils/facebookUtils';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { LoginPage } from '@/features/auth/LoginPage';
import { personnelService } from '@/services/personnelService';

export default function CreatorApp() {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'pages' | 'accounts'>('pages');
  const [pages, setPages] = useState<Page[]>([]);
  const [accounts, setAccounts] = useState<FBAccount[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [settingsInitialTab, setSettingsInitialTab] = useState<string | undefined>(undefined);

  // Filters State
  const [selectedPage, setSelectedPage] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const policyConfig = configService.getConfig().performancePolicy;

  // Load Initial Data - Reactive to currentUser
  useEffect(() => {
    if (currentUser) {
      setPages(dataService.getPages(currentUser));
      setAccounts(dataService.getAccounts(currentUser));
      setLogs(dataService.getLogs());
      setUsers(personnelService.getAvailableUsers(currentUser.role));
    }
  }, [currentUser]);

  const handleUpdateUsers = (newUsers: User[]) => {
    // Specifically persist to the mock DB service
    newUsers.forEach(u => personnelService.saveUser(u));
    setUsers(newUsers);
  };

  if (!isAuthenticated || !currentUser) {
    return <LoginPage />;
  }

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // --- Handlers ---
  const handleSaveLogs = (newLogs: DailyLog[]) => {
    dataService.saveLogs(newLogs);
    setLogs(dataService.getLogs());
    showToast('บันทึกข้อมูลเรียบร้อย');
  };

  const handleAddPage = (pageData: Omit<Page, 'id'>) => {
    const newPage: Page = { ...pageData, id: Date.now().toString(), createdAt: new Date().toISOString() };
    dataService.savePage(newPage);
    setPages(dataService.getPages(currentUser));
    showToast('เพิ่มเพจสำเร็จ');
  };

  const handleUpdatePage = (updatedPage: Page) => {
    dataService.savePage(updatedPage);
    setPages(dataService.getPages(currentUser));
    showToast('อัปเดตข้อมูลเรียบร้อย');
  };

  const handleTrashPage = (id: string) => {
    const page = pages.find(p => p.id === id);
    if (page) {
      dataService.savePage({ ...page, isDeleted: true, deletedAt: new Date().toISOString() });
      setPages(dataService.getPages(currentUser));
      showToast('ย้ายเพจลงถังขยะเรียบร้อย');
    }
  };

  const handleRestorePage = (id: string) => {
    const page = pages.find(p => p.id === id);
    if (page) {
      dataService.savePage({ ...page, isDeleted: false, deletedAt: undefined });
      setPages(dataService.getPages(currentUser));
      showToast('กู้คืนเพจเรียบร้อย');
    }
  };

  const handlePermanentDeletePage = (id: string) => {
    dataService.deletePage(id);
    setPages(dataService.getPages(currentUser));
    setLogs(dataService.getLogs());
    showToast('ลบเพจถาวรเรียบร้อย');
  };

  const handleAddAccount = (accData: Omit<FBAccount, 'id'>) => {
    const newAcc: FBAccount = { ...accData, id: `acc-${Date.now()}`, createdAt: new Date().toISOString() };
    dataService.saveAccount(newAcc);
    setAccounts(dataService.getAccounts(currentUser));
    showToast('เพิ่มบัญชีสำเร็จ');
  };

  const handleUpdateAccount = (updatedAcc: FBAccount) => {
    dataService.saveAccount(updatedAcc);
    setAccounts(dataService.getAccounts(currentUser));
    showToast('อัปเดตบัญชีเรียบร้อย');
  };

  const handleTrashAccount = (id: string) => {
    const acc = accounts.find(a => a.id === id);
    if (acc) {
      dataService.saveAccount({ ...acc, isDeleted: true, deletedAt: new Date().toISOString() });
      setAccounts(dataService.getAccounts(currentUser));
      showToast('ย้ายบัญชีลงถังขยะเรียบร้อย');
    }
  };

  const handleRestoreAccount = (id: string) => {
    const acc = accounts.find(a => a.id === id);
    if (acc) {
      dataService.saveAccount({ ...acc, isDeleted: false, deletedAt: undefined });
      setAccounts(dataService.getAccounts(currentUser));
      showToast('กู้คืนบัญชีเรียบร้อย');
    }
  };

  const handlePermanentDeleteAccount = (id: string) => {
    dataService.deleteAccount(id);
    setAccounts(dataService.getAccounts(currentUser));
    showToast('ลบบัญชีถาวรเรียบร้อย');
  };

  const handleClearTrash = () => {
    const deletedPages = pages.filter(p => p.isDeleted);
    const deletedAccounts = accounts.filter(a => a.isDeleted);
    deletedPages.forEach(p => dataService.deletePage(p.id));
    deletedAccounts.forEach(a => dataService.deleteAccount(a.id));
    setPages(dataService.getPages(currentUser));
    setAccounts(dataService.getAccounts(currentUser));
    showToast('ล้างถังขยะเรียบร้อย');
  };

  const handleSyncPage = async (id: string, url: string) => {
    showToast('กำลังซิงค์ข้อมูลจาก Facebook...');
    const meta = await getFacebookPageData(url);
    const page = pages.find(p => p.id === id);
    if (page) {
      const updatedPage = { ...page, facebookData: meta as any };
      dataService.savePage(updatedPage);
      setPages(dataService.getPages(currentUser));
      showToast('ซิงค์ข้อมูลสำเร็จ');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-prompt">
      {toast && <Toast message={toast} />}

      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      <div className={cn(
        "flex-1 md:pl-20 flex flex-col min-h-screen relative transition-colors duration-500"
        /* 
           🛡️ THEME ISOLATION NOTE: 
           เราไม่ใส่ theme-pages/theme-accounts ที่ระดับ Global ตรงนี้แล้วนะครับ 
           เพื่อป้องกัน "สีรั่ว" (Theme Bleeding) ไปหน้าอื่น เช่น Calendar หรือ Dashboard 
           ให้แต่ละ View (เช่น SetupView) จัดการ Theme ของตัวเองภายใน Component เท่านั้น
        */
      )}>
        <MobileHeader />

        <main className="flex-1 p-4 md:p-6 text-slate-900 font-noto overflow-x-hidden">
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
              policy={policyConfig}
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
            <PolicyCenterView 
              currentUser={currentUser} 
              onNavigate={(tab, subTab) => {
                setSettingsInitialTab(subTab);
                setCurrentTab(tab);
              }}
            />
          )}

          {currentTab === 'payroll' && (currentUser.role === Role.SuperAdmin || currentUser.role === Role.Developer) && (
            <div className="space-y-10 animate-fade-in">
              <PayrollView 
                currentUser={currentUser}
                policy={policyConfig}
              />
            </div>
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
              currentUser={currentUser}
              policy={policyConfig}
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

          {currentTab === 'team' && (currentUser.role === Role.SuperAdmin || currentUser.role === Role.Admin || currentUser.role === Role.Developer) ? (
            <TeamManagementView
              users={users}
              setUsers={handleUpdateUsers}
              currentUser={currentUser}
            />
          ) : currentTab === 'team' ? (
            <PlaceholderView 
              title="Access Denied" 
              icon={Users} 
              description="You do not have permission to view Team Management." 
            />
          ) : null}

          {currentTab === 'analytics' && (currentUser.role === Role.SuperAdmin || currentUser.role === Role.Developer) && (
            <ReportsView 
              currentUser={currentUser}
              policy={policyConfig}
            />
          )}

          {currentTab === 'settings' && (
            <CompanySettingsView 
              currentUser={currentUser} 
              initialTab={settingsInitialTab as any}
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
        />
      </div>
    </div>
  );
}
