import { User, Page, FBAccount, DailyLog, Role } from '@/types';
import { subDays, format } from 'date-fns';

// Generate 20 Users
const brands = ['Samsung', 'Apple', 'Nike', 'Adidas', 'Coca-Cola', 'Pepsi', 'Toyota', 'Honda', "L'Oreal", 'Estée Lauder'];

export const mockDashboardUsers: User[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `staff-${i + 1}`,
  username: `staff_user_${i + 1}`,
  name: `Executive Staff ${i + 1}`,
  role: Role.Staff,
  teamId: i < 10 ? 'Team Alpha' : 'Team Beta',
  brand: brands[i % brands.length],
  isActive: true,
  avatarUrl: `https://i.pravatar.cc/150?u=${i + 1}`
}));

// Add Admin & Super Admin
const mockAdmins: User[] = [
  {
    id: 'admin-1',
    username: 'admin',
    name: 'Senior Admin',
    role: Role.Admin,
    teamId: 'Central',
    brand: 'Corporate',
    isActive: true
  },
  {
    id: 'super-1',
    username: 'superadmin',
    name: 'Executive Super Admin',
    role: Role.SuperAdmin,
    teamId: 'Executive',
    brand: 'Corporate',
    isActive: true
  }
];

export const allMockUsers = [...mockDashboardUsers, ...mockAdmins];

// Generate 400 Pages (20 per staff)
export const mockDashboardPages: Page[] = mockDashboardUsers.flatMap((user, userIdx) => 
  Array.from({ length: 20 }).map((_, pageIdx) => ({
    id: `page-${userIdx}-${pageIdx}`,
    name: `Enterprise Page ${userIdx * 20 + pageIdx + 1}`,
    category: pageIdx % 3 === 0 ? 'Entertainment' : 'News',
    status: (userIdx + pageIdx) % 15 === 0 ? 'Problem' : 'Active',
    ownerId: user.id,
    staffId: user.id,
    boxId: (pageIdx % 20) + 1,
    fbId: `fb-${userIdx}-${pageIdx}`,
    isDeleted: false,
    createdAt: new Date().toISOString()
  }))
);

// Generate Daily Logs for the last 30 days for metrics
const generateLogs = (): DailyLog[] => {
  const logs: DailyLog[] = [];
  const today = new Date();
  
  mockDashboardUsers.forEach(user => {
    const userPages = mockDashboardPages.filter(p => p.staffId === user.id && p.status === 'Active');
    
    for (let d = 0; d < 30; d++) {
      const date = subDays(today, d);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Randomly skip (Absent/Leave)
      const rand = Math.random();
      if (rand > 0.95) continue; // Absent

      const isLate = Math.random() > 0.9; // 10% Late
      
      // For each page, generate clips
      userPages.forEach((page, pIdx) => {
        // Randomly skip some pages for some days (Incomplete)
        if (Math.random() > 0.9) return;

        const clipsCount = Math.random() > 0.8 ? 6 : 4; // Target is 4, sometimes they do more
        
        logs.push({
          id: `log-${user.id}-${page.id}-${dateStr}`,
          staffId: user.id,
          pageId: page.id,
          date: dateStr,
          followers: 1000 + Math.random() * 500,
          views: 5000 + Math.random() * 15000,
          clipsCount,
          createdAt: `${dateStr}T10:00:00Z`,
          submittedAt: isLate ? `${dateStr}T00:45:00Z` : `${dateStr}T21:30:00Z`,
        });
      });
    }
  });
  
  return logs;
};

export const mockDashboardLogs = generateLogs();

export const mockDashboardAccounts: FBAccount[] = mockDashboardUsers.map(user => ({
  id: `acc-${user.id}`,
  name: `Business Manager ${user.name}`,
  status: 'Live',
  ownerId: user.id,
  boxId: 1,
  uid: `uid-${user.id}`,
  createdAt: new Date().toISOString()
}));
