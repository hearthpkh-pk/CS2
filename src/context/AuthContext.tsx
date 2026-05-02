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

const PROFILE_CACHE_KEY = 'auth_profile_cache';

// 🛡️ Profile Cache Helpers: 0ms hydration on page refresh
const getCachedProfile = (): User | null => {
  try {
    const raw = sessionStorage.getItem(PROFILE_CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    // ถ้า cache เกิน 24 ชม. ถือว่า expired
    if (Date.now() - cached._cachedAt > 24 * 60 * 60 * 1000) {
      sessionStorage.removeItem(PROFILE_CACHE_KEY);
      return null;
    }
    return cached.user;
  } catch { return null; }
};

const setCachedProfile = (user: User) => {
  try {
    sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({ user, _cachedAt: Date.now() }));
  } catch { /* ignore */ }
};

const clearCachedProfile = () => {
  try { sessionStorage.removeItem(PROFILE_CACHE_KEY); } catch { /* ignore */ }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Track auth resolved state for visibility handler guard
  const authResolvedRef = React.useRef(false);
  // 🛡️ Guard: prevent concurrent profile fetches
  const profileFetchingRef = React.useRef(false);

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
        // ⚡ INSTANT HYDRATION: ใช้ cached profile + cookie data แสดง UI ทันที (0ms)
        const cachedProfile = getCachedProfile();
        if (cachedProfile) {
          console.log('⚡ INSTANT: Hydrating from sessionStorage cache');
          resolveAuth(cachedProfile); // แสดง UI ทันที
          // 🔄 Background refresh: ดึง profile ใหม่เงียบๆ ไม่ block UI
          fetchUserProfile(cachedProfile.id, cachedProfile.email, true);
          if (!stopSync) stopSync = syncService.init();
          return;
        }

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
    const handleTokenError = async (error: any, context: string) => {
      // 1. ถ้าปัญหาเกิดจากเน็ตหลุด/Sleep Mode -> ปล่อยผ่าน ไม่ต้องลบ Session!
      if (!navigator.onLine || error?.message?.includes('FetchError') || error?.message?.includes('Network')) {
        console.warn(`⚠️ Network offline during ${context}, deferring token refresh. Do not logout.`);
        return;
      }
      
      // 2. ถ้า Token ตายสนิทจริงๆ -> บันทึกหน้าปัจจุบันไว้ แล้วค่อย Logout
      console.error(`❌ Session dead during ${context}. Preparing for re-login...`, error);
      try {
        const currentPath = window.location.pathname + window.location.search;
        if (!currentPath.includes('login')) {
          sessionStorage.setItem('redirect_after_login', currentPath);
        }
      } catch (e) {}
      
      await supabase.auth.signOut({ scope: 'local' });
      resolveAuth(null);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`📡 Auth Event Fired: ${event}`);
      
      if (!isMounted) return;

      if (event === 'SIGNED_IN') {
        if (session?.user) {
          // 🛡️ Guard: ถ้า profile ตรงกับที่มีอยู่แล้ว ไม่ fetch ซ้ำ
          if (profileFetchingRef.current) {
            console.log('🛡️ SIGNED_IN: Profile fetch already in progress, skipping');
            return;
          }
          // 🔥 Fire and forget to avoid holding the Supabase Web Lock
          fetchUserProfile(session.user.id, session.user.email).catch(console.error);
          if (!stopSync) stopSync = syncService.init();
          cleanAuthUrl();
        }
      } else if (event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          // Token refreshed successfully - just update session, no need to re-fetch profile
          console.log('✅ Token refreshed successfully');
          cleanAuthUrl();
        } else {
          // Token refresh returned no session - session is dead
          handleTokenError(null, 'TOKEN_REFRESHED (No Session)').catch(console.error);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User SIGNED_OUT');
        if (stopSync) stopSync();
        resolveAuth(null); // UI กลับไปหน้า Login ทันที
        logCacheService.clearCache().catch(console.error); // เคลียร์ Cache เบื้องหลัง
      }
    });

    // 🔄 Visibility Change Listener:
    // เมื่อผู้ใช้สลับแท็บกลับมา ให้เรียก getSession() ซึ่ง Supabase จะจัดการ Refresh ให้เองถ้าใกล้หมดอายุ (ไม่ต้องฝืนเรียก refreshSession)
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && authResolvedRef.current) {
        try {
          await supabase.auth.getSession();
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

  const fetchUserProfile = async (uid: string, email?: string, isBackground = false): Promise<void> => {
    // 🛡️ Guard: skip if another fetch is in progress
    if (profileFetchingRef.current) {
      console.log('🛡️ Profile fetch already in progress, skipping duplicate');
      return;
    }
    profileFetchingRef.current = true;

    const maxRetries = 2;
    let attempt = 0;
    let success = false;

    while (attempt <= maxRetries && !success) {
      console.log(`⏳ Starting profile fetch for UID: ${uid} (Attempt ${attempt + 1})`);
      try {
        // 🛡️ ป้องกัน Query ค้างตลอดกาล โดยตั้งเวลา 8 วินาที (ลดลงจาก 12 เพื่อให้ retry ได้เร็วขึ้น)
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
          throw error;
        }

        console.log(`✅ Profile fetch complete. Profile found: ${!!profile}`);

        if (profile) {
          // ✅ Profile พบแล้ว — map ข้อมูลและ set user ได้เลย
          // 🛡️ ไม่ทำ DELETE หรือ INSERT ที่ Frontend เด็ดขาด
          // การ Relink UUID เป็นหน้าที่ของ DB Trigger (handle_new_user) เพียงอย่างเดียว
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
          setCachedProfile(appUser);
          setUser(appUser);
          success = true;
        } else {
          // 🔄 Profile ไม่เจอด้วย ID — อาจเป็นเพราะ DB Trigger กำลัง UPDATE อยู่
          // Strategy: รอแล้ว Retry โดยไม่พยายาม Relink เอง
          console.warn(`⚠️ Profile not found for UID: ${uid} (Attempt ${attempt + 1}). DB Trigger may still be running...`);
          
          // โยน error เพื่อให้ while loop retry ด้วย backoff delay
          throw new Error('Profile not ready yet — trigger may be running');
        }
      } catch (e: any) {
        console.error(`❌ Supabase profile query error (Attempt ${attempt + 1}):`, e.message || e);
        
        if (attempt < maxRetries) {
          console.warn(`⚠️ Retrying in ${1000 * (attempt + 1)}ms...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          attempt++;
        } else {
          // หมดโควต้า Retry
          console.error(`❌ Exhausted retries. No profile found for UID: ${uid}`);
          if (isBackground) {
            console.warn('⚠️ Background profile refresh failed — keeping existing session intact.');
          } else {
            const fallback = getCachedProfile();
            if (fallback) {
              console.warn('⚠️ Profile fetch failed but found cached profile — using cache.');
              setUser(fallback);
            } else {
              setUser(null);
            }
          }
          break; // จบลูป
        }
      }
    } // End of while loop

    profileFetchingRef.current = false;
    if (!isBackground) {
      console.log('🏁 Setting isLoading to false');
      setIsLoading(false);
    }
  };

  const logout = async () => {
    clearCachedProfile();
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
