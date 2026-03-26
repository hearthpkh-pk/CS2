import { User, Page, DailyLog, Role, PolicyConfiguration } from '@/types';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export interface FinancialMetric {
  userId: string;
  userName: string;
  baseSalary: number;
  totalViews: number;
  bonus: number;
  penalty: number;
  netPay: number;
  attainmentPercentage: number;
}

export interface GrowthMetric {
  label: string;
  currentValue: number;
  previousValue: number;
  growthPercentage: number;
}

export interface ReportsData {
  period: string;
  financials: FinancialMetric[];
  growth: {
    views: GrowthMetric;
    followers: GrowthMetric;
    assets: GrowthMetric;
  };
  teamBreakdown: {
    teamName: string;
    totalViews: number;
    avgAttainment: number;
  }[];
}

export const reportsService = {
  getMonthlyReport: (
    currentUser: User,
    allUsers: User[],
    allPages: Page[],
    allLogs: DailyLog[],
    policy: PolicyConfiguration,
    targetMonth: string,
    targetYear: string
  ): ReportsData => {
    
    // 1. Scoping (RBAC)
    let scopedUsers = allUsers.filter(u => u.role !== Role.SuperAdmin);
    if (currentUser.role === Role.Manager) {
      scopedUsers = scopedUsers.filter(u => u.teamId === currentUser.teamId);
    } else if (currentUser.role === Role.Staff) {
      scopedUsers = [currentUser];
    }

    const currentMonthPrefix = `${targetYear}-${targetMonth}`;
    const prevMonthPrefix = format(subMonths(new Date(parseInt(targetYear), parseInt(targetMonth) - 1), 1), 'yyyy-MM');

    // 2. Financial Calculations (Precise)
    const financials: FinancialMetric[] = scopedUsers.map(user => {
      const userLogs = allLogs.filter(l => l.staffId === user.id && l.date.startsWith(currentMonthPrefix));
      const totalViews = userLogs.reduce((sum, l) => sum + l.views, 0);
      
      let bonus = 0;
      let penalty = 0;

      if (totalViews < policy.minViewTarget) {
        penalty = policy.penaltyAmount;
      } else if (totalViews >= policy.superBonusThreshold) {
        bonus = policy.bonusStep2;
      } else if (totalViews >= policy.minViewTarget) {
        bonus = policy.bonusStep1;
      }

      const baseSalary = user.salary || 0;
      const netPay = baseSalary + bonus - penalty;
      const attainmentPercentage = policy.minViewTarget > 0 ? (totalViews / policy.minViewTarget) * 100 : 0;

      return {
        userId: user.id,
        userName: user.name,
        baseSalary,
        totalViews,
        bonus,
        penalty,
        netPay,
        attainmentPercentage
      };
    });

    // 3. Growth Analytics
    const calculateGrowth = (metric: 'views' | 'followers' | 'assets'): GrowthMetric => {
      let currentVal = 0;
      let prevVal = 0;

      if (metric === 'views') {
        currentVal = allLogs.filter(l => l.date.startsWith(currentMonthPrefix)).reduce((sum, l) => sum + l.views, 0);
        prevVal = allLogs.filter(l => l.date.startsWith(prevMonthPrefix)).reduce((sum, l) => sum + l.views, 0);
      } else if (metric === 'followers') {
        // High-water mark for current month vs prev month
        currentVal = allLogs.filter(l => l.date.startsWith(currentMonthPrefix)).reduce((sum, l) => sum + l.followers, 0);
        prevVal = allLogs.filter(l => l.date.startsWith(prevMonthPrefix)).reduce((sum, l) => sum + l.followers, 0);
      } else {
        currentVal = allPages.filter(p => !p.isDeleted).length;
        prevVal = currentVal; // Static for mock
      }

      const growthPercentage = prevVal > 0 ? ((currentVal - prevVal) / prevVal) * 100 : 0;
      
      return {
        label: metric.charAt(0).toUpperCase() + metric.slice(1),
        currentValue: currentVal,
        previousValue: prevVal,
        growthPercentage
      };
    };

    return {
      period: currentMonthPrefix,
      financials,
      growth: {
        views: calculateGrowth('views'),
        followers: calculateGrowth('followers'),
        assets: calculateGrowth('assets')
      },
      teamBreakdown: [] // Simplified for now
    };
  }
};
