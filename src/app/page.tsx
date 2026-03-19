'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar, MobileHeader, MobileBottomNav } from '@/components/layout/Navigation';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { TransactionsView } from '@/components/forms/TransactionsView';
import { SetupView } from '@/components/forms/SetupView';
import { Toast } from '@/components/ui/Toast';
import { dataService } from '@/services/dataService';
import { Page, DailyLog } from '@/types';

export default function CreatorApp() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [pages, setPages] = useState<Page[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  // Filters State (Stored here for Dashboard)
  const [selectedPage, setSelectedPage] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Load Initial Data
  useEffect(() => {
    setPages(dataService.getPages());
    setLogs(dataService.getLogs());
  }, []);

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

  const handleAddPage = (name: string) => {
    const newPage: Page = {
      id: Date.now().toString(),
      name,
      category: 'อื่นๆ',
      status: 'Active'
    };
    dataService.savePage(newPage);
    setPages(dataService.getPages());
    showToast('เพิ่มเพจสำเร็จ');
  };

  const handleDeletePage = (id: string) => {
    dataService.deletePage(id);
    setPages(dataService.getPages());
    setLogs(dataService.getLogs());
    showToast('ลบเพจเรียบร้อย');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-prompt">
      {toast && <Toast message={toast} />}

      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <div className="flex-1 md:ml-72 flex flex-col min-h-screen relative">
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
              pages={pages} 
              onAdd={handleAddPage} 
              onDelete={handleDeletePage} 
            />
          )}
        </main>

        <MobileBottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />
      </div>
    </div>
  );
}
