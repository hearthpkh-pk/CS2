import { Page, DailyLog, FBAccount, User } from "../types";
import { initialPages, generateMockLogs, initialAccounts, initialUsers } from "./mockData";

const STORAGE_KEYS = {
  PAGES: 'cs_pages',
  LOGS: 'cs_logs',
  ACCOUNTS: 'cs_accounts'
};

export const dataService = {
  // --- Pages ---
  getPages: (user?: User): Page[] => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(STORAGE_KEYS.PAGES);
    let pages: Page[] = [];
    
    if (!saved) {
      pages = initialPages;
      localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(pages));
    } else {
      pages = JSON.parse(saved);
    }

    // RBAC Scoping
    if (!user || user.role === 'Super Admin') return pages;
    if (user.role === 'Admin' || user.role === 'Manager') {
      return pages.filter(p => p.teamId === user.teamId || p.ownerId === user.id);
    }
    // Staff
    return pages.filter(p => p.ownerId === user.id);
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
  getAccounts: (user?: User): FBAccount[] => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    let accounts: FBAccount[] = [];

    if (!saved) {
      accounts = initialAccounts;
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    } else {
      accounts = JSON.parse(saved);
    }

    // RBAC Scoping
    if (!user || user.role === 'Super Admin') return accounts;
    if (user.role === 'Admin' || user.role === 'Manager') {
      return accounts.filter(a => a.teamId === user.teamId || a.ownerId === user.id);
    }
    // Staff
    return accounts.filter(a => a.ownerId === user.id);
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
      
      const logToSave: DailyLog = {
        ...nLog,
        source: nLog.source || 'Manual',
        isManual: nLog.isManual ?? true,
        createdAt: nLog.createdAt || new Date().toISOString()
      };

      if (existingIndex >= 0) {
        logs[existingIndex] = logToSave;
      } else {
        logs.push(logToSave);
      }
    });
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  },

  // --- Users ---
  getUsers: (requestingUser?: User): User[] => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('cs_users');
    let users: User[] = [];

    if (!saved) {
      users = initialUsers;
      localStorage.setItem('cs_users', JSON.stringify(users));
    } else {
      users = JSON.parse(saved);
    }

    // RBAC Scoping for User Management
    if (!requestingUser || requestingUser.role === 'Super Admin') return users;
    if (requestingUser.role === 'Admin') {
      // Admins manage same or lower roles in their team
      return users.filter(u => u.teamId === requestingUser.teamId);
    }
    return []; // Others can't see user list
  },

  saveUser: (user: User): void => {
    const users = dataService.getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem('cs_users', JSON.stringify(users));
  }
};
