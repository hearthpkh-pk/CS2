import { User, Page, FBAccount, DailyLog, Role, PolicyConfiguration } from '@/types';

export interface LeaderboardEntry {
  userId: string;
  name: string;
  teamId?: string;
  totalViews: number;
  viewsGrowth: number;
  pagesCount: number;
  projectedBonus?: number;
  penaltyRisk?: number;
  avatarUrl?: string;
}

export interface RiskRadarEntry {
  entityId: string;
  entityName: string;
  type: 'Page' | 'Account';
  issueType: 'Status Problem' | 'Admin Flag';
  severity: 'High' | 'Medium';
  assigneeName: string;
  message?: string;
}

export interface CategoryPerformance {
  category: string;
  totalViews: number;
  pageCount: number;
  avgViewsPerPage: number;
}

export interface BrandPerformance {
  brand: string;
  totalViews: number;
  staffCount: number;
  avgViewsPerStaff: number;
}

export interface AssetHealthSummary {
  pages: { status: string; count: number }[];
  accounts: { status: string; count: number }[];
}

export interface HQDashboardMetrics {
  scope: 'Company' | 'Team' | 'Personal';
  totalUsersInScope: number;
  totalTeamTarget: number;
  actualTotalViews: number;
  attainmentPercentage: number;
  leaderboard: LeaderboardEntry[];
  riskRadar: RiskRadarEntry[];
  assets: Page[];
  categoryPerformance: CategoryPerformance[];
  brandPerformance: BrandPerformance[];
  assetHealth: AssetHealthSummary;
}

