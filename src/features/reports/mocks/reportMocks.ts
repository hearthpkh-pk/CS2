import { Role, DailyLog, DailyReport } from '@/types';
import { subMonths, format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { initialUsers } from '@/data/mockUsers';

const departments = ['รายการ', 'หนัง', 'ข่าว'];
const groups = ['แบรนด์ 1', 'แบรนด์ 2', 'แบรนด์ 3', 'แบรนด์ 4'];
const availableTags = ['Top Performer', 'New Hire', 'Night Shift', 'Weekend Crew'];
const brandsList = ['Nike', 'Apple', 'Disney', 'Coca Cola', 'Pepsi', 'Adidas', 'Netflix', 'None'];

export const mockReports: DailyReport[] = initialUsers
  .filter(u => u.role === Role.Staff || u.role === Role.Manager)
  .map((user, i) => {
    const isComplete = Math.random() > 0.3;
    const pagesCount = 10 + (i % 11);
    const totalRequired = Math.floor(pagesCount * 0.6);
    const tags = i % 5 === 0 ? [availableTags[i % availableTags.length]] : [];
    
    return {
      id: `r-${user.id}`,
      userId: user.id,
      userName: user.name,
      date: '2026-03-27',
      brand: brandsList[i % brandsList.length],
      postCount: isComplete ? totalRequired : Math.floor(totalRequired * 0.5),
      totalPostsRequired: totalRequired,
      submissionTime: isComplete ? `${10 + Math.floor(i/4)}:${(i * 13) % 60 < 10 ? '0' : ''}${(i * 13) % 60}` : '-',
      status: isComplete ? 'Complete' : 'Pending',
      views: Math.floor(Math.random() * 5000000) + 1000000,
      pagesCount,
      isPinned: i < 3,
      department: user.department || 'รายการ',
      group: user.group || 'แบรนด์ 1',
      tags,

      // Randomized performance data
      monthlyViews: Math.floor(Math.random() * 80000000) + 20000000,
      attainmentRate: 85 + Math.floor(Math.random() * 25),
      efficiency: 7.5 + (Math.random() * 2.3),
      workDays: 20 + Math.floor(Math.random() * 6),
      offDays: Math.floor(Math.random() * 4),
      newAssetsMonth: Math.floor(Math.random() * 5),
      bannedAssetsMonth: Math.floor(Math.random() * 2),
      avgClipsPerDay: 4 + Math.random() * 6,
      issueFrequency: Math.random() * 0.2,
      avgRepairTime: 0.5 + Math.random() * 3,
      isClosed: Math.random() > 0.8,
      yearlyViews: Array.from({ length: 12 }).map(() => Math.floor(Math.random() * 80000000) + 10000000),
      yearlyLeaves: Array.from({ length: 12 }).map(() => Math.floor(Math.random() * 3)),
      yearlyActivePages: Array.from({ length: 12 }).map(() => Math.floor(Math.random() * 8) + 5),
      yearlyPosts: Array.from({ length: 12 }).map(() => Math.floor(Math.random() * 150) + 50),
      avatarUrl: user.avatarUrl
    };
  });

// Generate 3 months of logs for growth testing
const generateHistoricalLogs = (): DailyLog[] => {
  const logs: DailyLog[] = [];
  const staffIds = initialUsers
    .filter(u => u.role === Role.Staff || u.role === Role.Manager)
    .map(u => u.id);
  
  for (let m = 0; m < 3; m++) {
    const monthDate = subMonths(new Date(), m);
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const days = eachDayOfInterval({ start, end });
    
    staffIds.forEach(userId => {
      const performanceMultiplier = 1 + (m * 0.1);
      days.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        logs.push({
          id: `log-${userId}-${dateStr}`,
          staffId: userId,
          pageId: `page-dummy`,
          date: dateStr,
          followers: 12000 * performanceMultiplier + Math.random() * 1000,
          views: 60000 * performanceMultiplier + Math.random() * 40000,
          createdAt: new Date().toISOString()
        });
      });
    });
  }
  return logs;
};

export const historicalReportsLogs = generateHistoricalLogs();
