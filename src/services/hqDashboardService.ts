import { User, Page, FBAccount, DailyLog, Role, PolicyConfiguration } from '@/types';

// Interfaces for HQ Dashboard Return Data
export interface LeaderboardEntry {
  userId: string;
  name: string;
  teamId?: string;
  totalViews: number;
  viewsGrowth: number;
  pagesCount: number;
  projectedBonus?: number; // Stripped for Manager
  penaltyRisk?: number; // Stripped for Manager
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
    
    // ------------------------------------------------------------------
    // 1. RLS (Row-Level Security) Simulation
    // ------------------------------------------------------------------
    let scopedUsers = [...allUsers];
    let scopedPages = [...allPages];
    let scopedAccounts = [...allAccounts];
    let scope: 'Company' | 'Team' | 'Personal' = 'Company';

    if (currentUser.role === Role.SuperAdmin || currentUser.role === Role.Admin) {
      // Full Access
      scope = 'Company';
    } else if (currentUser.role === Role.Manager) {
      // Team Access Only
      scope = 'Team';
      scopedUsers = allUsers.filter(u => u.teamId === currentUser.teamId);
      scopedPages = allPages.filter(p => scopedUsers.some(u => u.id === p.ownerId));
      scopedAccounts = allAccounts.filter(a => scopedUsers.some(u => u.id === a.ownerId));
    } else {
      // Personal Access Only
      scope = 'Personal';
      scopedUsers = [currentUser];
      scopedPages = allPages.filter(p => p.ownerId === currentUser.id);
      scopedAccounts = allAccounts.filter(a => a.ownerId === currentUser.id);
    }

    // Include all employees (Staff, Manager, Admin) but exclude Super Admins from the quota denominator and leaderboard
    const staffInScope = scopedUsers.filter(u => u.role !== Role.SuperAdmin);
    
    // ------------------------------------------------------------------
    // 2. Data Aggregation (Time Scoped)
    // ------------------------------------------------------------------
    const currentMonthLogs = allLogs.filter(log => log.date.startsWith(`${targetYear}-${targetMonth}`));

    // Leaderboard Calculation
    let leaderboard: LeaderboardEntry[] = staffInScope.map(staff => {
      const myPages = scopedPages.filter(p => p.ownerId === staff.id);
      const myLogs = currentMonthLogs.filter(l => l.staffId === staff.id);
      
      const totalViews = myLogs.reduce((sum, log) => sum + log.views, 0);
      
      // Calculate projected money based on total views vs minViewTarget
      let projectedBonus = 0;
      let penaltyRisk = 0;

      if (totalViews < policy.minViewTarget) {
        penaltyRisk = policy.penaltyAmount;
      } else if (totalViews >= policy.superBonusThreshold) {
        projectedBonus = policy.bonusStep2;
      } else if (totalViews >= policy.minViewTarget) {
        projectedBonus = policy.bonusStep1;
      }

      // Money Stripping constraint: Managers should NOT see money!
      if (currentUser.role === Role.Manager) {
        projectedBonus = 0;
        penaltyRisk = 0;
      }

      return {
        userId: staff.id,
        name: staff.name,
        teamId: staff.teamId,
        totalViews,
        viewsGrowth: 0, // Simplified for mock leaderboard
        pagesCount: myPages.length,
        projectedBonus: currentUser.role === Role.Manager ? undefined : projectedBonus,
        penaltyRisk: currentUser.role === Role.Manager ? undefined : penaltyRisk,
      };
    });

    // Sort leaderboard by views descending
    leaderboard.sort((a, b) => b.totalViews - a.totalViews);

    // ------------------------------------------------------------------
    // 3. Rollup Metrics
    // ------------------------------------------------------------------
    const totalTeamTarget = staffInScope.length * policy.minViewTarget;
    const actualTotalViews = leaderboard.reduce((sum, l) => sum + l.totalViews, 0);
    const attainmentPercentage = totalTeamTarget > 0 ? (actualTotalViews / totalTeamTarget) * 100 : 0;

    // ------------------------------------------------------------------
    // 4. Risk Radar Aggregation
    // ------------------------------------------------------------------
    const riskRadar: RiskRadarEntry[] = [];

    // Check Pages for explicit requests or bad status
    scopedPages.forEach(page => {
      const owner = staffInScope.find(s => s.id === page.ownerId);

      // Condition A: Admins flagged the page
      if (page.requests && page.requests.length > 0) {
        page.requests.filter(req => req.status === 'Pending').forEach(req => {
          riskRadar.push({
            entityId: page.id,
            entityName: page.name,
            type: 'Page',
            issueType: 'Admin Flag',
            severity: 'High',
            assigneeName: owner?.name || 'Unknown',
            message: req.message
          });
        });
      }

      // Condition B: Bad Status
      if (page.status === 'Problem' || page.status === 'Error') {
        riskRadar.push({
          entityId: page.id,
          entityName: page.name,
          type: 'Page',
          issueType: 'Status Problem',
          severity: 'High',
          assigneeName: owner?.name || 'Unknown',
          message: 'เพจถูกจำกัดการเข้าถึงหรือติดปัญหาร้ายแรง'
        });
      }
    });

    // Check Accounts for bad status
    scopedAccounts.forEach(acc => {
      if (acc.status === 'Die' || acc.status === 'Check') {
        const owner = staffInScope.find(s => s.id === acc.ownerId);
        riskRadar.push({
          entityId: acc.id,
          entityName: acc.name,
          type: 'Account',
          issueType: 'Status Problem',
          severity: acc.status === 'Die' ? 'High' : 'Medium',
          assigneeName: owner?.name || 'Unknown',
          message: acc.status === 'Die' ? 'บัญชีโดนแบนถาวร' : 'บัญชีติดยืนยันตัวตน'
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
