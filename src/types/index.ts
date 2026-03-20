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
