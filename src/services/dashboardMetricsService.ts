import { Page, DailyLog, PageActionRequest } from '@/types';

// TODO: Migrate to Supabase from LocalStorage/Mock
// In Production, this entire service should be replaced by a direct call to a Supabase RPC or SQL View.
// Example: const { data } = await supabase.rpc('get_dashboard_metrics', { target_year, target_month });

export interface DashboardMetricsPayload {
  // Aggregate data for top charts
  totals: {
    views: number;
    prevViews: number;
    followers: number;
    latestDayViews: number;
    latestDayFollowers: number;
  };
  chartData: Array<{ date: string; views: number; followers: number }>;
  
  // Data for Performance Matrix Table
  matrixData: Array<{
    id: string; // pageId
    name: string;
    boxId?: string | number;
    views: number;
    followers: number;
    viewsGrowth: number;
    followersGrowth: number;
    viewsWeeklyGrowth: number;
    followersWeeklyGrowth: number;
    tier: 'T1' | 'T2' | 'T3';
    shareOfMaxViews: number;
    shareOfMaxFollowers: number;
    requests?: PageActionRequest[];
  }>;

  // Data for Executive Quota Brief
  quotaData: {
    totalViews: number;
    attainment: number;
    projectedStatus: 'RED' | 'AMBER' | 'GREEN';
    projectedMoney: number;
    topPageName?: string;
    topPageId?: string;
    criticalPageName?: string;
    criticalPageId?: string;
    policy: {
      minViewTarget: number;
      penaltyAmount: number;
      bonusStep1: number;
      superBonusThreshold: number;
      bonusStep2: number;
    };
  };
}

