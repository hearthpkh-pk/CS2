export interface Page {
  id: string;
  name: string;
  category: string;
  status: 'Active' | 'Rest' | 'Problem';
}

export interface DailyLog {
  id: string;
  pageId: string;
  date: string; // ISO format: YYYY-MM-DD
  followers: number;
  views: number;
}

export interface DashboardStats {
  totalFollowers: number;
  totalViews: number;
  viewsTrend: number; // percentage
}
