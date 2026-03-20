export enum Role {
  Staff = 'Staff',
  Manager = 'Manager',
  Admin = 'Admin',
  SuperAdmin = 'Super Admin'
}

export type LeaveType = 'Sick' | 'Vacation' | 'Personal' | 'Business';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  staffId: string;
  staffName: string;
  startDate: string; // ISO
  endDate: string; // ISO
  type: LeaveType;
  reason: string;
  status: LeaveStatus;
  createdAt: string;
  approvedBy?: string;
}

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: 'Holiday' | 'DoublePay' | 'WorkSent' | 'Leave';
  status?: LeaveStatus;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  teamId?: string;
  username: string;
}

export interface Page {
  id: string;
  name: string;
  url?: string;
  category: 'รายการ' | 'หนัง' | 'ข่าว' | string;
  status: 'Active' | 'Rest' | 'Error' | 'Problem';
  adminIds?: string[];
  boxId: number; // 1-20
  ownerId?: string; // Links to User.id
  teamId?: string;  // Links to User.teamId
  createdAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface DailyLog {
  id: string;
  pageId: string;
  staffId: string; // Attributed to
  date: string;    // YYYY-MM-DD
  followers: number;
  views: number;
  reach?: number;
  engagement?: number;
  statusAtTime?: string; // Captured status on that day
  isManual?: boolean;    // True if entered by staff
  source?: 'API' | 'CSV' | 'Manual';
  createdAt: string;
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
  status: 'Live' | 'Check' | 'Die' | 'Admin';
  ownerId?: string; // Links to User.id
  teamId?: string;  // Links to User.teamId
  password?: string;
  twoFactor?: string;
  email?: string;
  emailPassword?: string;
  email2?: string;
  profileUrl?: string;
  cookie?: string;
  createdAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface DailySubmission {
  id: string;
  staffId: string;
  date: string;
  pageId: string;
  videoLinks: string[]; // ปกติ 4 ลิงก์ต่อเพจ
  createdAt: string;
}

export interface PolicyConfiguration {
  minViewTarget: number;
  penaltyAmount: number;
  bonusStep1: number;
  superBonusThreshold: number;
  bonusStep2: number;
  requiredPagesPerDay: number;
  clipsPerPageInLog: number;
}

export interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: 'Mandatory' | 'Technical';
  thumbnailUrl: string;
  videoUrl: string; // Embed URL or Raw Link
  tags: string[]; // e.g., 'Google Sheets', 'Premiere Pro'
  priority: number; // 0 (Low) to 10 (High)
  isNew?: boolean;
  createdAt: string;
}