export const aggregateDashboardMetrics = (
  pages: Page[],
  logs: DailyLog[],
  selectedYear: string,
  selectedMonth: string,
  selectedPageId: string = 'all',
  customPolicy?: DashboardMetricsPayload['quotaData']['policy']
): DashboardMetricsPayload => {
  
  // --- 1. CONFIGURATION ---
  const policy = customPolicy || {
    minViewTarget: 10000000,
    penaltyAmount: 2000,
    bonusStep1: 1000,
    superBonusThreshold: 100000000,
    bonusStep2: 1500,
  };

  // --- 2. SAFE TIMEZONE ALIGNMENT (UTC+7) ---
  // In the current JS implementation with string 'YYYY-MM-DD', we depend on string filtering to avoid shift.
  let prevMonth = "all";
  let prevYear = String(Number(selectedYear) - 1);
  if (selectedMonth !== "all") {
    const m = Number(selectedMonth);
    if (m === 1) {
      prevMonth = "12";
      prevYear = String(Number(selectedYear) - 1);
    } else {
      prevMonth = String(m - 1).padStart(2, '0');
      prevYear = selectedYear;
    }
  }

  const currentMonthLogs = logs.filter(l => {
    const parts = l.date.split('-');
    const lYear = parts[0];
    const lMonth = parts[1];
    return lYear === selectedYear && (selectedMonth === 'all' || lMonth === selectedMonth);
  });

  const prevMonthLogs = logs.filter(l => {
    const parts = l.date.split('-');
    const lYear = parts[0];
    const lMonth = parts[1];
    return lYear === prevYear && (prevMonth === 'all' || lMonth === prevMonth);
  });

  const latestDateStr = currentMonthLogs.reduce((max, log) => log.date > max ? log.date : max, currentMonthLogs[0]?.date || `${selectedYear}-01-01`);
  const latestDate = new Date(`${latestDateStr}T00:00:00Z`);
  
  const week1Start = new Date(latestDate);
  week1Start.setDate(week1Start.getDate() - 6);
  const w1Str = week1Start.toISOString().split('T')[0];

  const week2End = new Date(latestDate);
  week2End.setDate(week2End.getDate() - 7);
  const w2EndStr = week2End.toISOString().split('T')[0];

  const week2Start = new Date(latestDate);
  week2Start.setDate(week2Start.getDate() - 13);
  const w2StartStr = week2Start.toISOString().split('T')[0];

  const w1Logs = logs.filter(l => l.date >= w1Str && l.date <= latestDateStr);
  const w2Logs = logs.filter(l => l.date >= w2StartStr && l.date <= w2EndStr);

  currentMonthLogs.sort((a, b) => a.date.localeCompare(b.date));

  // --- 3. CHART & TOTALS AGGREGATION ---
  let chartData: Array<{ date: string; views: number; followers: number }> = [];
  
  const chartLogs = selectedPageId === 'all' ? currentMonthLogs : currentMonthLogs.filter(l => l.pageId === selectedPageId);

  if (selectedMonth === 'all') {
    const monthly: Record<string, { date: string; views: number; pageFollowers: Record<string, number>; count: number }> = {};
    for (let i = 0; i < 12; i++) {
      const key = `${selectedYear}-${(i + 1).toString().padStart(2, '0')}-01`;
      monthly[key] = { date: key, views: 0, pageFollowers: {}, count: 0 };
    }
    chartLogs.forEach(log => {
      const monthPart = log.date.split('-')[1];
      const key = `${selectedYear}-${monthPart}-01`;
      if (monthly[key]) {
        monthly[key].views += Math.floor(Number(log.views));
        monthly[key].pageFollowers[log.pageId] = (monthly[key].pageFollowers[log.pageId] || 0) + Math.floor(Number(log.followers));
        monthly[key].count += 1;
      }
    });

    chartData = Object.values(monthly)
      .filter(g => g.count > 0)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(g => {
        const followersSum = Object.values(g.pageFollowers).reduce((acc, val) => acc + val, 0);
        return { date: g.date, views: g.views, followers: followersSum };
      });
  } else {
    const daily: Record<string, { date: string; views: number; pageFollowers: Record<string, number> }> = {};
    chartLogs.forEach(log => {
      if (!daily[log.date]) daily[log.date] = { date: log.date, views: 0, pageFollowers: {} };
      daily[log.date].views += Math.floor(Number(log.views));
      daily[log.date].pageFollowers[log.pageId] = (daily[log.date].pageFollowers[log.pageId] || 0) + Math.floor(Number(log.followers));
    });

    chartData = Object.values(daily)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(g => {
        const followersSum = Object.values(g.pageFollowers).reduce((acc, val) => acc + val, 0);
        return { date: g.date, views: g.views, followers: followersSum };
      });
  }

  const totalViews = chartData.reduce((acc, d) => acc + d.views, 0);
  const currentFollowers = chartData.length > 0 ? chartData[chartData.length - 1].followers : 0;
  
  const latestChartDateStr = chartLogs.reduce((max, log) => log.date > max ? log.date : max, chartLogs[0]?.date || '');
  const latestChartLogs = chartLogs.filter(l => l.date === latestChartDateStr);
  const latestDayViews = latestChartLogs.reduce((acc, log) => acc + Number(log.views || 0), 0);
  const latestDayFollowers = latestChartLogs.reduce((acc, log) => acc + Number(log.followers || 0), 0);


  // Calculate Portfolio Followers: Sum of all daily Gains in this period
  const totalFollowersSum = chartData.reduce((acc, d) => acc + d.followers, 0);

  const totals = {
    views: Math.floor(totalViews),
    prevViews: Math.floor(totalViews * 0.85), // Mock comparison
    followers: Math.floor(totalFollowersSum),
    latestDayViews: Math.floor(latestDayViews),
    latestDayFollowers: Math.floor(latestDayFollowers)
  };

  // --- 4. MATRIX & QUOTA AGGREGATION ---
  const stats: Record<string, { views: number; followers: number; prevMonthViews: number; prevMonthFollowers: number; w1Views: number; w1Followers: number; w2Views: number; w2Followers: number }> = {};
  pages.forEach(p => {
    stats[p.id] = { views: 0, followers: 0, prevMonthViews: 0, prevMonthFollowers: 0, w1Views: 0, w1Followers: 0, w2Views: 0, w2Followers: 0 };
  });

  currentMonthLogs.forEach(l => {
    if (stats[l.pageId]) {
      stats[l.pageId].views += Number(l.views || 0);
      stats[l.pageId].followers += Number(l.followers || 0);
    }
  });


  prevMonthLogs.forEach(l => {
    if (stats[l.pageId]) {
      stats[l.pageId].prevMonthViews += Number(l.views || 0);
      stats[l.pageId].prevMonthFollowers = Math.max(stats[l.pageId].prevMonthFollowers, Number(l.followers || 0));
    }
  });

  w1Logs.forEach(l => {
    if (stats[l.pageId]) {
      stats[l.pageId].w1Views += Number(l.views || 0);
      stats[l.pageId].w1Followers = Math.max(stats[l.pageId].w1Followers, Number(l.followers || 0));
    }
  });
  
  w2Logs.forEach(l => {
    if (stats[l.pageId]) {
      stats[l.pageId].w2Views += Number(l.views || 0);
      stats[l.pageId].w2Followers = Math.max(stats[l.pageId].w2Followers, Number(l.followers || 0));
    }
  });

  const maxViews = Math.max(...Object.values(stats).map(s => s.views), 1);
  const maxFollowers = Math.max(...Object.values(stats).map(s => s.followers), 1);

  const matrixData = pages.map(p => {
    const pStats = stats[p.id];
    const views = pStats?.views || 0;
    const followers = pStats?.followers || 0;
    
    const viewsGrowth = views > 0 && pStats.prevMonthViews > 0 ? ((views - pStats.prevMonthViews) / pStats.prevMonthViews) * 100 : 0;
    const followersGrowth = followers > 0 && pStats.prevMonthFollowers > 0 ? ((followers - pStats.prevMonthFollowers) / pStats.prevMonthFollowers) * 100 : 0;
    const viewsWeeklyGrowth = pStats.w1Views > 0 && pStats.w2Views > 0 ? ((pStats.w1Views - pStats.w2Views) / pStats.w2Views) * 100 : 0;
    const followersWeeklyGrowth = pStats.w1Followers > 0 && pStats.w2Followers > 0 ? ((pStats.w1Followers - pStats.w2Followers) / pStats.w2Followers) * 100 : 0;

    let tier: 'T1' | 'T2' | 'T3' = 'T3';
    if (views >= maxViews * 0.6) tier = 'T1';
    else if (views >= maxViews * 0.2) tier = 'T2';

    return {
      id: p.id,
      name: p.name,
      boxId: p.boxId,
      views,
      followers,
      viewsGrowth,
      followersGrowth,
      viewsWeeklyGrowth,
      followersWeeklyGrowth,
      tier,
      shareOfMaxViews: (views / maxViews) * 100,
      shareOfMaxFollowers: (followers / maxFollowers) * 100,
      requests: p.requests
    };
  }).sort((a, b) => b.views - a.views);

  // --- 5. RAG & FINANCIAL PROJECTIONS ---
  const portfolioTotalViews = currentMonthLogs.reduce((acc, log) => acc + Number(log.views || 0), 0);
  const attainment = Math.min((portfolioTotalViews / policy.minViewTarget) * 100, 200);
  let projectedStatus: 'RED' | 'AMBER' | 'GREEN' = 'RED';
  let projectedMoney = 0;

  const currentMilestoneM = Math.floor(portfolioTotalViews / 10000000);
  
  if (portfolioTotalViews < policy.minViewTarget) {
    projectedStatus = portfolioTotalViews >= (policy.minViewTarget * 0.5) ? 'AMBER' : 'RED';
    projectedMoney = -policy.penaltyAmount;
  } else {
    projectedStatus = 'GREEN';
    
    // Milestone-Gate Logic: Bonus starts only for 10M-milestones ABOVE Target
    const minTargetM = policy.minViewTarget / 1000000;
    if (currentMilestoneM * 10 > minTargetM) {
      const rate = portfolioTotalViews >= policy.superBonusThreshold ? policy.bonusStep2 : policy.bonusStep1;
      projectedMoney = currentMilestoneM * rate;
    } else {
      projectedMoney = 0;
    }
  }

  // --- NEW PORTFOLIO HEALTH ALGORITHM ---
  let topPageId: string | undefined = undefined;
  let topPageName: string | undefined = undefined;
  let maxScore = -1;

  let criticalPageId: string | undefined = undefined;
  let criticalPageName: string | undefined = undefined;
  let maxSeverityScore = -1;
  let worstWeeklyGrowth = 9999;

  matrixData.forEach(page => {
    // 1. Top Performing Asset (Champion & Rising Star)
    if (page.views > 0 || page.viewsGrowth > 0) {
      const volumeScore = page.shareOfMaxViews / 100;
      const velocityScore = Math.min(Math.max((page.viewsGrowth || 0) / 500, 0), 1);
      const compositeScore = (velocityScore * 0.6) + (volumeScore * 0.4);

      if (compositeScore > maxScore) {
        maxScore = compositeScore;
        topPageId = page.id;
        topPageName = page.name;
      }
    }

    // 2. Critical Watchlist (Shadowbanned, Bleeder, Zombie)
    let severity = 0;
    if ((page.viewsWeeklyGrowth || 0) <= -50) {
      severity = 3; // Shadowbanned
    } else if ((page.viewsWeeklyGrowth || 0) <= -15 && (page.viewsGrowth || 0) < 0) {
      severity = 2; // Bleeder
    } else if (page.shareOfMaxViews <= 10 && (page.viewsWeeklyGrowth || 0) <= 5) {
      severity = 1; // Zombie
    }

    if (severity > 0) {
      if (severity > maxSeverityScore || (severity === maxSeverityScore && (page.viewsWeeklyGrowth || 0) < worstWeeklyGrowth)) {
        maxSeverityScore = severity;
        worstWeeklyGrowth = (page.viewsWeeklyGrowth || 0);
        criticalPageId = page.id;
        criticalPageName = page.name;
      }
    }
  });

  return {
    totals,
    chartData,
    matrixData,
    quotaData: {
      totalViews: portfolioTotalViews,
      attainment,
      projectedStatus,
      projectedMoney,
      topPageName,
      topPageId,
      criticalPageName,
      criticalPageId,
      policy
    }
  };
};
