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

  // --- Accounts (ยังใช้ LocalStorage ชั่วคราว รอ Phase Data Migration เต็มรูปแบบ) ---
  getAccounts: async (user?: User): Promise<FBAccount[]> => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    let accounts: FBAccount[] = saved ? JSON.parse(saved) : initialAccounts;

    if (!user) return [];
    if (user.role === Role.Developer || user.role === Role.SuperAdmin || user.role === Role.Admin) return accounts;
    if (user.role === Role.Manager) return accounts.filter(a => a.teamId === user.teamId || a.ownerId === user.id);
    return accounts.filter(a => a.ownerId === user.id);
  },

  saveAccount: async (account: FBAccount): Promise<void> => {
    const accounts = await dataService.getAccounts();
    const existingIndex = accounts.findIndex(a => a.id === account.id);
    if (existingIndex >= 0) accounts[existingIndex] = account;
    else accounts.push(account);
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  },

  deleteAccount: async (id: string): Promise<void> => {
    const accounts = await dataService.getAccounts();
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts.filter(a => a.id !== id)));
  }
};
