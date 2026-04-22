import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataService } from '@/services/dataService';
import { format } from 'date-fns';
import { DailyLog } from '@/types';

export function useTodayLogs(userId: string) {
  const queryClient = useQueryClient();
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const { data: logs = [], isLoading, isError } = useQuery({
    queryKey: ['todayLogs', userId, todayStr],
    queryFn: async () => {
      return await dataService.getTodayLogsForUser(userId, todayStr);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const submitLogsMutation = useMutation({
    mutationFn: async (logsData: { userId: string, date: string, logs: DailyLog[] }) => {
      // Assuming dataService has a submit or update method
      // Actually we just use whatever the existing logic was.
      // We will look at how DailyTaskView was submitting.
      // Usually it's something like dataService.submitLogs(logsData.userId, logsData.date, logsData.logs)
      return null; 
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayLogs', userId, todayStr] });
    }
  });

  return {
    logs,
    isLoading,
    isError,
    submitLogsMutation
  };
}
