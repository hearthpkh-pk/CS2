/**
 * 🏗️ Log Cache Service — Zero-Cost Dashboard Architecture
 * 
 * ใช้ IndexedDB เก็บ daily_logs ฝั่ง Client เพื่อลด Supabase reads ให้เหลือ ~0
 * 
 * Strategy:
 * - ครั้งแรก: Full Fetch → เก็บทั้งหมดลง IndexedDB
 * - ครั้งถัดไป: Delta Sync → ดึงเฉพาะ rows ที่ created_at > lastSyncAt
 * - เปิดแอปซ้ำในวันเดียวกัน: ใช้ Cache 100% (0 API calls)
 * 
 * Edge Cases:
 * - User เปลี่ยนบัญชี → clearCache() อัตโนมัติ
 * - IndexedDB ไม่รองรับ (Incognito) → Fallback เป็น in-memory
 * - Cache เก่าเกิน 24 ชม. → Auto full-refresh
 */

import { DailyLog } from '@/types';

const DB_NAME = 'cs2_log_cache';
const DB_VERSION = 1;
const STORE_LOGS = 'daily_logs';
const STORE_META = 'meta';

// Meta keys
const META_LAST_SYNC = 'lastSyncAt';
const META_USER_ID = 'cachedUserId';

// 24 ชั่วโมง (ms) — หลังจากนี้จะ force full-refresh
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

// --- In-Memory Fallback (สำหรับ Incognito / SSR) ---
let memoryFallback: {
  logs: Map<string, DailyLog>;
  lastSyncAt: string | null;
  userId: string | null;
} | null = null;

const getMemoryFallback = () => {
  if (!memoryFallback) {
    memoryFallback = { logs: new Map(), lastSyncAt: null, userId: null };
  }
  return memoryFallback;
};

// --- IndexedDB Helpers ---

/**
 * เปิดหรือสร้าง IndexedDB
 * ถ้าเปิดไม่ได้ (Incognito/SSR) จะ return null → ใช้ in-memory แทน
 */
