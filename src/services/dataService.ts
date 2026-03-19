import { Page, DailyLog, FBAccount } from "../types";
import { initialPages, generateMockLogs, initialAccounts } from "./mockData";

const STORAGE_KEYS = {
  PAGES: 'cs_pages',
  LOGS: 'cs_logs',
  ACCOUNTS: 'cs_accounts'
};

export const dataService = {
  // --- Pages ---
  getPages: (): Page[] => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(STORAGE_KEYS.PAGES);
    if (!saved) {
      const initial = initialPages;
      localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(saved);
  },

  savePage: (page: Page): void => {
    const pages = dataService.getPages();
    const existingIndex = pages.findIndex(p => p.id === page.id);
    if (existingIndex >= 0) {
      pages[existingIndex] = page;
    } else {
      pages.push(page);
    }
    localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(pages));
  },

  deletePage: (id: string): void => {
    const pages = dataService.getPages().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(pages));
    
    // Also cleanup logs for this page
    const logs = dataService.getLogs().filter(l => l.pageId !== id);
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  },

  // --- Accounts ---
  getAccounts: (): FBAccount[] => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!saved) {
      const initial = initialAccounts;
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(saved);
  },

  saveAccount: (account: FBAccount): void => {
    const accounts = dataService.getAccounts();
    const existingIndex = accounts.findIndex(a => a.id === account.id);
    if (existingIndex >= 0) {
      accounts[existingIndex] = account;
    } else {
      accounts.push(account);
    }
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  },

  deleteAccount: (id: string): void => {
    const accounts = dataService.getAccounts().filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  },

  // --- Logs ---
  getLogs: (): DailyLog[] => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!saved) {
      const pages = dataService.getPages();
      const initialLogs = generateMockLogs(pages);
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(initialLogs));
      return initialLogs;
    }
    return JSON.parse(saved);
  },

  saveLogs: (newLogs: DailyLog[]): void => {
    const logs = dataService.getLogs();
    newLogs.forEach(nLog => {
      const existingIndex = logs.findIndex(l => l.pageId === nLog.pageId && l.date === nLog.date);
      if (existingIndex >= 0) {
        logs[existingIndex] = nLog;
      } else {
        logs.push(nLog);
      }
    });
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }
};
