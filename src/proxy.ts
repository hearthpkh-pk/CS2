import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function proxy(request: NextRequest) {
  // ให้ Supabase ช่วยดูแลเรื่องการต่ออายุ Token ผ่าน Cookie ในทุกๆ Request
  // 🛡️ Optimization: auth/callback จัดการ session เองผ่าน createServerClient
  // ไม่จำเป็นต้อง validate token เพิ่ม ลด latency ตอน OAuth redirect
  if (request.nextUrl.pathname === '/auth/callback') {
    return NextResponse.next({ request });
  }
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
