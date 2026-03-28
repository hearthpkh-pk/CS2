import { initialUsers, initialTeams } from '@/data/mockUsers';
import { User, Team, Role } from '@/types';

const STORAGE_KEYS = {
  USERS: 'cs_personnel_users',
  TEAMS: 'cs_personnel_teams'
};

const getStoredUsers = (): User[] => {
  if (typeof window === 'undefined') return initialUsers;
  const saved = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!saved) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
    return initialUsers;
  }
  return JSON.parse(saved);
};

const getStoredTeams = (): Team[] => {
  if (typeof window === 'undefined') return initialTeams;
  const saved = localStorage.getItem(STORAGE_KEYS.TEAMS);
  if (!saved) {
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(initialTeams));
    return initialTeams;
  }
  return JSON.parse(saved);
};

export const personnelService = {
  // --- Data Access ---
  getUsers: () => getStoredUsers(),
  getTeams: () => getStoredTeams(),

  // --- Persistence Logic ---
  saveUser: (user: User) => {
    const users = getStoredUsers();
    const exists = users.findIndex(u => u.id === user.id);
    if (exists >= 0) {
      users[exists] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return users;
  },

  deleteUser: (userId: string) => {
    const users = getStoredUsers().filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return users;
  },

  saveTeam: (team: Team) => {
    const teams = getStoredTeams();
    const exists = teams.findIndex(t => t.id === team.id);
    if (exists >= 0) {
      teams[exists] = team;
    } else {
      teams.push(team);
    }
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    return teams;
  },

  updateTeam: (id: string, name: string) => {
    const teams = getStoredTeams().map(t => t.id === id ? { ...t, name } : t);
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    return teams;
  },

  deleteTeam: (teamId: string) => {
    const teams = getStoredTeams().filter(t => t.id !== teamId);
    const users = getStoredUsers().map(u => u.teamId === teamId ? { ...u, teamId: undefined } : u);
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return { teams, users };
  },

  // --- Aggregation Logic (Shared Brain) ---
  getPersonnelStats: () => {
    const users = getStoredUsers();
    const teams = getStoredTeams();
    const total = users.length;
    const managers = users.filter(u => u.role === Role.Manager || u.role === Role.Admin).length;
    const active = users.filter(u => u.isActive).length;
    const activeTeams = teams.length;
    return { total, managers, active, activeTeams };
  },

  getAvailableUsers: (viewerRole?: Role) => {
    const users = getStoredUsers();
    if (!viewerRole) return users;
    if (viewerRole === Role.SuperAdmin || viewerRole === Role.Developer) return users;
    
    if (viewerRole === Role.Admin) {
      return users.filter(u => u.role !== Role.SuperAdmin);
    }
    if (viewerRole === Role.Manager) {
      return users.filter(u => u.role !== Role.SuperAdmin && u.role !== Role.Admin);
    }
    return users.filter(u => u.role === Role.Staff);
  }
};
