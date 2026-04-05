import { User, Team, Role } from '@/types';
import { supabase } from '@/lib/supabaseClient';

export const personnelService = {
  getAvailableUsers: async (viewerRole?: Role): Promise<User[]> => {
    const { data: profiles, error } = await supabase.from('profiles').select('*');
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    const users: User[] = (profiles || []).map(p => ({
      id: p.id,
      name: p.name,
      username: p.username || '',
      email: p.email || '',
      role: (p.role as Role) || Role.Staff,
      status: p.status || 'Pending',
      phone: p.phone || '',
      lineId: p.line_id || '',
      teamId: p.team_id,
      salary: Number(p.salary) || 0,
      department: p.department,
      group: p.group,
      bankName: p.bank_name,
      bankAccount: p.bank_account,
      startDate: p.enlistment_date,
      probationDate: p.clearance_date,
      isActive: p.is_active,
    }));

    if (!viewerRole || viewerRole === Role.SuperAdmin || viewerRole === Role.Developer) return users;
    
    if (viewerRole === Role.Admin) {
      return users.filter(u => u.role !== Role.SuperAdmin);
    }
    if (viewerRole === Role.Manager) {
      return users.filter(u => u.role !== Role.SuperAdmin && u.role !== Role.Admin);
    }
    return users.filter(u => u.role === Role.Staff);
  },

  getTeams: async (): Promise<Team[]> => {
    const { data: teams, error } = await supabase.from('teams').select('*').order('created_at', { ascending: true });
    if (error) {
      console.error('Error fetching teams:', error);
      return [];
    }
    return (teams || []).map(t => ({
      id: t.id,
      name: t.name,
      createdAt: t.created_at
    }));
  },

  getPersonnelStats: async () => {
    const users = await personnelService.getAvailableUsers(Role.SuperAdmin);
    const teams = await personnelService.getTeams();
    const total = users.length;
    const managers = users.filter(u => u.role === Role.Manager || u.role === Role.Admin).length;
    const active = users.filter(u => u.isActive).length;
    return { total, managers, active, activeTeams: teams.length };
  },

  saveUser: async (user: User): Promise<void> => {
    // Base payload — columns ที่มีอยู่ตั้งแต่ต้นและปลอดภัย 100%
    const basePayload: Record<string, unknown> = {
      name: user.name,
      username: user.username,
      role: user.role,
      team_id: (user.teamId && !user.teamId.startsWith('team-')) ? user.teamId : null,
      salary: user.salary ?? 12000,
      department: user.department,
      "group": user.group,
      is_active: user.status ? (user.status === 'Official' || user.status === 'Probation') : user.isActive
    };

    // Extended payload — columns ที่เพิ่มโดย migration 07/08
    // ส่งเฉพาะ field ที่มีค่าเพื่อกัน PGRST204 หากยังไม่ได้รัน Migration
    const extendedFields: Record<string, unknown> = {};
    if (user.email     !== undefined) extendedFields.email         = user.email;
    if (user.phone     !== undefined) extendedFields.phone         = user.phone;
    if (user.lineId    !== undefined) extendedFields.line_id       = user.lineId;
    if (user.status    !== undefined) extendedFields.status        = user.status;
    if (user.bankName  !== undefined) extendedFields.bank_name     = user.bankName;
    if (user.bankAccount !== undefined) extendedFields.bank_account = user.bankAccount;
    if (user.startDate !== undefined) extendedFields.enlistment_date = user.startDate;
    if (user.probationDate !== undefined) extendedFields.clearance_date = user.probationDate;

    const payload = { ...basePayload, ...extendedFields };

    // ตรวจสอบว่าเป็นพนักงานใหม่ (ID จะขึ้นต้นด้วย user-xxxx จากฝั่ง Client) หรือพนักงานเดิม
    const isNewUser = !user.id || user.id.startsWith('user-');

    if (isNewUser) {
      const { error } = await supabase.from('profiles').insert(payload);
      if (error) {
        console.error('Error inserting new user:', error);
        throw error;
      }
    } else {
      const { error } = await supabase.from('profiles').update(payload).eq('id', user.id);
      if (error) {
        console.error('Error updating existing user:', error);
        throw error;
      }
    }
  },

  saveTeam: async (team: Team): Promise<void> => {
    if (team.id && (!team.id.startsWith('team-') && team.id.trim() !== '')) {
      const { error } = await supabase.from('teams').update({ name: team.name }).eq('id', team.id);
      if (error) console.error('Error updating team:', error);
    } else {
      const { error } = await supabase.from('teams').insert({ name: team.name });
      if (error) console.error('Error adding team:', error);
    }
  },

  updateTeam: async (id: string, name: string): Promise<void> => {
    const { error } = await supabase.from('teams').update({ name }).eq('id', id);
    if (error) console.error('Error updating team:', error);
  },

  deleteTeam: async (teamId: string): Promise<void> => {
    const { error } = await supabase.from('teams').delete().eq('id', teamId);
    if (error) console.error('Error deleting team:', error);
  },

  recordSalaryAdjustment: async (staffId: string, amount: number, reason: string, effectiveDate: string): Promise<void> => {
    const { error } = await supabase.from('salary_adjustments').insert({
      staff_id: staffId,
      new_salary: amount,
      reason: reason,
      effective_date: effectiveDate
    });
    if (error) {
       console.error('Error recording salary adjustment:', error);
       throw error;
    }
  }
};
