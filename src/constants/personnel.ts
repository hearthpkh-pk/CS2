import { Role } from '@/types';

/**
 * ROLE_LABELS
 * 
 * Centralized mapping for Role display names.
 * Use this to ensure consistent naming across the entire application.
 */
export const ROLE_LABELS: Record<Role, string> = {
  [Role.Staff]: 'Staff',
  [Role.Manager]: 'Manager',
  [Role.Admin]: 'Admin',
  [Role.SuperAdmin]: 'Super Admin',
  [Role.Developer]: 'Developer'
};

/**
 * ROLE_COLORS
 * Optional: Centralize role-based colors if needed
 */
export const ROLE_THEME: Record<Role, { color: string; bg: string; border: string }> = {
  [Role.Staff]: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  [Role.Manager]: { color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
  [Role.Admin]: { color: 'text-slate-900', bg: 'bg-slate-100', border: 'border-slate-200' },
  [Role.SuperAdmin]: { color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
  [Role.Developer]: { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' }
};

/**
 * GROUP_LABELS
 */
export const PERSONNEL_LABELS = {
  UNASSIGNED: 'Unassigned',
  UNIT_PREFIX: 'Unit:',
  GROUP_HEADER: 'Unit/Group'
};
