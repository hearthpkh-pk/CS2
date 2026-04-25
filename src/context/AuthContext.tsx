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

  useEffect(() => {
    // 🛡️ ใช้ onAuthStateChange + INITIAL_SESSION (Supabase Official Pattern)
    // ไม่ต้องเรียก getSession() แยก → ลด Race Condition
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') {
        if (session?.user) {
          await fetchUserProfile(session.user.id, session.user.email);
        } else {
          setIsLoading(false);
        }
      } else if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserProfile(session.user.id, session.user.email);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // 🔄 Token ถูก Auto-refresh สำเร็จ → re-sync user profile เผื่อข้อมูลเปลี่ยน
        await fetchUserProfile(session.user.id, session.user.email);
      } else if (event === 'SIGNED_OUT') {
        // 🏗️ ล้าง IndexedDB Cache เมื่อ Logout เพื่อป้องกันข้อมูลรั่ว
        await logCacheService.clearCache();
        setUser(null);
        setIsLoading(false);
      }
    });

    // 🔄 Visibility Change Listener:
    // เมื่อ user เปิดแท็บค้างนานแล้วกลับมา → force check session validity
    // ถ้า token หมดอายุ Supabase จะ auto-refresh ให้ → ยิง TOKEN_REFRESHED event
    // ถ้า refresh ไม่ได้ (เช่น refresh_token หมดอายุ) → ยิง SIGNED_OUT event
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
           console.warn('⚠️ No active session found on focus, reloading...');
           window.location.reload();
           return;
        }
        if (data.session && data.session.expires_at) {
          // ถ้า session จะหมดอายุในอีก 5 นาที (หรือหมดไปแล้ว) ให้บังคับ refresh ทันที
          const timeToExpiry = (data.session.expires_at * 1000) - Date.now();
          if (timeToExpiry < 5 * 60 * 1000) {
            console.log('🔄 Session expiring soon or expired, proactive refresh...');
            const { error } = await supabase.auth.refreshSession();
            if (error) {
              console.error('❌ Failed to refresh session, forcing reload to trigger middleware...', error);
              window.location.reload();
            }
          }
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 🚀 เริ่มทำงาน Background Sync Engine
    const stopSync = syncService.init();

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (stopSync) stopSync(); // หยุดการซิงค์เมื่อปิดแอป
    };
  }, []);

  const fetchUserProfile = async (uid: string, email?: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle();

      if (error) throw error;

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
      }
    } catch (e: any) {
      console.error('Failed to fetch user profile:', e);
      setUser(null);
    } finally {
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
