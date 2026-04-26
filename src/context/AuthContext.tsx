'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { logCacheService } from '@/services/logCacheService';
import { syncService } from '@/services/syncService'; // เพิ่มการนำเข้าคิวซิงค์

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Track auth resolved state for visibility handler guard
  const authResolvedRef = React.useRef(false);

  // 🛡️ Helper: resolve auth ได้ครั้งเดียว ป้องกัน race condition
  const resolveAuth = React.useCallback((userData: User | null) => {
    authResolvedRef.current = true;
    setUser(userData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let isResolved = false;
    let stopSync: (() => void) | undefined;
    let authTimeout: ReturnType<typeof setTimeout> | undefined;

    const markResolved = () => {
      isResolved = true;
      authResolvedRef.current = true;
      if (authTimeout) clearTimeout(authTimeout);
    };

    // 🛡️ ลบ ?code= ออกจาก URL (เรียกหลังจาก Auth exchange เสร็จแล้วเท่านั้น!)
    const cleanAuthUrl = () => {
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.has('code')) {
          url.searchParams.delete('code');
          window.history.replaceState({}, '', url.pathname + url.search + url.hash);
        }
      } catch (e) { /* SSR safety */ }
    };

    // ═══════════════════════════════════════════════════════════════
    // 🚀 PRE-FLIGHT CHECK: เช็ค localStorage ก่อนแบบ Synchronous
    // ถ้าไม่มี Token อยู่เลย → ไม่ต้องรอ Auth event → resolve ทันที (0ms)
    // ⚠️ ยกเว้น: ถ้ามี ?code= ใน URL → กำลังอยู่ระหว่าง OAuth redirect
    //    ต้องปล่อยให้ Supabase แลก code เป็น session ก่อน!
    // ═══════════════════════════════════════════════════════════════
    const hasAuthCode = (() => {
      try {
        return new URL(window.location.href).searchParams.has('code');
      } catch { return false; }
    })();

    const hasStoredSession = (() => {
      try {
        const hasLocal = Object.keys(localStorage).some(
          k => k.startsWith('sb-') && k.endsWith('-auth-token')
        );
        const hasCookie = document.cookie.includes('sb-') && document.cookie.includes('-auth-token');
        return hasLocal || hasCookie;
      } catch {
        return false;
      }
    })();

    if (!hasStoredSession && !hasAuthCode) {
      // ✅ ไม่มี Token และไม่มี OAuth Code → User ยังไม่เคย Login → ข้ามไปเลย
      console.log('🔓 No stored session found. Skipping auth wait.');
      markResolved();
      resolveAuth(null);

      // ยังต้อง subscribe เพื่อรับ SIGNED_IN event ตอน Login
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
          await fetchUserProfile(session.user.id, session.user.email);
          if (!stopSync) stopSync = syncService.init();
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          await fetchUserProfile(session.user.id, session.user.email);
        } else if (event === 'SIGNED_OUT') {
          await logCacheService.clearCache();
          resolveAuth(null);
        }
      });

      return () => {
        subscription.unsubscribe();
        if (stopSync) stopSync();
      };
    }

    // ═══════════════════════════════════════════════════════════════
    // 🔐 มี Token อยู่ใน Storage → ลองดึง Session ผ่าน onAuthStateChange
    // ═══════════════════════════════════════════════════════════════

    // 🛡️ Safety Net: ถ้า onAuthStateChange ไม่ยิง (Lock ค้าง)
    // → ใช้ getSession() เพื่ออ่าน Session (รองรับ Cookie จาก @supabase/ssr)
    // ให้เวลา 8 วิสำหรับ OAuth (เพราะต้องรอมันแลก code ผ่านเน็ต) และ 3 วิสำหรับกรณีทั่วไป
    const timeoutDuration = hasAuthCode ? 8000 : 3000;
    authTimeout = setTimeout(async () => {
      if (!isResolved) {
        console.warn(`⚠️ Auth timeout (${timeoutDuration/1000}s): Bypassing lock, reading session...`);
        markResolved();
        cleanAuthUrl();

        try {
          // 🛡️ อ่าน Session จาก Cookie แบบ Manual (เพื่อหลีกเลี่ยง Web Lock Deadlock ของ getSession)
          let sessionUser: { id: string, email?: string } | null = null;

          // 1. ลองหาจาก document.cookie ก่อน
          const cookies = document.cookie.split('; ');
          const authCookie = cookies.find(c => c.startsWith('sb-') && c.includes('-auth-token'));
          if (authCookie) {
            try {
              const cookieValue = decodeURIComponent(authCookie.split('=')[1]);
              // Supabase chunked cookies (sb-xxx-auth-token.0, .1) needs careful parsing, 
              // but normally it's a JSON string.
              const parsed = JSON.parse(cookieValue);
              if (parsed?.user?.id) sessionUser = parsed.user;
            } catch (e) { /* ignore parse error */ }
          }

          // 2. ถ้าไม่เจอใน Cookie ลองหาใน localStorage
          if (!sessionUser) {
            const storageKey = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
            if (storageKey) {
              try {
                const parsed = JSON.parse(localStorage.getItem(storageKey) || '');
                if (parsed?.user?.id) sessionUser = parsed.user;
              } catch (e) { /* ignore parse error */ }
            }
          }

          if (sessionUser?.id) {
            console.log('✅ Found valid session via manual parser, bypassing Supabase Lock...');
            await fetchUserProfile(sessionUser.id, sessionUser.email);
            if (!stopSync) stopSync = syncService.init();
            return;
          }
        } catch (e) {
          console.warn('⚠️ Failed to parse session manually:', e);
        }

        // ถ้าไม่มี session จริงๆ → ลบ Token เก่า + ไปหน้า Login
        try {
          Object.keys(localStorage)
            .filter(k => k.startsWith('sb-') && (k.endsWith('-auth-token') || k.endsWith('-auth-token-code-verifier')))
            .forEach(k => localStorage.removeItem(k));
        } catch (e) { /* ignore */ }

        resolveAuth(null);
      }
    }, timeoutDuration);

    // 🛡️ ใช้ onAuthStateChange + INITIAL_SESSION (Supabase Official Pattern)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`📡 Auth Event Fired: ${event}`, { hasUser: !!session?.user });
      
      // ยกเลิก timeout ทันทีที่ได้รับ event แรก
      if (!isResolved) markResolved();

      if (event === 'INITIAL_SESSION') {
        if (session?.user) {
          console.log('👤 Fetching user profile for:', session.user.email);
          await fetchUserProfile(session.user.id, session.user.email);
        } else {
          console.log('👻 No user in INITIAL_SESSION, resolving null');
          resolveAuth(null);
        }
        // ✅ ลบ ?code= หลังจาก Supabase แลก code เสร็จแล้ว
        cleanAuthUrl();
        // 🚀 เริ่ม Sync Engine หลังจาก Auth resolve แล้วเท่านั้น
        if (!stopSync) stopSync = syncService.init();
      } else if (event === 'SIGNED_IN' && session?.user) {
        console.log('👤 Fetching user profile for SIGNED_IN:', session.user.email);
        await fetchUserProfile(session.user.id, session.user.email);
        cleanAuthUrl();
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        await fetchUserProfile(session.user.id, session.user.email);
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User SIGNED_OUT');
        await logCacheService.clearCache();
        resolveAuth(null);
      }
    });

    // 🔄 Visibility Change Listener:
    // ⚠️ Guard: ไม่รันถ้า Auth ยังไม่ resolve → ป้องกัน Lock Contention
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && authResolvedRef.current) {
        try {
          const { data } = await supabase.auth.getSession();
          if (!data.session) {
            console.warn('⚠️ No active session found on focus, reloading...');
            window.location.reload();
            return;
          }
          if (data.session?.expires_at) {
            const timeToExpiry = (data.session.expires_at * 1000) - Date.now();
            if (timeToExpiry < 5 * 60 * 1000) {
              console.log('🔄 Session expiring soon, proactive refresh...');
              const { error } = await supabase.auth.refreshSession();
              if (error) {
                console.error('❌ Failed to refresh session, signing out...');
                await supabase.auth.signOut({ scope: 'local' });
                window.location.reload();
              }
            }
          }
        } catch (e) {
          console.error('❌ Visibility check failed:', e);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (authTimeout) clearTimeout(authTimeout);
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (stopSync) stopSync();
    };
  }, [resolveAuth]);

  const fetchUserProfile = async (uid: string, email?: string) => {
    console.log(`⏳ Starting profile fetch for UID: ${uid}`);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle();

      if (error) {
        console.error('❌ Supabase profile query error:', error);
        throw error;
      }

      console.log(`✅ Profile fetch complete. Profile found: ${!!profile}`);

      if (profile) {
        const appUser: User = {
          id: profile.id,
          name: profile.name,
          username: profile.username || '',
          email: email,
          role: (profile.role as Role) || Role.Staff,
          teamId: profile.team_id,
          department: profile.department,
          group: profile.group,
          salary: profile.salary,
          isActive: profile.is_active,
          avatarUrl: profile.avatar_url,
        };
        setUser(appUser);
      } else {
        console.warn(`⚠️ No profile found for UID: ${uid}`);
        setUser(null);
      }
    } catch (e: any) {
      console.error('❌ Failed to fetch user profile:', e);
      setUser(null);
    } finally {
      console.log('🏁 Setting isLoading to false');
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await logCacheService.clearCache();
    await supabase.auth.signOut();
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#054ab3] flex flex-col items-center justify-center gap-4">
        <div className="animate-spin text-white">
           <svg className="w-10 h-10" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
           </svg>
        </div>
        <p className="text-white/50 text-xs tracking-widest font-bold uppercase animate-pulse">Authenticating</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user && user.isActive === true,
      isLoading,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
