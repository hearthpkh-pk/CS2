import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase environment variables! Check your .env.local file.');
}

// สร้าง Singleton Client ของ Supabase สำหรับเรียกใช้ทั้งแอป
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
