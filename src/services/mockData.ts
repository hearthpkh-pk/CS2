import { Page, FBAccount, User, Role, LeaveRequest, CalendarEvent, DailyLog } from '../types';

export const initialUsers: User[] = [
  { id: 'u1', name: 'Super Admin', role: Role.SuperAdmin, username: 'admin' },
  { id: 'u2', name: 'Admin A', role: Role.Admin, teamId: 'team1', username: 'admin_a' },
  { id: 'u3', name: 'Manager B', role: Role.Manager, teamId: 'team1', username: 'manager_b' },
  { id: 'u4', name: 'Staff C1', role: Role.Staff, teamId: 'team1', username: 'staff_c1' },
  { id: 'u5', name: 'Staff C2', role: Role.Staff, teamId: 'team1', username: 'staff_c2' },
];

export const initialAccounts: FBAccount[] = [
  { id: 'acc-1', boxId: 1, name: 'สมชาย คมกริบ', uid: '100012345678', status: 'Live', ownerId: 'u-staff-a1', teamId: 'team-a', password: 'password123', twoFactor: 'ABCD 1234 EFGH 5678' },
  { id: 'acc-2', boxId: 2, name: 'Wichai Manee', uid: '100098765432', status: 'Check', ownerId: 'u-staff-a2', teamId: 'team-a' },
  { id: 'acc-3', boxId: 3, name: 'Somsak Backup', uid: '100055554444', status: 'Die', ownerId: 'u-staff-a1', teamId: 'team-a' },
  { id: 'acc-admin-1', boxId: 0, name: 'Main Admin FB', uid: '100088889999', status: 'Admin', ownerId: 'u-admin', teamId: 'team-a' },
];

export const initialPages: Page[] = [
  { 
    id: '1', 
    name: 'กิ้งก่าทอง มาร์เก็ตติ้ง', 
    category: 'หมวดบันเทิง', 
    status: 'Active', 
    boxId: 1, 
    ownerId: 'u-staff-a1', 
    teamId: 'team-a',
    facebookUrl: 'https://www.facebook.com/GoldenLizard',
    facebookData: {
      profilePic: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=400&q=80',
      description: 'เพจกิ้งก่าทอง มาร์เก็ตติ้ง - รวมคลิปฮา คลิปเด็ดประจำวัน',
      followers: 45200,
      lastSyncAt: new Date().toISOString()
    }
  },
  { 
    id: '2', 
    name: 'Healthy Life TH', 
    category: 'หมวดสุขภาพ', 
    status: 'Rest', 
    boxId: 1, 
    ownerId: 'u-staff-a1', 
    teamId: 'team-a',
    facebookUrl: 'https://www.facebook.com/HealthyLifeTH',
    facebookData: {
      profilePic: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=400&q=80',
      description: 'แชร์เคล็ดลับสุขภาพดี วิถีไทย',
      followers: 12800,
      lastSyncAt: new Date().toISOString()
    }
  },
  { 
    id: '3', 
    name: 'Tech Inside', 
    category: 'หมวดเทคโนโลยี', 
    status: 'Problem', 
    boxId: 2, 
    ownerId: 'u-staff-a2', 
    teamId: 'team-a',
    facebookUrl: 'https://www.facebook.com/TechInside',
    facebookData: {
      profilePic: 'https://images.unsplash.com/photo-1614850523011-8f49ffc73908?w=400&q=80',
      description: 'อัปเดตข่าวสารไอทีแบบเจาะลึก',
      followers: 34500,
      lastSyncAt: new Date().toISOString()
    }
  },
  { 
    id: '4', 
    name: 'ข่าวช่วยชาวบ้าน - News', 
    category: 'ข่าว', 
    status: 'Active', 
    boxId: 1, 
    ownerId: 'u-staff-a2', 
    teamId: 'team-a',
    facebookUrl: 'https://www.facebook.com/profile.php?id=6156035931587',
    facebookData: {
      profilePic: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&q=80',
      description: 'ข่าวช่วยชาวบ้าน เราช่วยเหลือสังคม พร้อมร่วมช่วยเหลืออย่างจริงใจ ที่นี่ที่เดียวจริง',
      followers: 450000,
      lastSyncAt: new Date().toISOString()
    }
  },
];

export const generateMockLogs = (pages: Page[]): DailyLog[] => {
  const logs: DailyLog[] = [];
  const today = new Date();
  for (let i = 90; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    pages.forEach(p => {
      const baseFollowers = 10000 + parseInt(p.id) * 5000;
      const baseViews = 5000 + parseInt(p.id) * 2000;
      logs.push({
        id: `log-${p.id}-${dateStr}`,
        pageId: p.id,
        staffId: p.ownerId || 'u1', // Default to Super Admin for mock
        date: dateStr,
        followers: baseFollowers + ((90 - i) * 150) + Math.floor(Math.random() * 500),
        views: baseViews + Math.floor(Math.random() * 5000),
        source: 'API',
        createdAt: new Date().toISOString()
      });
    });
  }
  return logs;
};

export const initialLeaveRequests: LeaveRequest[] = [
  {
    id: 'l1',
    staffId: 'u4',
    staffName: 'Staff C1',
    startDate: '2026-03-25T00:00:00.000Z',
    endDate: '2026-03-26T00:00:00.000Z',
    type: 'Sick',
    reason: 'เป็นไข้หวัดใหญ่ครับ',
    status: 'Pending',
    createdAt: new Date().toISOString()
  }
];

export const initialCalendarEvents: CalendarEvent[] = [
  { id: 'h1', date: '2026-04-13', title: 'Songkran Festival', type: 'Holiday' },
  { id: 'h2', date: '2026-04-14', title: 'Songkran Festival', type: 'Holiday' },
  { id: 'h3', date: '2026-04-15', title: 'Songkran Festival', type: 'Holiday' },
  { id: 'd1', date: '2026-03-20', title: 'วัน 2 แรง (แคมเปญใหญ่)', type: 'DoublePay' },
  { id: 'd2', date: '2026-03-21', title: 'วัน 2 แรง (แคมเปญใหญ่)', type: 'DoublePay' }
];
