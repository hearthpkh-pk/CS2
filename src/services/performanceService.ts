import { DailyLog, User, PolicyConfiguration } from '@/types';
import { isBefore, parseISO, startOfDay, endOfDay, endOfMonth, format, subDays } from 'date-fns';

export enum AttendanceStatus {
  WORKED = 'Worked',         // On time + Met Target
  LATE = 'Late Submission', // Submitted after 00:00
  INCOMPLETE = 'Incomplete',// Submitted on time but didn't meet clip target
  LEAVE = 'Leave',           // Formally requested
  ABSENT = 'Absent',         // No submission and no leave
}

export interface DayPerformance {
  date: string;
  status: AttendanceStatus;
  submissionTime?: string;
  actualClips: number;
  targetClips: number;
  attainment: number;
  isCountedAsWorkDay: boolean;
}

export const performanceService = {
  /**
   * Evaluates a single day's performance based on company rules
   */
  evaluateDay: (
    user: User,
    date: Date,
    logs: DailyLog[],
    policy: PolicyConfiguration,
    leaveRequests: any[] = [] // Future-proof for leave system
  ): DayPerformance => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayLogs = logs.filter(l => l.date === dateStr && l.staffId === user.id);
    
    // 1. Check for Leave
    const isOnLeave = leaveRequests.some(r => r.date === dateStr && r.status === 'Approved');
    if (isOnLeave) {
      return {
        date: dateStr,
        status: AttendanceStatus.LEAVE,
        actualClips: 0,
        targetClips: 0,
        attainment: 0,
        isCountedAsWorkDay: false
      };
    }

    // 2. Check for Submissions
    if (dayLogs.length === 0) {
      return {
        date: dateStr,
        status: AttendanceStatus.ABSENT,
        actualClips: 0,
        targetClips: 0,
        attainment: 0,
        isCountedAsWorkDay: false
      };
    }

    // Aggregate stats for the day
    const actualClips = dayLogs.reduce((sum, l) => sum + (l.clipsCount || 0), 0);
    const targetClips = policy.requiredPagesPerDay * policy.clipsPerPageInLog;
    const attainment = targetClips > 0 ? (actualClips / targetClips) * 100 : 0;

    // Latest submission time (to check against midnight)
    const latestLog = dayLogs.sort((a, b) => 
      new Date(b.submittedAt || b.createdAt).getTime() - new Date(a.submittedAt || a.createdAt).getTime()
    )[0];
    
    const submittedAt = new Date(latestLog.submittedAt || latestLog.createdAt);
    const deadline = endOfDay(date); // Midnight of the working day
    
    const isLate = isBefore(deadline, submittedAt);
    const metClipTarget = actualClips >= targetClips;

    // Rule 1: Deadline < 00:00
    // Rule 2: Must meet clip target
    const isCountedAsWorkDay = !isLate && metClipTarget;

    let status = AttendanceStatus.WORKED;
    if (isLate) status = AttendanceStatus.LATE;
    else if (!metClipTarget) status = AttendanceStatus.INCOMPLETE;

    return {
      date: dateStr,
      status,
      submissionTime: format(submittedAt, 'HH:mm'),
      actualClips,
      targetClips,
      attainment,
      isCountedAsWorkDay
    };
  },

  /**
   * Returns performance summary for a period (e.g., month)
   */
  getPeriodReport: (
    user: User,
    startDate: Date,
    endDate: Date,
    logs: DailyLog[],
    policy: PolicyConfiguration
  ) => {
    const performances: DayPerformance[] = [];
    let d = new Date(startDate);
    
    while (isBefore(d, endDate) || format(d, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd')) {
      performances.push(performanceService.evaluateDay(user, new Date(d), logs, policy));
      d.setDate(d.getDate() + 1);
    }

    const workedDays = performances.filter(p => p.isCountedAsWorkDay).length;
    const totalPossibleDays = performances.length;

    return {
      performances,
      summary: {
        totalWorkedDays: workedDays,
        absentDays: performances.filter(p => p.status === AttendanceStatus.ABSENT).length,
        lateDays: performances.filter(p => p.status === AttendanceStatus.LATE).length,
        incompleteDays: performances.filter(p => p.status === AttendanceStatus.INCOMPLETE).length,
        reliabilityScore: totalPossibleDays > 0 ? (workedDays / totalPossibleDays) * 100 : 0
      }
    };
  },

  /**
   * Aggregates performance for the entire year up to the given date
   */
  getYearlySummary: (
    user: User,
    year: number,
    logs: DailyLog[],
    policy: PolicyConfiguration
  ) => {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const today = new Date();
    const effectiveEndDate = today.getFullYear() === year ? today : endDate;

    const report = performanceService.getPeriodReport(user, startDate, effectiveEndDate, logs, policy);
    
    // Group by month for trend analysis
    const monthlyTrend = Array.from({ length: 12 }).map((_, month) => {
      const monthStart = new Date(year, month, 1);
      const monthEnd = endOfMonth(monthStart);
      const monthPerf = report.performances.filter(p => {
        const d = new Date(p.date);
        return d.getMonth() === month;
      });

      const worked = monthPerf.filter(p => p.isCountedAsWorkDay).length;
      return {
        month: format(monthStart, 'MMM'),
        reliability: monthPerf.length > 0 ? (worked / monthPerf.length) * 100 : 0,
        totalClips: monthPerf.reduce((sum, p) => sum + p.actualClips, 0)
      };
    });

    return {
      ...report.summary,
      monthlyTrend
    };
  },

  /**
   * Generates strict operational stats for the new Matrix View
   */
  getMonthlyOperationalStats: (
    user: User,
    month: number, // 0-11
    year: number,
    logs: DailyLog[],
    pages: any[], // Type Page[]
    policy: PolicyConfiguration,
    leaveRequests: any[] = []
  ) => {
    const startDate = new Date(year, month, 1);
    const endDate = endOfMonth(startDate);
    
    // Active pages assigned to the user
    // Assuming staffId or ownerId maps to the user
    const userPages = pages.filter(p => (p.staffId === user.id || p.ownerId === user.id) && p.status === 'Active');
    const activePagesCount = userPages.length;

    // Daily target: each active page must have 'clipsPerPageInLog' clips submitted
    const dailyTargetClips = activePagesCount * policy.clipsPerPageInLog;
    
    let totalTargetClips = 0;
    let totalValidClips = 0;
    let leaveDaysCount = 0;
    let missingClips = 0;

    const dailyDetails: any[] = [];

    // Calculate daily
    let d = new Date(startDate);
    const now = new Date();
    // Use a fixed ISO string for comparison to avoid timezone drift in local JS objects
    const todayStr = format(now, 'yyyy-MM-dd');
    const endDateStr = format(endDate, 'yyyy-MM-dd');
    
    while (isBefore(d, endDate) || format(d, 'yyyy-MM-dd') === endDateStr) {
      const dateStr = format(d, 'yyyy-MM-dd');
      // Comparison in ISO string is safer
      const isPastOrToday = dateStr <= todayStr;

      const isOnLeave = leaveRequests.some(r => r.date === dateStr && r.status === 'Approved');
      const dayLogs = logs.filter(l => l.date === dateStr && l.staffId === user.id);

      let dayTotalClips = 0;
      let dayValidClips = 0;

      if (isOnLeave) {
        leaveDaysCount++;
        dailyDetails.push({ date: dateStr, status: 'Leave', totalClips: 0, validClips: 0, target: 0, rawLogs: [] });
      } else {
        const clipsPerPage: Record<string, number> = {};
        dayLogs.forEach(l => {
          if (!clipsPerPage[l.pageId]) clipsPerPage[l.pageId] = 0;
          clipsPerPage[l.pageId] += (l.clipsCount || 0);
        });

        Object.keys(clipsPerPage).forEach(pageId => {
          const clips = Math.floor(clipsPerPage[pageId]); // Force integer
          dayTotalClips += clips;
          dayValidClips += Math.min(clips, policy.clipsPerPageInLog);
        });

        if (isPastOrToday) {
          totalTargetClips += dailyTargetClips;
          totalValidClips += dayValidClips;
          missingClips += Math.max(0, dailyTargetClips - dayValidClips);
        }

        let status = 'Work';
        if (isPastOrToday && dayLogs.length === 0) status = 'Absent';

        dailyDetails.push({
          date: dateStr,
          status,
          totalClips: dayTotalClips,
          validClips: dayValidClips,
          target: dailyTargetClips,
          missing: isPastOrToday ? Math.max(0, dailyTargetClips - dayValidClips) : 0,
          rawLogs: dayLogs
        });
      }

      d.setDate(d.getDate() + 1);
    }

    // Extract recent 3 days history (Today, Yesterday, Day Before Yesterday)
    const history3Days = [];
    for (let i = 0; i < 3; i++) {
      const targetDate = subDays(now, i);
      const targetStr = format(targetDate, 'yyyy-MM-dd');
      
      const dayDetail = dailyDetails.find(d => d.date === targetStr);
      if (dayDetail) {
        history3Days.push(dayDetail);
      } else {
        history3Days.push({ date: targetStr, status: 'N/A', totalClips: 0, validClips: 0, target: 0 });
      }
    }
    // Sort to [Day-2, Day-1, Today] for the table matrix
    history3Days.reverse();

    return {
      activePagesCount,
      dailyTargetClips,
      monthlySummary: {
        leaveDays: leaveDaysCount,
        monthlyTarget: totalTargetClips,
        totalValidClips, // Strict counted
        totalRawClips: dailyDetails.reduce((sum, d) => sum + d.totalClips, 0), // Including overages
        missingClips
      },
      history3Days,
      dailyDetails
    };
  }
};
