import { Page, DailyLog, FBAccount, User } from "../types";

export const initialUsers: User[] = [
  { id: 'u-super', name: 'Super Admin HQ', role: 'Super Admin', username: 'super' },
  { id: 'u-admin', name: 'Admin Operations', role: 'Admin', teamId: 'team-a', username: 'admin' },
  { id: 'u-mgr-a', name: 'Team Lead Alpha', role: 'Manager', teamId: 'team-a', username: 'manager' },
  { id: 'u-staff-a1', name: 'Staff A1', role: 'Staff', teamId: 'team-a', username: 'staff1' },
  { id: 'u-staff-a2', name: 'Staff A2', role: 'Staff', teamId: 'team-a', username: 'staff2' },
];

export const initialAccounts: FBAccount[] = [
  { id: 'acc-1', boxId: 1, name: 'สมชาย คมกริบ', uid: '100012345678', status: 'Live', ownerId: 'u-staff-a1', teamId: 'team-a', password: 'password123', twoFactor: 'ABCD 1234 EFGH 5678' },
  { id: 'acc-2', boxId: 2, name: 'Wichai Manee', uid: '100098765432', status: 'Check', ownerId: 'u-staff-a2', teamId: 'team-a' },
  { id: 'acc-3', boxId: 3, name: 'Somsak Backup', uid: '100055554444', status: 'Die', ownerId: 'u-staff-a1', teamId: 'team-a' },
  { id: 'acc-admin-1', boxId: 0, name: 'Main Admin FB', uid: '100088889999', status: 'Admin', ownerId: 'u-admin', teamId: 'team-a' },
];

export const initialPages: Page[] = [
  { id: '1', name: 'กิ้งก่าทอง มาร์เก็ตติ้ง', category: 'หมวดบันเทิง', status: 'Active', boxId: 1, ownerId: 'u-staff-a1', teamId: 'team-a' },
  { id: '2', name: 'Healthy Life TH', category: 'หมวดสุขภาพ', status: 'Rest', boxId: 1, ownerId: 'u-staff-a1', teamId: 'team-a' },
  { id: '3', name: 'Tech Inside', category: 'หมวดเทคโนโลยี', status: 'Problem', boxId: 2, ownerId: 'u-staff-a2', teamId: 'team-a' },
  { id: '4', name: 'News Today', category: 'ข่าว', status: 'Active', boxId: 3, ownerId: 'u-staff-a2', teamId: 'team-a' },
];

export const generateMockLogs = (pages: Page[]): DailyLog[] => {
  const logs: DailyLog[] = [];
  const today = new Date();
  for (let i = 90; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    pages.forEach(p => {
      let baseFollowers = 10000 + parseInt(p.id) * 5000;
      let baseViews = 5000 + parseInt(p.id) * 2000;
      logs.push({
        id: `log-${p.id}-${dateStr}`,
        pageId: p.id,
        date: dateStr,
        followers: baseFollowers + ((90 - i) * 150) + Math.floor(Math.random() * 500),
        views: baseViews + Math.floor(Math.random() * 5000)
      });
    });
  }
  return logs;
};
