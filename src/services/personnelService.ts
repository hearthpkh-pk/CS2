import { User, Team, Role } from '@/types';
import { supabase } from '@/lib/supabaseClient';

export const personnelService = {
  getAvailableUsers: async (viewerRole?: Role): Promise<User[]> => {
    const { data: profiles, error } = await supabase.from('profiles').select('*').order('sort_order', { ascending: true, nullsFirst: false });
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
      brand: p.brand,
      bankName: p.bank_name,
      bankAccount: p.bank_account,
      startDate: p.enlistment_date,
      probationDate: p.clearance_date,
      isActive: p.is_active,
      avatarUrl: p.avatar_url,
      sortOrder: p.sort_order ?? 999,
    }));

    // 🛡️ เรียงตาม sortOrder เสมอ (ยิ่งน้อยยิ่งอยู่บน)
    users.sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));

    if (!viewerRole || viewerRole === Role.SuperAdmin) return users;
    
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

  saveUser: async (user: User, skipQueue = false): Promise<void> => {
    // Base payload — columns ที่มีอยู่ตั้งแต่ต้นและปลอดภัย 100%
    const basePayload: Record<string, unknown> = {
      name: user.name,
      username: user.username && user.username.trim() !== "" 
        ? user.username 
        : (user.email ? user.email.split('@')[0] : `staff_${Math.random().toString(36).substring(7)}`),
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
    if (user.brand     !== undefined) extendedFields.brand         = user.brand;
    if (user.bankName  !== undefined) extendedFields.bank_name     = user.bankName;
    if (user.bankAccount !== undefined) extendedFields.bank_account = user.bankAccount;
    if (user.startDate !== undefined) extendedFields.enlistment_date = user.startDate;
    if (user.probationDate !== undefined) extendedFields.clearance_date = user.probationDate;
    if (user.sortOrder   !== undefined) extendedFields.sort_order    = user.sortOrder;

    const payload = { ...basePayload, ...extendedFields };

    // 🛡️ Bullet-proof: ใช้ UPSERT แทนการแยก Insert/Update
    // ถ้า ID เป็น Mock ID (เช่น user-xxxx หรือ u-xxxx) ให้ลบ ID ออกเพื่อให้ DB สร้าง UUID ให้ใหม่
    if (user.id && (user.id.startsWith('user-') || user.id.startsWith('u-'))) {
      delete (payload as any).id;
    } else if (user.id) {
      (payload as any).id = user.id;
    }

    let { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });

    // 🛡️ Retry logic
    if (error) {
      await supabase.auth.refreshSession();
      const retry = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });
      error = retry.error;
    }

    if (error) {
      console.error('Error saving user (upsert):', error.message);
      if (!skipQueue) {
        console.warn('📡 Network issue, adding user save to sync queue...');
        await logCacheService.addToSyncQueue('SAVE_USER', user);
        return;
      }
      throw error;
    }
  },

  saveTeam: async (team: Team, skipQueue = false): Promise<void> => {
    const payload: any = { name: team.name };
    
    // 🛡️ บันทึก ID เฉพาะถ้าไม่ใช่ Mock ID
    if (team.id && !team.id.startsWith('team-') && team.id.trim() !== '') {
      payload.id = team.id;
    }

    let { error } = await supabase.from('teams').upsert(payload, { onConflict: 'id' });

    // 🛡️ Retry logic
    if (error) {
      await supabase.auth.refreshSession();
      const retry = await supabase.from('teams').upsert(payload, { onConflict: 'id' });
      error = retry.error;
    }

    if (error) {
      console.error('Error saving team (upsert):', error.message);
      if (!skipQueue) {
        await logCacheService.addToSyncQueue('SAVE_TEAM', team);
        return;
      }
      throw error;
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
    const payload = {
      staff_id: staffId,
      new_salary: amount,
      reason: reason,
      effective_date: effectiveDate
    };
    let { error } = await supabase.from('salary_adjustments').insert(payload);
    
    if (error && error.message?.includes('auth')) {
      await supabase.auth.refreshSession();
      const retry = await supabase.from('salary_adjustments').insert(payload);
      error = retry.error;
    }

    if (error) {
       console.error('Error recording salary adjustment:', error);
       throw error;
    }
  },

  /**
   * 🔢 อัปเดตลำดับการแสดงผลแบบ Batch
   * รับ Array ของ { id, sortOrder } แล้วอัปเดตทีละรายการ
   * ใช้สำหรับ Drag & Drop reorder ในหน้า Reports/Dashboard
   */
  updateSortOrder: async (orderedItems: { id: string; sortOrder: number }[]): Promise<void> => {
    // ใช้ Promise.all เพื่อส่งคำสั่งอัปเดตพร้อมกัน (Parallel)
    const updates = orderedItems.map(item =>
      supabase.from('profiles').update({ sort_order: item.sortOrder }).eq('id', item.id)
    );

    const results = await Promise.all(updates);
    const failed = results.filter(r => r.error);
    
    if (failed.length > 0) {
      console.error(`❌ Failed to update sort order for ${failed.length} items:`, failed.map(f => f.error));
      // Retry with session refresh
      await supabase.auth.refreshSession();
      const retries = orderedItems.map(item =>
        supabase.from('profiles').update({ sort_order: item.sortOrder }).eq('id', item.id)
      );
      await Promise.all(retries);
    }

    console.log(`✅ Sort order updated for ${orderedItems.length} staff members`);
  }
};
