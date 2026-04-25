import { Page, DailyLog, FBAccount, User, Role } from "../types";
import { initialPages, generateMockLogs, initialAccounts, initialUsers } from "./mockData";
import { supabase } from '@/lib/supabaseClient';
import { logCacheService } from './logCacheService';

const STORAGE_KEYS = {
  ACCOUNTS: 'cs_accounts'
};

/**
 * 🔄 แปลง DB Schema (snake_case) → Frontend Type (camelCase)
 * ใช้ร่วมกันทั้ง getLogs, getTodayLogsForUser เพื่อลด code duplication
 */
const mapDbLogsToFrontend = (rows: any[]): DailyLog[] => {
  return (rows || []).map(l => ({
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
      notes: p.notes,
      isDeleted: p.is_deleted,
      createdAt: p.created_at,
    }));
  },

  savePage: async (page: Page, skipQueue = false): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      id: (!page.id || page.id === '' || page.id.startsWith('p')) ? undefined : page.id, 
      name: page.name,
      category: page.category,
      status: page.status || 'Active',
      box_id: page.boxId,
      owner_id: page.ownerId || user.id,
      facebook_url: page.facebookUrl,
      facebook_data: page.facebookData,
      notes: page.notes,
      is_deleted: page.isDeleted || false,
    };

    let error;
    if (page.id && !page.id.startsWith('p')) {
      // Update
      const res = await supabase.from('facebook_pages').update(payload).eq('id', page.id);
      error = res.error;
      if (error && error.message?.includes('auth')) {
        await supabase.auth.refreshSession();
        const retry = await supabase.from('facebook_pages').update(payload).eq('id', page.id);
        error = retry.error;
      }
    } else {
      // Insert
      const res = await supabase.from('facebook_pages').insert(payload);
      error = res.error;
      if (error && error.message?.includes('auth')) {
        await supabase.auth.refreshSession();
        const retry = await supabase.from('facebook_pages').insert(payload);
        error = retry.error;
      }
    }

    if (error) {
      console.error('Error saving page:', error);
      if (!skipQueue) {
        console.warn('📡 Adding page save to sync queue...');
        await logCacheService.addToSyncQueue('SAVE_PAGE', page);
        return;
      }
      throw error;
    }
  },

  deletePage: async (id: string): Promise<void> => {
    let { error } = await supabase.from('facebook_pages').delete().eq('id', id);
    if (error && error.message?.includes('auth')) {
      await supabase.auth.refreshSession();
      const retry = await supabase.from('facebook_pages').delete().eq('id', id);
      error = retry.error;
    }
    if (error) console.error('Error deleting page:', error);
  },

  // --- Logs (Supabase + IndexedDB Cache) ---
  // 🏗️ Zero-Cost Strategy: Delta Sync
  // - ครั้งแรก: Full Fetch → เก็บทั้งหมดลง IndexedDB
  // - ครั้งถัดไป: ดึงเฉพาะ rows ที่ใหม่กว่า lastSyncAt
  // - เปิดซ้ำวันเดียวกัน: ใช้ Cache 100%
  getLogs: async (forceRefresh = false): Promise<DailyLog[]> => {
    let { data: { user } } = await supabase.auth.getUser();
    // หากไม่มี user (session หมด) ให้ลอง refresh session ก่อน
    if (!user) {
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.warn('⚠️ Session refresh failed, user not authenticated');
        return [];
      }
      // รีลองดึง user หลัง refresh
      const refreshed = await supabase.auth.getUser();
      user = refreshed.data?.user;
      if (!user) {
        console.warn('⚠️ No user after session refresh');
        return [];
      }
    }
    if (!user) return [];

    // 🛡️ ตรวจสอบว่า cache เป็นของ user คนปัจจุบันหรือไม่
    const cacheValid = await logCacheService.validateForUser(user.id);

    // ถ้า cache ไม่ถูกต้องหรือหมดอายุ ให้บังคับทำ full fetch
    if (!cacheValid) {
      forceRefresh = true;
    }

    if (cacheValid && !forceRefresh) {
      // --- Delta Sync: ดึงเฉพาะข้อมูลใหม่ ---
      const lastSync = await logCacheService.getLastSyncAt();
      const cachedLogs = await logCacheService.getAll();

      if (lastSync && cachedLogs.length > 0) {
        let { data: newRows, error } = await supabase
          .from('daily_logs')
          .select('*')
          .gt('created_at', lastSync);

        // Retry delta sync if auth error
        if (error && error.message?.includes('auth')) {
          console.warn('⚠️ Delta Sync auth error, refreshing session...');
          await supabase.auth.refreshSession();
          const retry = await supabase
            .from('daily_logs')
            .select('*')
            .gt('created_at', lastSync);
          newRows = retry.data;
          error = retry.error;
        }

        if (!error && newRows && newRows.length > 0) {
          const mapped = mapDbLogsToFrontend(newRows);
          await logCacheService.upsertMany(mapped);
          console.log(`🔄 Delta Sync: +${mapped.length} new rows`);
        } else if (!error) {
          console.log('✅ Cache up-to-date, 0 new rows');
        } else {
          console.error('Delta Sync failed:', error);
        }

        await logCacheService.setLastSyncAt(new Date().toISOString());
        return await logCacheService.getAll();
      }
    }

    // --- Full Fetch (ครั้งแรก / Force Refresh / Cache หมดอายุ) ---
    console.log('📡 Full Fetch: Loading all logs from Supabase...');
    const { data: allLogs, error } = await supabase
      .from('daily_logs')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching logs:', error);
      // Fallback: ถ้า fetch ล้มเหลว ลองใช้ cache ที่มีอยู่
      const fallbackLogs = await logCacheService.getAll();
      return fallbackLogs.length > 0 ? fallbackLogs : [];
    }

    const mapped = mapDbLogsToFrontend(allLogs || []);

    // บันทึกลง IndexedDB
    await logCacheService.clearCache();
    await logCacheService.upsertMany(mapped);
    await logCacheService.setCachedUserId(user.id);
    await logCacheService.setLastSyncAt(new Date().toISOString());

    console.log(`💾 Full Fetch complete: ${mapped.length} rows cached`);
    return mapped;
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

    return mapDbLogsToFrontend(logs || []);
  },

  saveLogs: async (newLogs: DailyLog[], skipQueue = false): Promise<void> => {
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
    let { error } = await supabase
      .from('daily_logs')
      .upsert(upsertPayload, { onConflict: 'page_id,date' });

    // 🛡️ Bullet-proof: ถ้าบันทึกไม่ผ่านเพราะ auth หมดอายุ ให้ลอง refresh แล้วบันทึกใหม่
    if (error && error.message?.includes('auth')) {
      console.warn('⚠️ Logs save failed (auth), retrying...');
      await supabase.auth.refreshSession();
      const retry = await supabase
        .from('daily_logs')
        .upsert(upsertPayload, { onConflict: 'page_id,date' });
      error = retry.error;
    }

    if (error) {
      console.error('Error upserting logs:', error.message);
      
      // 🚀 Offline-First: ถ้าไม่ใช่การเรียกจาก sync engine และบันทึกไม่สำเร็จ ให้ลงคิวไว้
      if (!skipQueue) {
        console.warn('📡 Network/Auth issue, adding logs to sync queue...');
        await logCacheService.addToSyncQueue('SAVE_LOGS', newLogs);
        // อัปเดต Cache ในเครื่องเพื่อให้ UI แสดงผลเสมือนว่าบันทึกสำเร็จ
        await logCacheService.upsertMany(newLogs);
        return;
      }
      throw error;
    }

    // 🏗️ อัปเดต Cache ทันทีหลัง upsert สำเร็จ — ไม่ต้อง re-fetch จาก Supabase
    await logCacheService.upsertMany(newLogs);
    await logCacheService.setLastSyncAt(new Date().toISOString());
  },

  // --- Accounts (Supabase Migration Phase 2) ---
  getAccounts: async (user?: User): Promise<FBAccount[]> => {
    let query = supabase.from('facebook_accounts').select('*');

    // หากมีการส่ง user เข้ามาให้กรองข้อมูล (Role Filtering)
    if (user) {
      if (user.role === Role.Manager) {
        // Manager เห็นบัญชีในทีมตัวเอง (+ของตัวเอง)
        query = query.or(`team_id.eq.${user.teamId},owner_id.eq.${user.id}`);
      } else if (user.role !== Role.SuperAdmin && user.role !== Role.Admin) {
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
      rawText: a.raw_text,
      notes: a.notes,
      isDeleted: a.is_deleted,
      createdAt: a.created_at,
      deletedAt: a.deleted_at
    }));
  },

  saveAccount: async (account: FBAccount, skipQueue = false): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      id: (!account.id || account.id === '' || account.id.startsWith('acc-')) ? undefined : account.id, 
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
      raw_text: account.rawText,
      notes: account.notes,
      is_deleted: account.isDeleted || false,
    };

    let error;
    if (account.id && !account.id.startsWith('acc-')) {
      const res = await supabase.from('facebook_accounts').update(payload).eq('id', account.id);
      error = res.error;
      if (error && error.message?.includes('auth')) {
        await supabase.auth.refreshSession();
        const retry = await supabase.from('facebook_accounts').update(payload).eq('id', account.id);
        error = retry.error;
      }
    } else {
      const res = await supabase.from('facebook_accounts').insert(payload);
      error = res.error;
      if (error && error.message?.includes('auth')) {
        await supabase.auth.refreshSession();
        const retry = await supabase.from('facebook_accounts').insert(payload);
        error = retry.error;
      }
    }

    if (error) {
      console.error('Error saving account:', error);
      if (!skipQueue) {
        console.warn('📡 Adding account save to sync queue...');
        await logCacheService.addToSyncQueue('SAVE_ACCOUNT', account);
        return;
      }
      throw error;
    }
  },

  deleteAccount: async (id: string): Promise<void> => {
    let { error } = await supabase.from('facebook_accounts').delete().eq('id', id);
    if (error && error.message?.includes('auth')) {
      await supabase.auth.refreshSession();
      const retry = await supabase.from('facebook_accounts').delete().eq('id', id);
      error = retry.error;
    }
    if (error) console.error('Error deleting account:', error);
  }
};
