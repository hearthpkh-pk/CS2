import { DailyReport, mockReports } from '../mocks/reportMocks';

/**
 * Service to handle all logic for Executive Reports.
 * Separated from UI to ensure "Bulletproof" modularity.
 */
export const reportService = {
  /**
   * Get reports for a specific date (defaults to today)
   */
  getDailyStatus: (date: string = '2026-03-27'): DailyReport[] => {
    return mockReports.filter(r => r.date === date);
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
  }
};
