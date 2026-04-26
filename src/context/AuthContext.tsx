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
    // ⚡ SUPER FAST PATH: หา Session จาก Cookie ทันที (0ms) ป้องกัน Web Lock
    // ═══════════════════════════════════════════════════════════════
    let fastPathUser: any = null;
    try {
      const cookies = document.cookie.split('; ');
      const authCookie = cookies.find(c => c.startsWith('sb-') && c.includes('-auth-token'));
      if (authCookie) {
        const parsed = JSON.parse(decodeURIComponent(authCookie.split('=')[1]));
        const expiresAt = parsed?.expires_at;
        const nowInSeconds = Math.floor(Date.now() / 1000);
        
        // ถ้าระยะเวลาหมดอายุเหลือมากกว่า 2 นาที (120 วินาที) -> ถือว่า Valid สุดๆ ใช้ได้เลย!
        if (parsed?.user?.id && expiresAt && (expiresAt - nowInSeconds) > 120) {
          fastPathUser = parsed.user;
          console.log('⚡ Fast Path: Valid Session found, bypassing Web Lock!');
        } else {
          console.log('⚠️ Fast Path: Session expired or expiring soon, falling back to secure refresh.');
        }
      }
    } catch (e) { /* ignore parse error */ }

    // ═══════════════════════════════════════════════════════════════
    // 🚀 ENTERPRISE AUTHENTICATION INIT (Robust & Race-Condition Free)
    // ═══════════════════════════════════════════════════════════════
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        if (fastPathUser) {
          // ถ้ามี Fast Path เราเอา ID ไปดึง Profile ได้เลย ไม่ต้องรอ getSession
          await fetchUserProfile(fastPathUser.id, fastPathUser.email);
          if (!stopSync) stopSync = syncService.init();
          return; // จบการทำงาน
        }

        console.log('🔄 Checking initial session via Supabase (Web Lock active)...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (session?.user && isMounted) {
          console.log('✅ Initial session found via getSession, fetching profile...');
          await fetchUserProfile(session.user.id, session.user.email);
          if (!stopSync) stopSync = syncService.init();
        } else if (isMounted) {
          console.log('🔓 No valid session found. Resolving to login.');
          resolveAuth(null);
        }
      } catch (e) {
        console.error('❌ Auth initialization error:', e);
        if (isMounted) resolveAuth(null);
      } finally {
        if (isMounted && !isResolved) markResolved();
      }
    };

    // เริ่มต้นเช็ค Session
    initializeAuth();

    // ───────────────────────────────────────────────────────────────
    // 📡 BACKGROUND LISTENER: จัดการการเปลี่ยนแปลงของ Session (Login, Logout, Token Refresh)
    // ───────────────────────────────────────────────────────────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`📡 Auth Event Fired: ${event}`);
      
      if (!isMounted) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          await fetchUserProfile(session.user.id, session.user.email);
          if (!stopSync) stopSync = syncService.init();
          cleanAuthUrl();
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User SIGNED_OUT');
        await logCacheService.clearCache();
        if (stopSync) stopSync();
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
      isMounted = false;
      if (authTimeout) clearTimeout(authTimeout);
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (stopSync) stopSync();
    };
  }, [resolveAuth]);

  const fetchUserProfile = async (uid: string, email?: string, retryCount = 0): Promise<void> => {
    console.log(`⏳ Starting profile fetch for UID: ${uid} (Attempt ${retryCount + 1})`);
    try {
      // 🛡️ ป้องกัน Query ค้างตลอดกาล โดยตั้งเวลา 8 วินาที
      let timeoutId: NodeJS.Timeout;
      const timeoutPromise = new Promise<{data: any, error: any}>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Profile query timeout')), 8000);
      });

      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle()
        .then(res => {
          clearTimeout(timeoutId);
          return res;
        });

      const { data: profile, error } = await Promise.race([fetchPromise, timeoutPromise]);

      if (error) {
        console.error(`❌ Supabase profile query error (Attempt ${retryCount + 1}):`, error);
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
        // 💡 WORLD-CLASS SOLUTION: Database Trigger Race Condition
        // เวลาสมัครใหม่ด้วย Google บางครั้ง Trigger ฝั่ง Database ที่ใช้สร้าง Profile 
        // ทำงานช้ากว่า Frontend ที่ยิงไปขอข้อมูล ทำให้หา Profile ไม่เจอในรอบแรก
        if (retryCount < 3) {
          console.warn(`⚠️ No profile found for UID: ${uid}. Retrying in ${500 * (retryCount + 1)}ms...`);
          await new Promise(resolve => setTimeout(resolve, 500 * (retryCount + 1)));
          return fetchUserProfile(uid, email, retryCount + 1);
        }
        
        console.error(`❌ Exhausted retries. No profile found for UID: ${uid}`);
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
