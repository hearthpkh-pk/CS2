import { supabase } from '@/lib/supabaseClient';
import { logCacheService } from './logCacheService';
import { dataService } from './dataService';
import { personnelService } from './personnelService';

export const syncService = {
  /**
   * 🔄 ประมวลผลคิวที่ค้างอยู่ทั้งหมด
   */
  processQueue: async (): Promise<void> => {
    // 🛡️ ตรวจสอบเน็ตก่อนเริ่ม
    if (typeof window !== 'undefined' && !navigator.onLine) return;

    const pendingItems = await logCacheService.getPendingSyncItems();
    if (pendingItems.length === 0) return;

    console.log(`📡 Sync Engine: Processing ${pendingItems.length} pending items...`);

    for (const item of pendingItems) {
      try {
        await logCacheService.updateSyncItem(item.id, { status: 'syncing' });

        let success = false;
        
        switch (item.type) {
          case 'SAVE_LOGS':
            await dataService.saveLogs(item.payload, true); // true = skip queue (direct write)
            success = true;
            break;
          case 'SAVE_PAGE':
            await dataService.savePage(item.payload, true);
            success = true;
            break;
          case 'SAVE_ACCOUNT':
            await dataService.saveAccount(item.payload, true);
            success = true;
            break;
          case 'SAVE_USER':
            await personnelService.saveUser(item.payload, true);
            success = true;
            break;
          case 'SAVE_TEAM':
            await personnelService.saveTeam(item.payload, true);
            success = true;
            break;
        }

        if (success) {
          await logCacheService.removeFromSyncQueue(item.id);
          console.log(`✅ Sync Engine: Item ${item.id} (${item.type}) synced successfully.`);
        }
      } catch (error) {
        console.error(`❌ Sync Engine: Failed to sync item ${item.id}:`, error);
        await logCacheService.updateSyncItem(item.id, { 
          status: 'pending', 
          retryCount: (item.retryCount || 0) + 1,
          lastError: (error as Error).message
        });
      }
    }
  },

  /**
   * 🚀 เริ่มทำงาน Background Sync
   */
  init: () => {
    if (typeof window === 'undefined') return;

    // เช็คคิวทุกๆ 30 วินาที
    const interval = setInterval(() => {
      syncService.processQueue();
    }, 30000);

    // เช็คทันทีเมื่อเน็ตกลับมา
    window.addEventListener('online', () => {
      console.log('🌐 Internet is back! Triggering immediate sync...');
      syncService.processQueue();
    });

    // เช็คเมื่อกลับมาเปิดแท็บ
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        syncService.processQueue();
      }
    });

    return () => clearInterval(interval);
  }
};
