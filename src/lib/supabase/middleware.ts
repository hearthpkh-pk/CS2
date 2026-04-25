import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  // สร้าง response เริ่มต้น
  let supabaseResponse = NextResponse.next({
    request,
  });

  // สร้าง Supabase Client สำหรับฝั่งเซิร์ฟเวอร์
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // อัปเดตคุกกี้ที่ request (เพื่อให้โค้ดด้านล่างใช้งานต่อได้)
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          
          // สร้าง response ใหม่เพื่อรับคุกกี้
          supabaseResponse = NextResponse.next({
            request,
          });
          
          // ตั้งค่าคุกกี้ใน response ที่จะส่งกลับไปยังเบราว์เซอร์
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 🛡️ หัวใจสำคัญ: เรียก getUser() เพื่อให้ Supabase ตรวจสอบ Token
  // ถ้า Token จะหมดอายุ มันจะขอใหม่แล้วเขียนลง Cookie ให้อัตโนมัติ (ผ่าน setAll ด้านบน)
  await supabase.auth.getUser();

  return supabaseResponse;
}