const openDB = (): Promise<IDBDatabase | null> => {
  return new Promise((resolve) => {
    // SSR guard: IndexedDB ไม่มีบน Server
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }

    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Store สำหรับเก็บ DailyLog — ใช้ composite key: pageId + date
        if (!db.objectStoreNames.contains(STORE_LOGS)) {
          const logStore = db.createObjectStore(STORE_LOGS, { keyPath: 'cacheKey' });
          logStore.createIndex('by_pageId', 'pageId', { unique: false });
          logStore.createIndex('by_date', 'date', { unique: false });
        }

        // Store สำหรับเก็บ metadata (lastSyncAt, userId)
        if (!db.objectStoreNames.contains(STORE_META)) {
          db.createObjectStore(STORE_META, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      
      // IndexedDB อาจล้มเหลวใน Incognito mode ของบาง browser
      request.onerror = () => {
        console.warn('⚠️ IndexedDB unavailable, falling back to in-memory cache');
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
};

/**
 * สร้าง Cache Key สำหรับ DailyLog
 * ใช้ pageId + date เป็น composite key → Upsert ได้ถูกต้อง
 */
const makeCacheKey = (pageId: string, date: string): string => `${pageId}::${date}`;

// ===========================
//  PUBLIC API
// ===========================

export const logCacheService = {
  /**
   * ดึง logs ทั้งหมดจาก Cache
   */
  getAll: async (): Promise<DailyLog[]> => {
    const db = await openDB();
    if (!db) {
      return Array.from(getMemoryFallback().logs.values());
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_LOGS, 'readonly');
      const store = tx.objectStore(STORE_LOGS);
      const request = store.getAll();

      request.onsuccess = () => {
        // ลบ cacheKey ออกก่อน return (เป็น internal field)
        const logs: DailyLog[] = (request.result || []).map((row: any) => {
          const { cacheKey, ...log } = row;
          return log as DailyLog;
        });
        resolve(logs);
      };
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * เขียน/อัปเดต logs เข้า Cache (Upsert by pageId + date)
   */
  upsertMany: async (logs: DailyLog[]): Promise<void> => {
    if (logs.length === 0) return;

    const db = await openDB();
    if (!db) {
      // In-memory fallback
      const mem = getMemoryFallback();
      logs.forEach(log => {
        const key = makeCacheKey(log.pageId, log.date);
        mem.logs.set(key, log);
      });
      return;
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_LOGS, 'readwrite');
      const store = tx.objectStore(STORE_LOGS);

      logs.forEach(log => {
        // เพิ่ม cacheKey สำหรับ IndexedDB keyPath
        const record = {
          ...log,
          cacheKey: makeCacheKey(log.pageId, log.date)
        };
        store.put(record);
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  /**
   * อ่าน timestamp ครั้งล่าสุดที่ sync สำเร็จ
   */
  getLastSyncAt: async (): Promise<string | null> => {
    const db = await openDB();
    if (!db) return getMemoryFallback().lastSyncAt;

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_META, 'readonly');
      const store = tx.objectStore(STORE_META);
      const request = store.get(META_LAST_SYNC);

      request.onsuccess = () => resolve(request.result?.value || null);
      request.onerror = () => resolve(null);
    });
  },

  /**
   * บันทึก timestamp ที่ sync ล่าสุด
   */
  setLastSyncAt: async (timestamp: string): Promise<void> => {
    const db = await openDB();
    if (!db) {
      getMemoryFallback().lastSyncAt = timestamp;
      return;
    }

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_META, 'readwrite');
      const store = tx.objectStore(STORE_META);
      store.put({ key: META_LAST_SYNC, value: timestamp });
      tx.oncomplete = () => resolve();
    });
  },

  /**
   * ตรวจสอบว่า cache เป็นของ user คนปัจจุบันหรือไม่
   * ถ้าเปลี่ยนบัญชี → ต้อง clearCache() ก่อน
   */
  getCachedUserId: async (): Promise<string | null> => {
    const db = await openDB();
    if (!db) return getMemoryFallback().userId;

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_META, 'readonly');
      const store = tx.objectStore(STORE_META);
      const request = store.get(META_USER_ID);

      request.onsuccess = () => resolve(request.result?.value || null);
      request.onerror = () => resolve(null);
    });
  },

  /**
   * บันทึก user ID ที่เป็นเจ้าของ Cache ปัจจุบัน
   */
  setCachedUserId: async (userId: string): Promise<void> => {
    const db = await openDB();
    if (!db) {
      getMemoryFallback().userId = userId;
      return;
    }

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_META, 'readwrite');
      const store = tx.objectStore(STORE_META);
      store.put({ key: META_USER_ID, value: userId });
      tx.oncomplete = () => resolve();
    });
  },

  /**
   * ตรวจสอบว่า cache หมดอายุหรือยัง (เก่าเกิน 24 ชม.)
   */
  isCacheStale: async (): Promise<boolean> => {
    const lastSync = await logCacheService.getLastSyncAt();
    if (!lastSync) return true;

    const elapsed = Date.now() - new Date(lastSync).getTime();
    return elapsed > CACHE_MAX_AGE_MS;
  },

  /**
   * ล้าง Cache ทั้งหมด (ใช้เมื่อ logout หรือเปลี่ยนบัญชี)
   */
  clearCache: async (): Promise<void> => {
    // Clear in-memory
    memoryFallback = null;

    const db = await openDB();
    if (!db) return;

    return new Promise((resolve) => {
      const tx = db.transaction([STORE_LOGS, STORE_META], 'readwrite');
      tx.objectStore(STORE_LOGS).clear();
      tx.objectStore(STORE_META).clear();
      tx.oncomplete = () => resolve();
    });
  },

  /**
   * 🛡️ Validate & Prepare Cache สำหรับ user ปัจจุบัน
   * - ถ้า userId ไม่ตรง → clear cache อัตโนมัติ
   * - return true ถ้า cache ใช้งานได้ (ไม่ต้อง full fetch)
   */
  validateForUser: async (currentUserId: string): Promise<boolean> => {
    const cachedUserId = await logCacheService.getCachedUserId();

    // User เปลี่ยนบัญชี → ล้าง cache ทั้งหมด
    if (cachedUserId && cachedUserId !== currentUserId) {
      console.log('🔄 User changed, clearing log cache...');
      await logCacheService.clearCache();
      return false;
    }

    // ไม่เคย sync มาก่อน
    if (!cachedUserId) return false;

    // Cache เก่าเกิน 24 ชม.
    const stale = await logCacheService.isCacheStale();
    if (stale) {
      console.log('🔄 Cache stale (>24h), will full refresh...');
      await logCacheService.clearCache();
      return false;
    }

    return true;
  }
};
