export enum Role {
  Staff = 'Staff',
  Manager = 'Manager',
  Admin = 'Admin',
  SuperAdmin = 'Super Admin',
  Developer = 'Developer'
}

export type LeaveType = 'Sick' | 'Vacation' | 'Personal' | 'Business';
// Leave doesn't require approval; it's recorded and forwarded to Super Admin
// for acknowledgment and payroll calculation.
export type LeaveStatus = 'Recorded' | 'Cancelled';

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
  acknowledgedBy?: string; // Super Admin who reviewed it
  acknowledgedAt?: string; // When it was reviewed
}

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: 'Holiday' | 'DoublePay' | 'WorkSent' | 'Leave';
  status?: LeaveStatus;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
}

export interface SalaryAdjustment {
  id: string;
  newSalary: number;
  reason: string; // e.g. Promotion, added JD
  effectiveDate: string; // YYYY-MM-DD
  createdAt: string;
}

export interface User {
  id: string;
  name: string; // Code Name
  role: Role;
  teamId?: string;
  brand?: string; // Advertising brand assigned to this user
  username: string; // Used as display ID or secondary login
  email?: string; // System Login Email
  temporaryPassword?: string;
  salary?: number; // Integer (Baht)
  salaryHistory?: SalaryAdjustment[]; // Log of all salary changes
  startDate?: string; // YYYY-MM-DD (Enlistment Date)
  probationDate?: string; // YYYY-MM-DD (Clearance Date)
  phone?: string;
  lineId?: string;
  status?: 'Pending' | 'Probation' | 'Official' | 'Resigned';
  department?: string; // แผนก: รายการ, หนัง, ข่าว
  group?: string; // กลุ่มงาน: แบรนด์ 1 - 4
  bankName?: string;
  bankAccount?: string;
  permissions?: string[]; // Array of module keys e.g. ['dashboard', 'setup', 'hq-dashboard']
  isActive?: boolean;
  avatarUrl?: string;
  sortOrder?: number; // ลำดับการแสดงผลแบบ Manual (ยิ่งน้อยยิ่งอยู่บน)
}

export interface FacebookPageMeta {
  profilePic?: string;
  description?: string;
  followers?: number;
  lastSyncAt: string;
}

export type PageStatus = 'Active' | 'Rest' | 'Error' | 'Problem';

export interface PageActionRequest {
  id: string;
  type: 'Flag' | 'Note' | 'Warning';
  message: string;
  requestedBy: string; // Links to User.id (SA/Admin)
  status: 'Pending' | 'Acknowledged' | 'Resolved';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string; // Links to User.id (Staff)
}

export interface Page {
  id: string;
  name: string;
  url?: string;
  category: 'รายการ' | 'หนัง' | 'ข่าว' | string;
  status: PageStatus;
  adminIds?: string[];
  boxId: number; // 1-20
  ownerId?: string; // Links to User.id
  teamId?: string;  // Links to User.teamId
  createdAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  adType?: 'Lead' | 'Message' | 'Conversion'; // Added as optional, assuming not all pages have this
  managerId?: string; // Added as optional
  staffId?: string; // Added as optional
  accountId?: string; // ID of the Business Account it belongs to // Added as optional
  lastUpdated?: string; // Added as optional
  facebookUrl?: string;
  facebookData?: FacebookPageMeta;
  notes?: string;
  requests?: PageActionRequest[];
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
  source?: 'API' | 'CSV' | 'Manual' | string;
  clipsCount?: number;    // Number of clips submitted
  links?: string[];      // Array of video URLs
  submittedAt?: string;  // Timestmap of final submission
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
  rawText?: string;
  notes?: string;
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

export interface GroupPolicy {
  groupId: string; // e.g., 'News', 'Movies', 'Shows'
  minPagesPerDay: number;
  minClipsPerPage: number;
}

export interface PolicyConfiguration {
  minViewTarget: number;
  penaltyAmount: number;
  bonusStep1: number;
  superBonusThreshold: number;
  bonusStep2: number;
  requiredPagesPerDay: number; // Global default
  clipsPerPageInLog: number;    // Global default
  groupPolicies?: GroupPolicy[]; // Overrides for specific groups
}

export interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  duration: string; // Helpful for planning training time
  category: 'Mandatory' | 'Technical';
  thumbnailUrl: string;
  videoUrl: string; // Embed URL
  tags: string[];
  priority: number; // 1-10
  isNew?: boolean;
  createdAt: string;
}

export interface LearningProgress {
  userId: string;
  videoId: string;
  status: 'Started' | 'Completed';
  lastWatchedAt: string;
  percentComplete: number;
}

export interface DailyReport {
  id: string;
  userId: string;
  userName: string;
  date: string;
  brand: string;
  postCount: number;
  totalPostsRequired: number;
  submissionTime: string;
  status: 'Complete' | 'Pending' | 'Missing';
  views: number;
  pagesCount: number;
  isPinned: boolean;
  department: string;
  group: string;
  tags: string[];
  
