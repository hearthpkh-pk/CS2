import { useState, useEffect } from 'react';
import { User, Team, Role } from '@/types';
import { personnelService } from '@/services/personnelService';

export const useTeamManagement = (
  _mockUsersStub: User[], 
  _mockTeamsStub: Team[],
  externalUsers?: User[],
  setExternalUsers?: (users: User[]) => void,
  viewerRole?: Role
) => {
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [stats, setStats] = useState({ total: 0, managers: 0, active: 0, activeTeams: 0 });

  // ล้างการใช้ useMemo แล้วเปลี่ยนเป็น useEffect เพื่อโหลดข้อมูล Async จาก Service
  const [personnelVersion, setPersonnelVersion] = useState(0);
  const sync = () => setPersonnelVersion(v => v + 1);

  useEffect(() => {
    const fetchData = async () => {
      // โหลดพนักงาน
      if (externalUsers) {
        setUsers(externalUsers);
      } else {
        const fetchedUsers = await personnelService.getAvailableUsers(viewerRole);
        setUsers(fetchedUsers);
      }

      // โหลดทีม และ สถิติ
      setTeams(await personnelService.getTeams());
      setStats(await personnelService.getPersonnelStats());
    };

    fetchData();
  }, [externalUsers, viewerRole, personnelVersion]);

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
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // --- Handlers ---
  const handleSaveUser = async (userData: User) => {
    if (setExternalUsers) {
      setExternalUsers(users.map(u => u.id === userData.id ? userData : u));
    } else {
      await personnelService.saveUser(userData);
      sync();
    }
    setEditingUser(null);
  };

  const handleCreateTeam = async (name: string) => {
    const newTeam: Team = {
      id: '', // ให้ Supabase ใส่ UUID
      name,
    };
    await personnelService.saveTeam(newTeam);
    sync();
  };

  const handleDeleteTeam = async (id: string) => {
    await personnelService.deleteTeam(id);
    sync();
  };

  const handleConfirmSalary = async () => {
    if (!editingUser) return;

    // 1. บันทึกเงินเดือนใหม่ใน Profile หลัก
    const updatedUser = {
      ...editingUser,
      salary: salaryForm.amount,
    };
    await handleSaveUser(updatedUser);

    // 2. บันทึกเหตุผลการขึ้นเงินเดือนลงในตาราง salary_adjustments
    await personnelService.recordSalaryAdjustment(
      editingUser.id, 
      salaryForm.amount, 
      salaryForm.reason, 
      salaryForm.effectiveDate
    );

    setIsAdjustingSalary(false);
    setSalaryForm({ amount: 0, reason: '', effectiveDate: new Date().toISOString().split('T')[0] });
  };

  const handleUpdateTeam = async (id: string, name: string) => {
    await personnelService.updateTeam(id, name);
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
