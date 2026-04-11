import { useMemo } from 'react';
import { User, Page, DailyLog, Role, PolicyConfiguration } from '@/types';
import { format, subDays } from 'date-fns';
import { hqDashboardService } from '@/features/hq-dashboard/services/hqDashboardService';

export const useMobileDashboardData = (
  currentUser: User,
  allPages: Page[],
  allUsers: User[],
  allLogs: DailyLog[],
  policy: PolicyConfiguration
) => {
  const todayDate = new Date();
  const currentMonthString = format(todayDate, 'MM');
  const currentYearString = format(todayDate, 'yyyy');

  // Shared Logic Core
  const sharedMetrics = useMemo(() => {
    return hqDashboardService.getMetrics(
      currentUser,
      allUsers,
      allPages,
      [], // accounts
      allLogs,
      policy,
      currentMonthString,
      currentYearString
    );
  }, [currentUser, allUsers, allPages, allLogs, policy, currentMonthString, currentYearString]);

  // Rolling Dates for UI (Day-2, Day-1, Today)
  const rollingDates = useMemo(() => {
    return [2, 1, 0].map(i => {
      const d = subDays(todayDate, i);
      const dayMap: Record<string, string> = { 'Mon':'จ.','Tue':'อ.','Wed':'พ.','Thu':'พฤ.','Fri':'ศ.','Sat':'ส.','Sun':'อา.' };
      return {
        dateString: format(d, 'yyyy-MM-dd'),
        dayNameShort: dayMap[format(d, 'E')] || format(d, 'E'),
        dayNum: format(d, 'dd')
      };
    });
  }, []);

  // Hybrid Data (Merged Shared Metrics + Daily Local State)
  const staffData = useMemo(() => {
    const activeStaff = allUsers.filter(u => u.role !== Role.SuperAdmin && u.isActive !== false);

    return activeStaff.map(user => {
      // Get shared data representation
      const lbEntry = sharedMetrics.leaderboard.find(l => l.userId === user.id);
      const monthlyViewsSum = lbEntry ? lbEntry.totalViews : 0;
      const formatter = new Intl.NumberFormat('en', { notation: 'compact', compactDisplay: 'short' });
      const monthlyViewsStr = formatter.format(monthlyViewsSum);

      const userPages = allPages.filter(p => p.ownerId === user.id && !p.isDeleted && p.status === 'Active');
      const totalPages = userPages.length;
      
      const todayDateStr = rollingDates[2].dateString;
      const countUpdatedToday = userPages.filter(p => 
        allLogs.some(l => l.pageId === p.id && l.date === todayDateStr)
      ).length;

      const history = rollingDates.map(dObj => {
        const logsForDay = allLogs.filter(l => l.staffId === user.id && l.date === dObj.dateString);
        const isComplete = userPages.length > 0 && logsForDay.length >= userPages.length;
        const isInProgress = logsForDay.length > 0 && logsForDay.length < userPages.length;
        
        let status = 'pending';
        if (isComplete) status = 'completed';
        else if (isInProgress) status = 'in-progress';
        else if (dObj.dateString !== todayDateStr) status = 'risk'; 

        return { ...dObj, status };
      });

      const pageDetails = userPages.map(p => {
        const logToday = allLogs.find(l => l.pageId === p.id && l.date === todayDateStr);
        return {
          id: p.id,
          name: p.name,
          boxId: p.boxId || 0,
          followers: p.facebookData?.followers ? formatter.format(p.facebookData.followers) : '-',
          status: logToday ? 'completed' : 'pending',
          time: logToday?.createdAt ? format(new Date(logToday.createdAt), 'HH:mm') : '-',
          todayViews: logToday?.views ? formatter.format(logToday.views) : '-',
          link: p.facebookUrl || p.url || '#',
          color: 'from-blue-500 to-indigo-600'
        };
      });

      // Sort by Box ID ascending
      pageDetails.sort((a, b) => a.boxId - b.boxId);

      return {
        id: user.id,
        name: user.name,
        role: user.role,
        avatar: user.name.charAt(user.name.length - 1).toUpperCase(),
        totalPages,
        updatedToday: countUpdatedToday,
        monthlyViewsStr,
        monthlyViewsSum,
        history,
        pageDetails,
        riskCount: history.filter(h => h.status === 'risk').length
      };
    }); // Removed the .filter(s => s.totalPages > 0 || s.monthlyViewsSum > 0) to ensure ALL active users show up.
  }, [allUsers, allPages, allLogs, rollingDates, sharedMetrics]);

  return {
    sharedMetrics,
    staffData,
    rollingDates
  };
};
