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
  department: string; // แผนก: รายการ, หนัง, ข่าว
  group: string; // กลุ่มงาน: แบรนด์ 1 - 4
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
  yearlyViews: number[]; // 12 months array
}

const departments = ['รายการ', 'หนัง', 'ข่าว'];
const groups = ['แบรนด์ 1', 'แบรนด์ 2', 'แบรนด์ 3', 'แบรนด์ 4'];
const availableTags = ['Top Performer', 'New Hire', 'Night Shift', 'Weekend Crew'];
const brandsList = ['Nike', 'Apple', 'Disney', 'Coca Cola', 'Pepsi', 'Adidas', 'Netflix', 'None'];

export const mockReports: DailyReport[] = Array.from({ length: 20 }).map((_, i) => {
  const isComplete = Math.random() > 0.3;
  const pagesCount = 10 + (i % 11);
  const totalRequired = Math.floor(pagesCount * 0.6);
  const userName = `Operator ${String.fromCharCode(65 + (i % 26))}${i + 1}`;
  const department = departments[i % departments.length];
  const group = groups[i % groups.length];
  const tags = i % 5 === 0 ? [availableTags[i % availableTags.length]] : [];
  
  return {
    id: `r-${i + 1}`,
    userId: `u${i + 1}`,
    userName,
    date: '2026-03-27',
    brand: brandsList[i % brandsList.length],
    postCount: isComplete ? totalRequired : Math.floor(totalRequired * 0.5),
    totalPostsRequired: totalRequired,
    submissionTime: isComplete ? `${10 + Math.floor(i/4)}:${(i * 13) % 60 < 10 ? '0' : ''}${(i * 13) % 60}` : '-',
    status: isComplete ? 'Complete' : 'Pending',
    views: Math.floor(Math.random() * 5000000) + 1000000,
    pagesCount,
    isPinned: i < 3,
    department,
    group,
    tags,

    // Randomized performance data
    monthlyViews: Math.floor(Math.random() * 80000000) + 20000000,
    attainmentRate: 85 + Math.floor(Math.random() * 25),
    efficiency: 7.5 + (Math.random() * 2.3),
    workDays: 20 + Math.floor(Math.random() * 6),
    offDays: Math.floor(Math.random() * 4),
    newAssetsMonth: Math.floor(Math.random() * 5),
    bannedAssetsMonth: Math.floor(Math.random() * 2),
    avgClipsPerDay: 4 + Math.random() * 6,
    issueFrequency: Math.random() * 0.2,
    avgRepairTime: 0.5 + Math.random() * 3,
    isClosed: Math.random() > 0.8,
    yearlyViews: Array.from({ length: 12 }).map(() => Math.floor(Math.random() * 80000000) + 10000000)
  };
});
