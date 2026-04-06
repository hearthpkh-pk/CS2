import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase environment variables! Check your .env.local file.');
}

// สร้าง Singleton Client ของ Supabase สำหรับเรียกใช้ทั้งแอป
// 🛡️ ปิด navigator.locks เพื่อป้องกัน Lock Contention ที่เกิดจาก React Strict Mode (Dev)
// React Strict Mode จะ mount/unmount/mount component 2 รอบ
// ทำให้ Supabase Auth ใช้ navigator.locks.request() ชนกัน → Error: Lock was stolen
// การ bypass lock นี้ปลอดภัยสำหรับ single-tab app อย่างระบบ HRIS ของเรา
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => {
      return await fn();
    },
  }
});
