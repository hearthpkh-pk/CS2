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

export interface HQDashboardMetrics {
  scope: 'Company' | 'Team' | 'Personal';
  totalUsersInScope: number;
  totalTeamTarget: number;
  actualTotalViews: number;
  attainmentPercentage: number;
  leaderboard: LeaderboardEntry[];
  riskRadar: RiskRadarEntry[];
  assets: Page[];
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

    return {
      scope,
      totalUsersInScope: staffInScope.length,
      totalTeamTarget,
      actualTotalViews,
      attainmentPercentage,
      leaderboard,
      riskRadar,
      assets: scopedPages
    };
  }
};
