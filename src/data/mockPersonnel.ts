import { User, Team, Role } from '@/types';

export const initialTeams: Team[] = [
  { id: 'alpha', name: 'Alpha Core', createdAt: '2024-01-01' },
  { id: 'beta', name: 'Beta Ops', createdAt: '2024-01-05' },
  { id: 'gamma', name: 'Gamma Creative', createdAt: '2024-01-10' },
];

export const initialUsers: User[] = [
  { 
    id: '1', 
    name: 'Viper', 
    role: Role.Admin, 
    email: 'viper@hq.com', 
    username: 'HQ-ADMIN-01',
    isActive: true,
    teamId: 'alpha',
    salary: 85000,
    startDate: '2023-11-15',
    salaryHistory: [
      { id: 'h1', newSalary: 85000, reason: 'Initial Enlistment', effectiveDate: '2023-11-15', createdAt: '2023-11-15' }
    ]
  },
  { 
    id: '2', 
    name: 'Ghost', 
    role: Role.Manager, 
    email: 'ghost@ops.com', 
    username: 'OPS-MGR-02',
    isActive: true,
    teamId: 'beta',
    salary: 62000,
    startDate: '2023-12-01',
    salaryHistory: [
      { id: 'h2', newSalary: 62000, reason: 'Operations Lead Appointment', effectiveDate: '2023-12-01', createdAt: '2023-12-01' }
    ]
  },
  { 
    id: '3', 
    name: 'Phantom', 
    role: Role.Staff, 
    email: 'phantom@ops.com', 
    username: 'STAFF-03',
    isActive: false,
    teamId: 'beta',
    salary: 35000,
    startDate: '2024-01-20'
  },
  { 
    id: '4', 
    name: 'Specter', 
    role: Role.Staff, 
    email: 'specter@hq.com', 
    username: 'STAFF-04',
    isActive: true,
    teamId: 'alpha',
    salary: 38000,
    startDate: '2024-02-10'
  },
];
