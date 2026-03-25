import { useState, useMemo, useEffect } from 'react';
import { User, Team, Role, SalaryAdjustment } from '@/types';
import { personnelService } from '@/services/personnelService';

export const useTeamManagement = (
  _mockUsersStub: User[], 
  _mockTeamsStub: Team[],
  externalUsers?: User[],
  setExternalUsers?: (users: User[]) => void,
  viewerRole?: Role
) => {
  // --- Centralized State Sync ---
  const [personnelVersion, setPersonnelVersion] = useState(0);
  const sync = () => setPersonnelVersion(v => v + 1);

  const users = useMemo(() => {
    const dataSource = externalUsers || personnelService.getAvailableUsers(viewerRole);
    if (!viewerRole || viewerRole === Role.SuperAdmin) return dataSource;
    
    // Explicit RBAC filtering for external data
    if (viewerRole === Role.Admin) {
      return dataSource.filter(u => u.role !== Role.SuperAdmin);
    }
    if (viewerRole === Role.Manager) {
      return dataSource.filter(u => u.role !== Role.SuperAdmin && u.role !== Role.Admin);
    }
    return dataSource.filter(u => u.role === Role.Staff);
  }, [externalUsers, viewerRole, personnelVersion]);

  const teams = useMemo(() => {
    return personnelService.getTeams();
  }, [personnelVersion]);

  const stats = useMemo(() => {
    return personnelService.getPersonnelStats();
  }, [personnelVersion]);

  // --- UI State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'All'>('All');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAdjustingSalary, setIsAdjustingSalary] = useState(false);
  const [salaryForm, setSalaryForm] = useState<{ amount: number; reason: string; effectiveDate: string }>({
    amount: 0,
    reason: '',
    effectiveDate: new Date().toISOString().split('T')[0]
  });

  // --- Search & Filter Logic ---
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            user.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'All' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  // --- Handlers (Delegated to Service) ---
  const handleSaveUser = (userData: User) => {
    if (setExternalUsers) {
      setExternalUsers(users.map(u => u.id === userData.id ? userData : u));
    } else {
      personnelService.saveUser(userData);
      sync();
    }
    setEditingUser(null);
  };

  const handleCreateTeam = (name: string) => {
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name,
      createdAt: new Date().toISOString()
    };
    personnelService.saveTeam(newTeam);
    sync();
  };

  const handleDeleteTeam = (id: string) => {
    personnelService.deleteTeam(id);
    sync();
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

    handleSaveUser(updatedUser);
    setIsAdjustingSalary(false);
    setSalaryForm({ amount: 0, reason: '', effectiveDate: new Date().toISOString().split('T')[0] });
  };

  const handleUpdateTeam = (id: string, name: string) => {
    personnelService.updateTeam(id, name);
    sync();
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
    handleUpdateTeam,
    handleDeleteTeam,
    handleConfirmSalary
  };
};
