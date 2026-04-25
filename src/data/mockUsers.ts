import { Role, User, Team } from '@/types';

export const initialTeams: Team[] = [
  { id: 'dept-ent', name: 'Alpha Core (รายการ)', createdAt: '2024-01-01' },
  { id: 'dept-news', name: 'Beta Ops (ข่าว)', createdAt: '2024-01-05' },
  { id: 'dept-movie', name: 'Gamma Creative (หนัง)', createdAt: '2024-01-10' },
];

export const MOCK_USERS: User[] = [
  // 1. SYSTEM DEVELOPER (GOD MODE)
  {
    id: 'u-dev-01',
    email: 'dev@editor.com',
    username: 'sys_dev',
    name: 'System Developer',
    role: Role.SuperAdmin,
    isActive: true,
    permissions: ['all'],
    startDate: '2026-01-01',
    salary: 0,
  },

  // 2. SUPER ADMINS (EXECUTIVE DIRECTORS)
  {
    id: 'u-sa-01',
    email: 'ceo@editor.com',
    username: 'ceo_pong',
    name: 'คุณพงษ์ศิริ (CEO)',
    role: Role.SuperAdmin,
    isActive: true,
    permissions: ['all'],
    startDate: '2022-01-01',
    salary: 250000,
  },
  {
    id: 'u-sa-02',
    email: 'hr@editor.com',
    username: 'hr_rin',
    name: 'คุณรินรดา (HR Director)',
    role: Role.SuperAdmin,
    isActive: true,
    permissions: ['all'],
    startDate: '2022-03-15',
    salary: 180000,
  },

  // 3. ADMINS (SYSTEM & OPS)
  {
    id: 'u-adm-01',
    email: 'ops@editor.com',
    username: 'ops_vichai',
    name: 'คุณวิชัย (Ops Admin)',
    role: Role.Admin,
    isActive: true,
    permissions: ['dashboard', 'team', 'audit'],
    startDate: '2023-05-10',
    salary: 85000,
  },

  // 4. MANAGERS (DEPARTMENT HEADS)
  {
    id: 'u-mgr-01',
    email: 'mgr.ent@editor.com',
    username: 'mgr_thana',
    name: 'คุณธนาวุฒิ (Manager - รายการ)',
    role: Role.Manager,
    department: 'รายการ',
    teamId: 'dept-ent',
    isActive: true,
    permissions: ['dashboard', 'analytics'],
    startDate: '2023-08-01',
    salary: 65000,
  },
  {
    id: 'u-mgr-02',
    email: 'mgr.news@editor.com',
    username: 'mgr_manas',
    name: 'คุณมนัสวี (Manager - ข่าว)',
    role: Role.Manager,
    department: 'ข่าว',
    teamId: 'dept-news',
    isActive: true,
    permissions: ['dashboard', 'analytics'],
    startDate: '2023-09-12',
    salary: 62000,
  },
  {
    id: 'u-mgr-03',
    email: 'mgr.movie@editor.com',
    username: 'mgr_movie',
    name: 'คุณกิตติ (Manager - หนัง)',
    role: Role.Manager,
    department: 'หนัง',
    teamId: 'dept-movie',
    isActive: true,
    permissions: ['dashboard', 'analytics'],
    startDate: '2024-01-05',
    salary: 60000,
  },

  // 5. OPERATIONAL STAFF (20+ FOR SCALING TEST)
  ...Array.from({ length: 20 }).map((_, i) => {
    const depts = ['รายการ', 'หนัง', 'ข่าว'];
    const dept = depts[i % depts.length];
    const groups = ['แบรนด์ 1', 'แบรนด์ 2', 'แบรนด์ 3', 'แบรนด์ 4'];
    const group = groups[i % groups.length];
    
    return {
      id: `u-staff-${(i + 1).toString().padStart(2, '0')}`,
      email: `staff.${(i + 1).toString().padStart(2, '0')}@editor.com`,
      username: `staff${(i + 1).toString().padStart(2, '0')}`,
      name: `Operator ${String.fromCharCode(65 + (i % 26))}${i + 1} (${dept})`,
      role: Role.Staff,
      department: dept,
      group: group,
      teamId: `dept-${i % 3 === 0 ? 'ent' : i % 3 === 1 ? 'news' : 'movie'}`,
      isActive: true,
      permissions: ['dashboard', 'daily-task'],
      startDate: `2024-0${1 + (i % 6)}-15`,
      salary: 25000 + (Math.floor(Math.random() * 15) * 1000), // 25k - 40k
    };
  })
];

export const initialUsers = MOCK_USERS;