  // Performance Audit Metrics
  monthlyViews: number;
  attainmentRate: number;
  efficiency: number;
  workDays: number;
  offDays: number;
  newAssetsMonth: number;
  bannedAssetsMonth: number;
  avgClipsPerDay: number;
  issueFrequency: number;
  avgRepairTime: number;
  isClosed: boolean;
  yearlyViews: number[];
  yearlyLeaves: number[];
  yearlyActivePages: number[];
  yearlyPosts: number[];
  avatarUrl?: string;
  sortOrder?: number; // ลำดับการแสดงผลแบบ Manual
}

export interface FinancialMetric {
  userId: string;
  userName: string;
  baseSalary: number;
  totalViews: number;
  bonus: number;
  penalty: number;
  netPay: number;
  attainmentPercentage: number;
}

export interface GrowthMetric {
  label: string;
  currentValue: number;
  previousValue: number;
  growthPercentage: number;
}

export interface PublicHoliday {
  id: string;
  name: string;
  date: string; // MM-DD for recurring or YYYY-MM-DD for one-time
  multiplier: number; // e.g. 2.0 for 2x Pay
  isRecurring: boolean; // if true, ignore year (recurring every year)
}

// --- Company Configuration ---
export interface Brand {
  id: string;
  name: string;
  icon?: string;
  isActive: boolean;
}

export interface CompanyRule {
  id: string;
  title: string;
  content: string;
  category: 'General' | 'Finance' | 'Safety' | 'Compliance' | 'Operation' | 'Other';
  order: number;
  targetRoles?: Role[];
  targetGroups?: string[];
  lastUpdated: string;
}

export interface GroupDefinition {
  id: string; // e.g., 'news', 'movies'
  name: string; // e.g., 'ข่าว', 'หนัง'
  policy: GroupPolicy;
  description?: string;
  isDefault?: boolean;
}

export interface Announcement {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'critical';
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  targetRoles?: Role[];
  targetGroups?: string[];
  targetTeams?: string[];
  targetUsers?: string[]; // user IDs
}

export interface CompanyConfig {
  id: string;
  name: string;
  logo?: string;
  brands: Brand[];
  rules: CompanyRule[];
  groups: GroupDefinition[]; // Managed groups
  announcements: Announcement[]; // Global broadcaster
  holidays: PublicHoliday[]; // Double Pay & Holiday Dates
  performancePolicy: PolicyConfiguration;
}

export interface ReportsData {
  period: string;
  financials: FinancialMetric[];
  growth: {
    views: GrowthMetric;
    followers: GrowthMetric;
    assets: GrowthMetric;
  };
  teamBreakdown: {
    teamName: string;
    totalViews: number;
    avgAttainment: number;
  }[];
}

export interface PersonalTask {
  id: string;
  userId: string;
  title: string;
  completed: boolean;
  startDate?: string; // ISO string — optional: task starts on this date
  endDate?: string;   // ISO string — optional: task ends on this date
  createdAt: string;  // ISO string — when the task was created (metadata only)
}

// === Monthly Submission Workflow ===
// ระบบส่งเช็คยอดประจำเดือน: Staff เลือกเพจที่ต้องการส่ง → Admin Approve/Reject → คำนวณค่าคอม

export type SubmissionStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected';

export interface SubmissionPage {
  id: string;
  submissionId: string;
  pageId: string;
  pageName: string;        // Snapshot ชื่อเพจ ณ ตอนส่ง (กันเปลี่ยนชื่อภายหลัง)
  pageUrl?: string;        // ลิงก์ไปยังเพจ
  pageStatus?: string;     // Active / Rest ณ ตอนส่ง
  reviewStatus?: 'Pending' | 'Approved' | 'Rejected'; // ผลตรวจเฉพาะเพจ
  reviewNote?: string;     // หมายเหตุเฉพาะเพจ
  snapshotViews: number;   // ยอดวิวรวมของเดือนนั้น (Snapshot)
  createdAt: string;
}

export interface MonthlySubmission {
  id: string;
  staffId: string;
  staffName?: string;      // Denormalized สำหรับ Admin Review UI
  period: string;          // 'YYYY-MM' เช่น '2026-04'
  status: SubmissionStatus;
  submittedAt?: string;
  submittedByName?: string; // ชื่อคนกดส่ง (กรณี Admin ส่งแทน)
  reviewedBy?: string;     // Admin User ID ที่ Review
  reviewedAt?: string;
  reviewNote?: string;     // หมายเหตุจาก Admin (เช่น เหตุผลที่ Reject)
  totalViews: number;      // รวมยอดวิวทุกเพจที่ส่ง (Snapshot)
  // ค่าคอม Auto-calculate (Admin แก้ไขได้)
  calculatedCommission?: number;  // ค่าคอมที่คำนวณจาก policy
  adjustedCommission?: number;    // ค่าคอมที่ Admin แก้ไข (ถ้ามี)
  commissionNote?: string;        // หมายเหตุการปรับค่าคอม
  pages: SubmissionPage[];        // เพจที่เลือกส่งในรอบนี้
  createdAt: string;
}

