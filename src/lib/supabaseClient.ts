import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase environment variables! Check your .env.local file.');
}

// 🛡️ เปลี่ยนมาใช้ createBrowserClient เพื่อจัดการ Session ผ่าน Cookie อัตโนมัติ
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
