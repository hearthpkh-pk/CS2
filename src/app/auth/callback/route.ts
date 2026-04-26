import { NextResponse } from 'next/server'
// Supabase server client instance for Next.js app router API routes.
// We use createServerClient instead of browser client here.
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options })
          },
        },
      }
    )
    
    // Server exchanges code for session, stores it in HTTP-only cookies, 
    // and returns a redirect response. The browser doesn't touch the code!
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // ✅ SUCCESS: Redirect back to app. The URL will NOT have ?code= in it.
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      console.error('OAuth exchange error:', error)
    }
  }

  // ❌ FAIL: fallback to root if missing code or error
  return NextResponse.redirect(`${origin}/?error=auth_failed`)
}
