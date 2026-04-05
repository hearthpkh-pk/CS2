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
      role: (p.role as Role) || Role.Staff,
      teamId: p.team_id,
      salary: Number(p.salary) || 0,
      department: p.department,
      group: p.group,
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
    const payload = {
      name: user.name,
      username: user.username,
      role: user.role,
      team_id: user.teamId,
      salary: user.salary,
      department: user.department,
      "group": user.group,
      is_active: user.isActive
    };
    const { error } = await supabase.from('profiles').update(payload).eq('id', user.id);
    if (error) console.error('Error updating user:', error);
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
