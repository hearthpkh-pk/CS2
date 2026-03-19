export interface Page {
  id: string;
  name: string;
  url?: string;
  category: 'รายการ' | 'หนัง' | 'ข่าว' | string;
  status: 'Active' | 'Rest' | 'Error' | 'Problem';
  boxId: number; // 1-20
  createdAt?: string;
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
export interface FBAccount {
  id: string;
  boxId: number;
  name: string;
  uid: string;
  status: 'Live' | 'Check' | 'Die';
  password?: string;
  twoFactor?: string;
  cookie?: string;
  createdAt?: string;
}
