import { initialUsers, initialTeams } from '@/data/mockPersonnel';
import { User, Team, Role } from '@/types';

/**
 * personnelService.ts
 * 
 * A singleton service that maintains the personnel state in memory.
 * This simulates a persistent backend for development.
 */

let usersTable: User[] = [...initialUsers];
let teamsTable: Team[] = [...initialTeams];

export const personnelService = {
  // --- Data Access ---
  getUsers: () => usersTable,
  getTeams: () => teamsTable,

  // --- Persistence Logic ---
  saveUser: (user: User) => {
    const exists = usersTable.find(u => u.id === user.id);
    if (exists) {
      usersTable = usersTable.map(u => u.id === user.id ? user : u);
    } else {
      usersTable = [...usersTable, user];
    }
    return usersTable;
  },

  deleteUser: (userId: string) => {
    usersTable = usersTable.filter(u => u.id !== userId);
    return usersTable;
  },

  saveTeam: (team: Team) => {
    const exists = teamsTable.find(t => t.id === team.id);
    if (exists) {
      teamsTable = teamsTable.map(t => t.id === team.id ? team : t);
    } else {
      teamsTable = [...teamsTable, team];
    }
    return teamsTable;
  },

  updateTeam: (id: string, name: string) => {
    teamsTable = teamsTable.map(t => t.id === id ? { ...t, name } : t);
    return teamsTable;
  },

  deleteTeam: (teamId: string) => {
    teamsTable = teamsTable.filter(t => t.id !== teamId);
    // Unassign users from this team
    usersTable = usersTable.map(u => u.teamId === teamId ? { ...u, teamId: undefined } : u);
    return { teams: teamsTable, users: usersTable };
  },

  // --- Aggregation Logic (Shared Brain) ---
  getPersonnelStats: () => {
    const total = usersTable.length;
    const managers = usersTable.filter(u => u.role === Role.Manager || u.role === Role.Admin).length;
    const active = usersTable.filter(u => u.isActive).length;
    const activeTeams = teamsTable.length;
    return { total, managers, active, activeTeams };
  },

  getAvailableUsers: (viewerRole?: Role) => {
    if (!viewerRole) return usersTable;
    
    if (viewerRole === Role.SuperAdmin) return usersTable;
    
    if (viewerRole === Role.Admin) {
      // Admins cannot see Super Admins
      return usersTable.filter(u => u.role !== Role.SuperAdmin);
    }
    
    if (viewerRole === Role.Manager) {
      // Managers cannot see Admins or Super Admins
      return usersTable.filter(u => u.role !== Role.SuperAdmin && u.role !== Role.Admin);
    }
    
    // Staff see no one or only themselves (depending on future need)
    return usersTable.filter(u => u.role === Role.Staff);
  }
};
