import { Page, DailyLog, FBAccount, User, Role } from "../types";
import { initialPages, generateMockLogs, initialAccounts, initialUsers } from "./mockData";
import { supabase } from '@/lib/supabaseClient';

const STORAGE_KEYS = {
  ACCOUNTS: 'cs_accounts'
};

export const dataService = {
  // --- Pages (Supabase) ---
  getPages: async (): Promise<Page[]> => {
    const { data: pages, error } = await supabase
      .from('facebook_pages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pages:', error);
      return [];
    }

    // Map DB schema back to Frontend Type
    return (pages || []).map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      status: p.status,
      boxId: p.box_id,
      ownerId: p.owner_id,
      teamId: p.team_id,
      facebookUrl: p.facebook_url,
      facebookData: p.facebook_data,
      isDeleted: p.is_deleted,
      createdAt: p.created_at,
    }));
  },

  savePage: async (page: Page): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      id: (!page.id || page.id === '' || page.id.startsWith('p')) ? undefined : page.id, // ให้ Postgres gen_random_uuid() อัตโนมัติถ้าไม่มี ID
      name: page.name,
      category: page.category,
      status: page.status || 'Active',
      box_id: page.boxId,
      owner_id: page.ownerId || user.id,
      facebook_url: page.facebookUrl,
      facebook_data: page.facebookData,
      is_deleted: page.isDeleted || false,
    };

    if (page.id && !page.id.startsWith('p')) {
      // Update
      const { error } = await supabase.from('facebook_pages').update(payload).eq('id', page.id);
      if (error) console.error('Error updating page:', error);
    } else {
      // Insert
      const { error } = await supabase.from('facebook_pages').insert(payload);
      if (error) console.error('Error inserting page:', error);
    }
  },

  deletePage: async (id: string): Promise<void> => {
    const { error } = await supabase.from('facebook_pages').delete().eq('id', id);
    if (error) console.error('Error deleting page:', error);
  },

  // --- Logs (Supabase) ---
  getLogs: async (): Promise<DailyLog[]> => {
    const { data: logs, error } = await supabase
      .from('daily_logs')
      .select('*')
      .order('date', { ascending: false })
      .limit(100); // กั้นไว้กันดึงข้อมูลมหาศาลเกินความจำเป็น

    if (error) {
      console.error('Error fetching logs:', error);
      return [];
    }

    return (logs || []).map(l => ({
      id: l.id,
      pageId: l.page_id,
      staffId: l.staff_id,
      date: l.date,
      followers: l.followers,
      views: l.views,
      reach: l.reach,
      engagement: l.engagement,
      source: l.source,
      clipsCount: l.clips_count,
      links: l.links || [],
      createdAt: l.created_at
    }));
  },

  // Targeted Query: ดึงเฉพาะของพนักงานคนเดียว ในวันที่ระบุ (รวดเร็วและ Scalable กว่า)
  getTodayLogsForUser: async (staffId: string, date: string): Promise<DailyLog[]> => {
    const { data: logs, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('staff_id', staffId)
      .eq('date', date);

    if (error) {
      console.error('Error fetching today logs:', error);
      return [];
    }

    return (logs || []).map(l => ({
      id: l.id,
      pageId: l.page_id,
      staffId: l.staff_id,
      date: l.date,
      followers: l.followers,
      views: l.views,
      reach: l.reach,
      engagement: l.engagement,
      source: l.source,
      clipsCount: l.clips_count,
      links: l.links || [],
      createdAt: l.created_at
    }));
  },

  saveLogs: async (newLogs: DailyLog[]): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const upsertPayload = newLogs.map(log => ({
      page_id: log.pageId,
      staff_id: log.staffId || user.id,
      date: log.date,
      followers: log.followers,
      views: log.views,
      reach: log.reach || 0,
      engagement: log.engagement || 0,
      clips_count: log.clipsCount || 0,
      links: log.links || [],
      source: log.source || 'Manual'
    }));

    // ใช้ Upsert: ถ้ารหัสคู่ page_id + date ซ้ำกัน จะทำการดึงข้อมูลใหม่ไปเขียนทับ 
    const { error } = await supabase
      .from('daily_logs')
      .upsert(upsertPayload, { onConflict: 'page_id, date' });

    if (error) {
      console.error('Error upserting logs:', error);
    }
  },

  // --- Accounts (Supabase Migration Phase 2) ---
  getAccounts: async (user?: User): Promise<FBAccount[]> => {
    let query = supabase.from('facebook_accounts').select('*');
    
    // หากมีการส่ง user เข้ามาให้กรองข้อมูล (Role Filtering)
    if (user) {
      if (user.role === Role.Manager) {
        // Manager เห็นบัญชีในทีมตัวเอง (+ของตัวเอง)
        query = query.or(`team_id.eq.${user.teamId},owner_id.eq.${user.id}`);
      } else if (user.role !== Role.Developer && user.role !== Role.SuperAdmin && user.role !== Role.Admin) {
        // Staff เห็นแค่ของตัวเอง
        query = query.eq('owner_id', user.id);
      }
    }

    const { data: accounts, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching accounts:', error);
      return [];
    }

    return (accounts || []).map(a => ({
      id: a.id,
      boxId: a.box_id,
      name: a.name,
      uid: a.uid,
      status: a.status,
      ownerId: a.owner_id,
      teamId: a.team_id,
      password: a.password,
      twoFactor: a.two_factor,
      email: a.email,
      emailPassword: a.email_password,
      email2: a.email2,
      profileUrl: a.profile_url,
      cookie: a.cookie,
      isDeleted: a.is_deleted,
      createdAt: a.created_at,
      deletedAt: a.deleted_at
    }));
  },

  saveAccount: async (account: FBAccount): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      id: (!account.id || account.id === '' || account.id.startsWith('acc-')) ? undefined : account.id, // ให้ Postgres gen_random_uuid() อัตโนมัติถ้าไม่มี ID หรือเป็น ID เก่าที่จำลองมา
      box_id: account.boxId,
      name: account.name,
      uid: account.uid,
      status: account.status || 'Live',
      owner_id: account.ownerId || user.id,
      team_id: account.teamId,
      password: account.password,
      two_factor: account.twoFactor,
      email: account.email,
      email_password: account.emailPassword,
      email2: account.email2,
      profile_url: account.profileUrl,
      cookie: account.cookie,
      is_deleted: account.isDeleted || false,
    };

    if (account.id && !account.id.startsWith('acc-')) {
      // Update
      const { error } = await supabase.from('facebook_accounts').update(payload).eq('id', account.id);
      if (error) console.error('Error updating account:', error);
    } else {
      // Insert
      const { error } = await supabase.from('facebook_accounts').insert(payload);
      if (error) console.error('Error inserting account:', error);
    }
  },

  deleteAccount: async (id: string): Promise<void> => {
    // ใช้ Soft Delete เพื่อเก็บบันทึกประวัติ หรือ Hard Delete ถ้าต้องการ
    const { error } = await supabase.from('facebook_accounts').delete().eq('id', id);
    if (error) console.error('Error deleting account:', error);
  }
};