export const hqDashboardService = {
  getMetrics: (
    currentUser: User,
    allUsers: User[],
    allPages: Page[],
    allAccounts: FBAccount[],
    allLogs: DailyLog[],
    policy: PolicyConfiguration,
    targetMonth: string,
    targetYear: string
  ): HQDashboardMetrics => {
    
    let scopedUsers = [...allUsers];
    let scopedPages = [...allPages];
    let scopedAccounts = [...allAccounts];
    let scope: 'Company' | 'Team' | 'Personal' = 'Company';

    if (currentUser.role === Role.SuperAdmin || currentUser.role === Role.Admin) {
      scope = 'Company';
    } else if (currentUser.role === Role.Manager) {
      scope = 'Team';
      scopedUsers = allUsers.filter(u => u.teamId === currentUser.teamId);
      scopedPages = allPages.filter(p => scopedUsers.some(u => u.id === p.ownerId));
      scopedAccounts = allAccounts.filter(a => scopedUsers.some(u => u.id === a.ownerId));
    } else {
      scope = 'Personal';
      scopedUsers = [currentUser];
      scopedPages = allPages.filter(p => p.ownerId === currentUser.id);
      scopedAccounts = allAccounts.filter(a => a.ownerId === currentUser.id);
    }

    const staffInScope = scopedUsers.filter(u => u.role !== Role.SuperAdmin);
    const monthPrefix = `${targetYear}-${targetMonth}`;
    const currentMonthLogs = allLogs.filter(log => log.date.startsWith(monthPrefix));

    const leaderboard: LeaderboardEntry[] = staffInScope.map(staff => {
      const myPages = scopedPages.filter(p => p.ownerId === staff.id);
      const myLogs = currentMonthLogs.filter(l => l.staffId === staff.id);
      const totalViews = myLogs.reduce((sum, log) => sum + log.views, 0);
      
      return {
        userId: staff.id,
        name: staff.name,
        teamId: staff.teamId,
        totalViews,
        viewsGrowth: 0,
        pagesCount: myPages.length,
        avatarUrl: staff.avatarUrl,
      };
    });

    leaderboard.sort((a, b) => b.totalViews - a.totalViews);

    const totalTeamTarget = staffInScope.length * policy.minViewTarget;
    const actualTotalViews = leaderboard.reduce((sum, l) => sum + l.totalViews, 0);
    const attainmentPercentage = totalTeamTarget > 0 ? (actualTotalViews / totalTeamTarget) * 100 : 0;

    const riskRadar: RiskRadarEntry[] = [];
    scopedPages.forEach(page => {
      if (page.status === 'Problem' || page.status === 'Error') {
        const owner = staffInScope.find(s => s.id === page.ownerId);
        riskRadar.push({
          entityId: page.id,
          entityName: page.name,
          type: 'Page',
          issueType: 'Status Problem',
          severity: 'High',
          assigneeName: owner?.name || 'Unknown',
          message: 'พบปัญหาในเพจ กรุณาตรวจสอบ'
        });
      }
    });

    const categoryMap: Record<string, { views: number, pages: Set<string> }> = {};
    
    // First, count pages per category
    scopedPages.forEach(p => {
      const cat = p.category || 'Other';
      if (!categoryMap[cat]) categoryMap[cat] = { views: 0, pages: new Set() };
      categoryMap[cat].pages.add(p.id);
    });

    currentMonthLogs.forEach(log => {
      const page = scopedPages.find(p => p.id === log.pageId);
      if (page) {
        const cat = page.category || 'Other';
        if (!categoryMap[cat]) categoryMap[cat] = { views: 0, pages: new Set() };
        categoryMap[cat].views += log.views;
      }
    });

    const categoryPerformance: CategoryPerformance[] = Object.keys(categoryMap).map(cat => {
      const data = categoryMap[cat];
      return {
        category: cat,
        totalViews: data.views,
        pageCount: data.pages.size,
        avgViewsPerPage: data.pages.size > 0 ? data.views / data.pages.size : 0
      };
    }).sort((a, b) => b.totalViews - a.totalViews);

    // Brand Performance logic
    const brandMap: Record<string, { views: number, staff: Set<string> }> = {};
    staffInScope.forEach(u => {
      const b = u.brand || 'Unassigned';
      if (!brandMap[b]) brandMap[b] = { views: 0, staff: new Set() };
      brandMap[b].staff.add(u.id);
    });

    currentMonthLogs.forEach(log => {
      const u = staffInScope.find(s => s.id === log.staffId);
      if (u) {
        const b = u.brand || 'Unassigned';
        if (!brandMap[b]) brandMap[b] = { views: 0, staff: new Set() };
        brandMap[b].views += log.views;
      }
    });

    const brandPerformance: BrandPerformance[] = Object.keys(brandMap).map(b => {
      const data = brandMap[b];
      return {
        brand: b,
        totalViews: data.views,
        staffCount: data.staff.size,
        avgViewsPerStaff: data.staff.size > 0 ? data.views / data.staff.size : 0
      };
    }).sort((a, b) => b.totalViews - a.totalViews);

    const assetHealth: AssetHealthSummary = {
      pages: [],
      accounts: []
    };
    
    const pageStatusMap: Record<string, number> = {};
    scopedPages.forEach(p => {
      if (!p.isDeleted) {
        pageStatusMap[p.status] = (pageStatusMap[p.status] || 0) + 1;
      }
    });
    assetHealth.pages = Object.keys(pageStatusMap).map(s => ({ status: s, count: pageStatusMap[s] }));

    const accStatusMap: Record<string, number> = {};
    scopedAccounts.forEach(a => {
      if (!a.isDeleted) {
        accStatusMap[a.status] = (accStatusMap[a.status] || 0) + 1;
      }
    });
    assetHealth.accounts = Object.keys(accStatusMap).map(s => ({ status: s, count: accStatusMap[s] }));

    return {
      scope,
      totalUsersInScope: staffInScope.length,
      totalTeamTarget,
      actualTotalViews,
      attainmentPercentage,
      leaderboard,
      riskRadar,
      assets: scopedPages,
      categoryPerformance,
      brandPerformance,
      assetHealth
    };
  }
};
