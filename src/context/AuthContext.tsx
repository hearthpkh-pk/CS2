'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, Role } from '@/types';
import { supabase } from '@/lib/supabaseClient';

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
  const isInitializedRef = useRef(false); // 🛡️ Track if auth has completed (avoids stale closure)

  useEffect(() => {
    const initializeAuth = async () => {
      // 🛡️ Safety Timeout: ใช้ Ref เพื่อเช็คค่าจริง ไม่ใช่ค่าเก่าจาก Closure
      const timeoutId = setTimeout(() => {
        if (!isInitializedRef.current) {
          console.warn('⚠️ Auth Timeout reached (5s). Forcing to Login screen.');
          isInitializedRef.current = true;
          setIsLoading(false);
        }
      }, 5000);

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (session?.user) {
          await fetchUserProfile(session.user.id, session.user.email);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('❌ Auth Initialization Error:', err);
        setIsLoading(false);
      } finally {
        isInitializedRef.current = true;
        clearTimeout(timeoutId);
      }
    };

    initializeAuth();

    // 2. ดักฟัง Event เมื่อมีการ Login หรือ Logout 
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchUserProfile(session.user.id, session.user.email);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsLoading(false);
        } else if (event === 'INITIAL_SESSION' && !session) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('❌ Auth State Change Error:', err);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ฟังก์ชันดึงข้อมูล Profile แยกมาจากตาราง profiles ที่สร้างจาก Trigger
  const fetchUserProfile = async (uid: string, email?: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle();

      if (error) throw error;

      if (profile) {
        // แมปข้อมูลจาก DB กลับเข้าสู่ Interface User ของเรา
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
        };
        setUser(appUser);
      }
    } catch (e: any) {
      console.error('Failed to fetch user profile:', e);
      
      // 🛡️ ป้องกันบั๊กในโหมด Dev (React Strict Mode) ที่การดึงข้อมูลชนกัน (Race condition)
      // ทำให้โยน AbortError/Lock ออกมา ซึ่งถ้าเราเผลอไป setUser(null) จะทำให้โดนเตะออกจากระบบ
      const isTransientError = e?.message?.includes('Lock') || e?.name === 'AbortError';
      if (!isTransientError) {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // แม้กำลังโหลด ก็แสดงผล SplashScreen เพื่อให้ UI Smooth
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
      isAuthenticated: !!user && user.isActive === true, // 🛡️ ตรวจสอบ is_active ด้วย
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
