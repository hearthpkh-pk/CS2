import { Page, FBAccount, User, Role, LeaveRequest, CalendarEvent, DailyLog } from '../types';

import { initialUsers } from '../data/mockUsers';
export { initialUsers };

export const initialAccounts: FBAccount[] = [
  { id: 'acc-1', boxId: 1, name: 'สมชาย คมกริบ', uid: '100012345678', status: 'Live', ownerId: 'u-staff-a1', teamId: 'team-a', password: 'password123', twoFactor: 'ABCD 1234 EFGH 5678' },
  { id: 'acc-2', boxId: 2, name: 'Wichai Manee', uid: '100098765432', status: 'Check', ownerId: 'u-staff-a2', teamId: 'team-a' },
  { id: 'acc-3', boxId: 3, name: 'Somsak Backup', uid: '100055554444', status: 'Die', ownerId: 'u-staff-b1', teamId: 'team-b' },
  { id: 'acc-admin-1', boxId: 0, name: 'Main Admin FB', uid: '100088889999', status: 'Admin', ownerId: 'u-adm1' },
];

export const initialPages: Page[] = [
  { 
    id: 'p1', 
    name: 'ข่าวช่วยชาวบ้าน - News', 
    category: 'ข่าว', 
    status: 'Active', 
    boxId: 1, 
    ownerId: 'u-staff-a1', 
    teamId: 'team-a',
    facebookUrl: 'https://www.facebook.com/profile.php?id=6156035931587',
    facebookData: {
      profilePic: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&q=80',
      description: 'ข่าวช่วยชาวบ้าน เราช่วยเหลือสังคม',
      followers: 450000,
      lastSyncAt: new Date().toISOString()
    }
  },
  { 
    id: 'p2', 
    name: 'สถานการณ์รายวัน (Daily)', 
    category: 'ข่าว', 
    status: 'Active', 
    boxId: 1, 
    ownerId: 'u-staff-a2', 
    teamId: 'team-a',
    // Example of a page with an active warning/request flag from an Admin
    requests: [
      {
        id: 'req-1',
        type: 'Warning',
        message: 'ยอดวิวร่วงหนัก 2 สัปดาห์ติด หาสาเหตุและปรับรูปแบบด่วน',
        requestedBy: 'u-sa1',
        status: 'Pending',
        createdAt: new Date().toISOString()
      }
    ]
  },
  { 
    id: 'p3', 
    name: 'บันเทิงไทย ฮาฮา', 
    category: 'รายการ', 
    status: 'Rest', 
    boxId: 2, 
    ownerId: 'u-staff-b1', 
    teamId: 'team-b',
  },
  { 
    id: 'p4', 
    name: 'เรื่องเล่าชาวเน็ต', 
    category: 'รายการ', 
    status: 'Problem', 
    boxId: 2, 
    ownerId: 'u-staff-b2', 
    teamId: 'team-b',
    requests: [
      {
        id: 'req-2',
        type: 'Flag',
        message: 'เพจโดนปิดการมองเห็น ให้พักการลงคลิปไปก่อน 3 วัน',
        requestedBy: 'u-adm1',
        status: 'Pending',
        createdAt: new Date().toISOString()
      }
    ]
  },
  { 
    id: 'p5', 
    name: 'คลิปตลกสุดจัดปลัดบอก', 
    category: 'รายการ', 
    status: 'Active', 
    boxId: 3, 
    ownerId: 'u-staff-b3', 
    teamId: 'team-b',
  },
  { 
    id: 'p6', 
    name: 'โปรเจกต์พิเศษ (Manager A)', 
    category: 'รายการ', 
    status: 'Active', 
    boxId: 1, 
    ownerId: 'u-mgr-a', 
    teamId: 'team-a',
  },
  { 
    id: 'p7', 
    name: 'เพจของ Admin 1', 
    category: 'ข่าว', 
    status: 'Active', 
    boxId: 1, 
    ownerId: 'u-adm1',
  },
  // Add some generic pages for the rest of the staff
  ...Array.from({ length: 10 }).map((_, i) => ({
    id: `p-gen-${i}`,
    name: `เพจคอนเทนต์ทั่วไป ${i + 1}`,
    category: i % 2 === 0 ? 'ข่าว' : 'รายการ',
    status: i % 4 === 0 ? 'Rest' : 'Active' as any,
    boxId: 1,
    ownerId: i < 6 ? `u-staff-a${i + 1}` : `u-staff-b${i - 5}`,
    teamId: i < 6 ? 'team-a' : 'team-b',
  }))
];

export const generateMockLogs = (pages: Page[]): DailyLog[] => {
  const logs: DailyLog[] = [];
  const today = new Date();
  for (let i = 90; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    pages.forEach(p => {
      // Dynamic generation based on page attributes to simulate Rising Stars / Zombies
      const multiplier = p.id === 'p1' ? 8000 : p.id === 'p5' ? 12000 : 2000;
      let baseFollowers = 5000 + (parseInt(p.id.replace(/\D/g, '') || '1') * 1000);
      let baseViews = multiplier;

      // Make p2 drop drastically recently
      if (p.id === 'p2' && i < 14) {
        baseViews = 500;
      }
      // Make p5 surge recently (Rising Star)
      if (p.id === 'p5' && i < 5) {
        baseViews = 35000;
      }

      logs.push({
        id: `log-${p.id}-${dateStr}`,
        pageId: p.id,
        staffId: p.ownerId || 'u-sa1',
        date: dateStr,
        followers: baseFollowers + ((90 - i) * 50) + Math.floor(Math.random() * 100),
        views: baseViews + Math.floor(Math.random() * (multiplier * 0.2)), // 20% variance
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
    staffId: 'u-staff-a1',
    staffName: 'Staff A1',
    startDate: '2026-03-25T00:00:00.000Z',
    endDate: '2026-03-26T00:00:00.000Z',
    type: 'Sick',
    reason: 'เป็นไข้หวัดใหญ่ครับ',
    status: 'Recorded',
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
