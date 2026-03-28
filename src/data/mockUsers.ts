import { Role, User } from '@/types';

export const MOCK_USERS: User[] = [
  // SUPER ADMINS
  {
    id: 'usr-01',
    email: 'executive@poc.com',
    username: 'exec_director',
    name: 'คุณพงษ์ศิริ (CEO)',
    role: Role.SuperAdmin,
    isActive: true,
    permissions: ['all'],
    startDate: '2022-01-01',
    salary: 250000,
  },
  {
    id: 'usr-02',
    email: 'hr.director@poc.com',
    username: 'hr_director',
    name: 'คุณรินรดา (HR Director)',
    role: Role.SuperAdmin,
    isActive: true,
    permissions: ['all'],
    startDate: '2022-03-15',
    salary: 180000,
  },

  // ADMINS
  {
    id: 'usr-03',
    email: 'admin.main@poc.com',
    username: 'admin_main',
    name: 'คุณวิชัย (System Admin)',
    role: Role.Admin,
    isActive: true,
    permissions: ['dashboard', 'team', 'audit'],
    startDate: '2023-05-10',
    salary: 85000,
  },

  // MANAGERS
  {
    id: 'usr-04',
    email: 'mgr.entertainment@poc.com',
    username: 'mgr_ent',
    name: 'คุณธนาวุฒิ (Manager - Entertainment)',
    role: Role.Manager,
    isActive: true,
    permissions: ['dashboard', 'analytics'],
    startDate: '2023-08-01',
    salary: 65000,
  },
  {
    id: 'usr-05',
    email: 'mgr.news@poc.com',
    username: 'mgr_news',
    name: 'คุณมนัสวี (Manager - News)',
    role: Role.Manager,
    isActive: true,
    permissions: ['dashboard', 'analytics'],
    startDate: '2023-09-12',
    salary: 62000,
  },

  // STAFF
  {
    id: 'usr-06',
    email: 'staff.01@poc.com',
    username: 'staff01',
    name: 'นายสมชาย (Editor Senior)',
    role: Role.Staff,
    isActive: true,
    permissions: ['dashboard', 'daily-task'],
    startDate: '2024-01-15',
    salary: 35000,
  },
  {
    id: 'usr-07',
    email: 'staff.02@poc.com',
    username: 'staff02',
    name: 'นางสาวกมล (Graphic Designer)',
    role: Role.Staff,
    isActive: true,
    permissions: ['dashboard', 'daily-task'],
    startDate: '2024-02-01',
    salary: 32000,
  },
  {
    id: 'usr-08',
    email: 'staff.03@poc.com',
    username: 'staff03',
    name: 'นายอานนท์ (Junior Editor)',
    role: Role.Staff,
    isActive: true,
    permissions: ['dashboard', 'daily-task'],
    startDate: '2024-03-20',
    salary: 28000,
  }
];
