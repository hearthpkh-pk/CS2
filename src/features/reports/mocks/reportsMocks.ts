import { DailyLog, User, Page, Role } from '@/types';
import { subMonths, format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { allMockUsers, mockDashboardPages } from '../../hq-dashboard/mocks/dashboardMocks';

// Generate 3 months of logs for growth testing
const generateHistoricalLogs = (): DailyLog[] => {
  const logs: DailyLog[] = [];
  const staff = allMockUsers.filter(u => u.role === Role.Staff);
  
  // Last 3 months (Current, -1, -2)
  for (let m = 0; m < 3; m++) {
    const monthDate = subMonths(new Date(), m);
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    
    const days = eachDayOfInterval({ start, end });
    
    staff.forEach(user => {
      // Base performance grows or shrinks slightly per month to show trends
      const performanceMultiplier = 1 + (m * 0.1); // Older months performed less

      days.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        logs.push({
          id: `log-${user.id}-${dateStr}`,
          staffId: user.id,
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
