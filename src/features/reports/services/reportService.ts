import { Role, User, Page, DailyLog, PolicyConfiguration, DailyReport, FinancialMetric, GrowthMetric, ReportsData } from '@/types';
import { format, subMonths } from 'date-fns';
import { mockReports } from '../mocks/reportMocks';

/**
 * Service to handle all logic for Executive Reports.
 * Separated from UI to ensure "Bulletproof" modularity.
 */
export const reportService = {
  /**
   * Get reports for a specific date (defaults to today)
   * Scoped by User role
   */
  getDailyStatus: (user?: User, date: string = '2026-03-27'): DailyReport[] => {
    if (!user) return [];
    if (user.role === Role.Developer) return [];
    
    const allReports = mockReports.filter(r => r.date === date);
    
    // In a real app, we would also filter by department/team here for Admins/Managers
    return allReports;
  },

  /**
   * Get specific details for a staff member
   */
  getStaffDetail: (reportId: string): DailyReport | undefined => {
    return mockReports.find(r => r.id === reportId);
  },

  /**
   * Helper to determine status color based on completion
   * Returns Tailwind color classes (Stroke only - No BG)
   */
  getStatusColor: (status: DailyReport['status']) => {
    switch (status) {
      case 'Complete': return 'text-emerald-500 border-emerald-200';
      case 'Pending': return 'text-amber-500 border-amber-200';
      case 'Missing': return 'text-red-500 border-red-200';
      default: return 'text-slate-400 border-slate-100';
    }
  },

  /**
   * Get historical monthly report with financial metrics
   * (Consolidated from reportsService)
   */
  getMonthlyReport: (
    currentUser: User,
    allUsers: User[],
    allPages: Page[],
    allLogs: DailyLog[],
    policy: PolicyConfiguration,
    targetMonth: string,
    targetYear: string
  ): ReportsData => {
    // RBAC Scoping for Developer Sandbox
    if (currentUser.role === Role.Developer) {
      return {
        period: `${targetYear}-${targetMonth}`,
        financials: [],
        growth: {
          views: { label: 'Views', currentValue: 0, previousValue: 0, growthPercentage: 0 },
          followers: { label: 'Followers', currentValue: 0, previousValue: 0, growthPercentage: 0 },
          assets: { label: 'Assets', currentValue: 0, previousValue: 0, growthPercentage: 0 }
        },
        teamBreakdown: []
      };
    }

    let scopedUsers = allUsers.filter(u => u.role !== Role.SuperAdmin);
    if (currentUser.role === Role.Manager) {
      scopedUsers = scopedUsers.filter(u => u.teamId === currentUser.teamId);
    } else if (currentUser.role === Role.Staff) {
      scopedUsers = [currentUser];
    }

    const currentMonthPrefix = `${targetYear}-${targetMonth}`;
    const prevMonthPrefix = format(subMonths(new Date(parseInt(targetYear), parseInt(targetMonth) - 1), 1), 'yyyy-MM');

    const financials: FinancialMetric[] = scopedUsers.map(user => {
      const userLogs = allLogs.filter(l => l.staffId === user.id && l.date.startsWith(currentMonthPrefix));
      const totalViews = userLogs.reduce((sum, l) => sum + l.views, 0);
      
      let bonus = 0;
      let penalty = 0;

      // 🛡️ Bulletproof Protection: หาก policy ยังไม่มา (Async) ป้องกันการแครช
      const minViewTarget = policy?.minViewTarget ?? 5000000;
      const penaltyAmount = policy?.penaltyAmount ?? 0;
      const superBonusThreshold = policy?.superBonusThreshold ?? 100000000;
      const bonusStep1 = policy?.bonusStep1 ?? 0;
      const bonusStep2 = policy?.bonusStep2 ?? 0;

      if (totalViews < minViewTarget) {
        penalty = penaltyAmount;
      } else if (totalViews >= superBonusThreshold) {
        bonus = bonusStep2;
      } else if (totalViews >= minViewTarget) {
        bonus = bonusStep1;
      }

      const baseSalary = user.salary || 0;
      const netPay = baseSalary + bonus - penalty;
      const attainmentPercentage = minViewTarget > 0 ? (totalViews / minViewTarget) * 100 : 0;

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

    const calculateGrowth = (metric: 'views' | 'followers' | 'assets'): GrowthMetric => {
      let currentVal = 0;
      let prevVal = 0;

      if (metric === 'views') {
        currentVal = allLogs.filter(l => l.date.startsWith(currentMonthPrefix)).reduce((sum, l) => sum + l.views, 0);
        prevVal = allLogs.filter(l => l.date.startsWith(prevMonthPrefix)).reduce((sum, l) => sum + l.views, 0);
      } else if (metric === 'followers') {
        currentVal = allLogs.filter(l => l.date.startsWith(currentMonthPrefix)).reduce((sum, l) => sum + l.followers, 0);
        prevVal = allLogs.filter(l => l.date.startsWith(prevMonthPrefix)).reduce((sum, l) => sum + l.followers, 0);
      } else {
        currentVal = allPages.filter(p => !p.isDeleted).length;
        prevVal = currentVal;
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
      teamBreakdown: []
    };
  }
};
