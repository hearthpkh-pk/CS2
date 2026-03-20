'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar, MobileHeader, MobileBottomNav } from '@/components/layout/Navigation';
import { Users, CreditCard } from 'lucide-react';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { TransactionsView } from '@/components/forms/TransactionsView';
import { SetupView } from '@/components/forms/SetupView';
import { Toast } from '@/components/ui/Toast';
import { dataService } from '@/services/dataService';
import { initialUsers } from '@/services/mockData';
import { Page, DailyLog, FBAccount, User } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function CreatorApp() {
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]); // Default to Super Admin for dev
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
            />
          )}

          {currentTab === 'transactions' && (
            <TransactionsView 
              pages={pages} 
              logs={logs} 
              onSave={handleSaveLogs} 
            />
          )}

          {currentTab === 'setup' && (
            <SetupView 
              viewMode={viewMode}
              setViewMode={setViewMode}
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

          {currentTab === 'payroll' && (
             <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
                <CreditCard size={64} className="mb-4 opacity-20" />
                <h3 className="text-xl font-bold text-slate-600">Payroll System</h3>
                <p className="text-sm">Available only for Super Admin</p>
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
