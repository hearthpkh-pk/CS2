import { useState, useMemo } from 'react';
import { User, Team, Role, SalaryAdjustment } from '@/types';

export const useTeamManagement = (
  initialUsers: User[], 
  initialTeams: Team[],
  externalUsers?: User[],
  setExternalUsers?: (users: User[]) => void,
  viewerRole?: Role
) => {
  const [internalUsers, setInternalUsers] = useState<User[]>(initialUsers);
  
  // Logic: If viewer is Admin, hide Super Admin. 
  const availableUsers = useMemo(() => {
    const baseUsers = externalUsers || internalUsers;
    if (viewerRole === Role.Admin) {
      return baseUsers.filter(u => u.role !== Role.SuperAdmin);
    }
    return baseUsers;
  }, [externalUsers, internalUsers, viewerRole]);

  const users = availableUsers;
  const setUsers = setExternalUsers || setInternalUsers;

  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'All'>('All');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAdjustingSalary, setIsAdjustingSalary] = useState(false);
  const [salaryForm, setSalaryForm] = useState<{ amount: number; reason: string; effectiveDate: string }>({
    amount: 0,
    reason: '',
    effectiveDate: new Date().toISOString().split('T')[0]
  });

  // --- Calculations & Filters ---
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            user.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'All' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const stats = useMemo(() => {
    const total = users.length;
    const managers = users.filter(u => u.role === Role.Manager || u.role === Role.Admin).length;
    const active = users.filter(u => u.isActive).length;
    const activeTeams = teams.length;
    return { total, managers, active, activeTeams };
  }, [users, teams]);

  // --- Handlers ---
  const handleSaveUser = (userData: User) => {
    if (users.find(u => u.id === userData.id)) {
      setUsers(users.map(u => u.id === userData.id ? userData : u));
    } else {
      setUsers([...users, userData]);
    }
    setEditingUser(null);
  };

  const handleCreateTeam = (name: string) => {
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name,
      createdAt: new Date().toISOString()
    };
    setTeams([...teams, newTeam]);
  };

  const handleDeleteTeam = (id: string) => {
    setTeams(teams.filter(t => t.id !== id));
    setUsers(users.map(u => u.teamId === id ? { ...u, teamId: undefined } : u));
  };

  const handleConfirmSalary = () => {
    if (!editingUser) return;
    
    const newAdjustment: SalaryAdjustment = {
      id: `adj-${Date.now()}`,
      newSalary: salaryForm.amount,
      reason: salaryForm.reason,
      effectiveDate: salaryForm.effectiveDate,
      createdAt: new Date().toISOString()
    };

    const updatedUser = {
      ...editingUser,
      salary: salaryForm.amount,
      salaryHistory: [newAdjustment, ...(editingUser.salaryHistory || [])]
    };

    setEditingUser(updatedUser);
    setIsAdjustingSalary(false);
    setSalaryForm({ amount: 0, reason: '', effectiveDate: new Date().toISOString().split('T')[0] });
  };

  return {
    users,
    teams,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    filteredUsers,
    stats,
    editingUser,
    setEditingUser,
    isAdjustingSalary,
    setIsAdjustingSalary,
    salaryForm,
    setSalaryForm,
    handleSaveUser,
    handleCreateTeam,
    handleDeleteTeam,
    handleConfirmSalary
  };
};
