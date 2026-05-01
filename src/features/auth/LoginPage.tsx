'use client';

import React, { useState, useEffect } from 'react';
import { Lock, User, Activity, ChevronRight, Info, AlertCircle, Mail, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();

  // Easter egg states (for UI fun, no longer bypasses security)
  const [logoClicks, setLogoClicks] = useState(0);
  const [showDevTools, setShowDevTools] = useState(false);

  useEffect(() => {
    if (logoClicks >= 5) {
      setShowDevTools(true);
      const timer = setTimeout(() => {
        setLogoClicks(0);
        setShowDevTools(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [logoClicks]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsAuthenticating(true);
    setErrorMessage('');
    setSuccessMessage('');

    setIsExiting(true);
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      // 🛡️ Supabase returns error ใน response object ไม่ได้ throw!
      if (error) {
        console.error('❌ Sign-in error:', error.message);
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        } else if (error.message.includes('Email not confirmed')) {
          setErrorMessage('กรุณายืนยันอีเมลก่อนเข้าใช้งาน');
        } else if (error.message.includes('Too many requests')) {
          setErrorMessage('เข้าสู่ระบบบ่อยเกินไป กรุณารอสักครู่');
        } else {
          setErrorMessage(error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
        }
        setIsExiting(false);
        return;
      }

      // ✅ Sign‑in succeeded – check if we have a stored redirect URL
      const storedPath = typeof window !== 'undefined' ? sessionStorage.getItem('redirect_after_login') : null;
      if (storedPath) {
        // Clean up storage before navigation
        sessionStorage.removeItem('redirect_after_login');
        // Use Next.js router for client‑side navigation
        router.replace(storedPath);
        console.log('🔀 Redirecting after login to', storedPath);
      } else {
        // No stored path – stay on default dashboard (home)
        router.replace('/');
      }
      setIsExiting(false);
    } catch (err) {
      console.error('❌ Auth connection error:', err);
      setErrorMessage('ไม่สามารถเชื่อมต่อระบบยืนยันตัวตนได้ กรุณาลองใหม่');
      setIsExiting(false);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsAuthenticating(true);
    setErrorMessage('');

    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log('🔑 Google OAuth redirect URL:', redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            prompt: 'select_account',
          },
          // 🛡️ ไม่ redirect อัตโนมัติ เพื่อให้เราเช็ค error ก่อน
          skipBrowserRedirect: true,
        }
      });

      if (error) {
        console.error('❌ Google OAuth error:', error.message);
        if (error.message.includes('Provider not found') || error.message.includes('provider')) {
          setErrorMessage('Google Sign-In ยังไม่ได้เปิดใช้งาน — ติดต่อผู้ดูแลระบบ');
        } else if (error.message.includes('redirect')) {
          setErrorMessage('Redirect URL ไม่ได้รับอนุญาต — ตรวจสอบการตั้งค่า Supabase');
        } else {
          setErrorMessage(`Google Sign-In ล้มเหลว: ${error.message}`);
        }
        setIsAuthenticating(false);
        return;
      }

      // ✅ OAuth URL พร้อมใช้งาน — ทำ exit animation แล้ว redirect
      if (data?.url) {
        console.log('✅ Google OAuth URL received, redirecting...');
        setIsExiting(true);
        await new Promise(resolve => setTimeout(resolve, 300));
        window.location.href = data.url;
      } else {
        setErrorMessage('ไม่สามารถสร้าง Google Sign-In URL ได้');
        setIsAuthenticating(false);
      }
    } catch (err) {
      console.error('❌ Google OAuth connection error:', err);
      setErrorMessage('ไม่สามารถเชื่อมต่อ Google ได้ กรุณาลองใหม่');
      setIsAuthenticating(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMessage('กรุณากรอกอีเมลของคุณในช่อง Work Email เพื่อขอรับลิงก์รีเซ็ตรหัสผ่าน');
      return;
    }

    setIsAuthenticating(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin, // ส่งกลับมาหน้าเว็บหลักเพื่อเข้าสู่ระบบใหม่
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccessMessage('ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยังอีเมลของคุณเรียบร้อยแล้ว\nโปรดตรวจสอบกล่องข้อความของคุณ');
      }
    } catch (err) {
      setErrorMessage('Failed to connect to authentication server.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#054ab3] flex items-center justify-center p-8 font-noto antialiased overflow-hidden text-white relative">
      {/* Subtle Depth Layers */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-white/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-400/10 rounded-full blur-[120px]" />
      </div>

      <div className={cn(
        "w-full max-w-[420px] flex flex-col items-center relative z-10 transition-all transform ease-in-out duration-1000"
      )}>
        
        {/* BRAND IDENTITY */}
        <div className={cn(
          "mb-14 flex flex-col items-center group",
          isExiting 
            ? "animate-slide-out-left" 
            : "animate-slide-in-right"
        )}>
          <button
            onClick={() => setLogoClicks(prev => prev + 1)}
            className="mb-2 select-none active:scale-95 transition-transform duration-300"
          >
            <h1 className="text-6xl font-bold font-outfit tracking-tighter lowercase text-white">Editor</h1>
          </button>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.6em] mt-1 opacity-60">HQ Terminal</p>
        </div>

        {/* ACCESS INTERFACE */}
        <form className="w-full space-y-4" onSubmit={handleAuth}>

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={16} className="text-red-300 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-200">{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <Info size={16} className="text-emerald-300 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-emerald-200 whitespace-pre-line leading-relaxed">{successMessage}</p>
            </div>
          )}

          <div className={cn(
            "relative group/field shadow-2xl shadow-black/10",
            isExiting 
              ? "animate-slide-out-left [animation-delay:75ms]" 
              : "animate-slide-in-right [animation-delay:75ms]"
          )}>
            <div className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400/60 group-focus-within/field:text-[#054ab3] transition-all duration-300">
              <Mail size={18} strokeWidth={2.5} />
            </div>
            <input
              type="email"
              placeholder="Work Email ..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isAuthenticating}
              className="w-full bg-white border-0 rounded-full pl-16 pr-8 py-5 text-[14px] font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-4 focus:ring-white/20 transition-all placeholder:text-slate-300 font-inter disabled:opacity-50"
            />
          </div>

          <div className={cn(
            "relative group/field shadow-2xl shadow-black/10",
            isExiting 
              ? "animate-slide-out-left [animation-delay:150ms]" 
              : "animate-slide-in-right [animation-delay:150ms]"
          )}>
            <div className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400/60 group-focus-within/field:text-[#054ab3] transition-all duration-300">
              <Lock size={18} strokeWidth={2.5} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password ..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isAuthenticating}
              className="w-full bg-white border-0 rounded-full pl-16 pr-14 py-5 text-[14px] font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-4 focus:ring-white/20 transition-all placeholder:text-slate-300 font-inter disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400/60 hover:text-[#054ab3] transition-colors focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
            </button>
          </div>

          <div className={cn(
            isExiting 
              ? "animate-slide-out-left [animation-delay:200ms]" 
              : "animate-slide-in-right [animation-delay:200ms]"
          )}>
            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-5 bg-white text-[#054ab3] rounded-full font-black text-xs tracking-[0.2em] shadow-2xl shadow-black/10 hover:bg-white/95 hover:shadow-white/10 transition-all active:scale-[0.98] mt-6 uppercase disabled:opacity-70 flex justify-center items-center gap-2"
            >
            {isAuthenticating ? (
              <>
                <Activity size={16} className="animate-spin" />
                PROCESSING...
              </>
            ) : ('SIGN IN')}
            </button>
          </div>
        </form>

        <div className={cn(
            "w-full mt-4 relative flex items-center justify-center",
            isExiting 
              ? "animate-slide-out-left [animation-delay:225ms]" 
              : "animate-slide-in-right [animation-delay:225ms]"
          )}>
          <div className="absolute inset-x-0 h-px bg-white/20" />
          <span className="relative bg-[#054ab3] px-4 text-[10px] font-bold text-white/50 uppercase tracking-widest">
            OR
          </span>
        </div>

        <div className={cn(
          "w-full mt-4",
          isExiting 
            ? "animate-slide-out-left [animation-delay:250ms]" 
            : "animate-slide-in-right [animation-delay:250ms]"
        )}>
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isAuthenticating}
            className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full font-bold text-[13px] tracking-wide shadow-2xl backdrop-blur-md transition-all active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-3"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* METADATA INTERACTION */}
        <div className={cn(
          "mt-6 flex flex-col items-center gap-3",
          isExiting 
            ? "animate-slide-out-left [animation-delay:275ms]" 
            : "animate-slide-in-right [animation-delay:275ms]"
        )}>
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={isAuthenticating}
            className="text-[10px] font-bold text-white/40 hover:text-white transition-all lowercase tracking-normal opacity-80 hover:opacity-100"
          >
            forgot password?
          </button>
        </div>

        {/* EASTER EGG (Visual Only) */}
        <div className="w-full">
          {showDevTools && (
            <div className="mt-10 p-8 bg-black/30 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 animate-in fade-in slide-in-from-top-4 duration-500 shadow-3xl">
              <div className="flex items-center justify-between mb-6 px-1">
                <div className="flex items-center gap-3">
                  <Activity size={14} className="text-emerald-400 animate-pulse" />
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">SECURE CHANNEL</p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[9px] text-white/40 text-center uppercase tracking-widest font-medium leading-loose">
                  Direct bypass removed.<br />
                  Supabase Enterprise Auth Enabled.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* SECURITY FOOTER */}
        <div className={cn(
          "mt-16 flex flex-col items-center opacity-10 hover:opacity-30 group cursor-default",
          isExiting 
            ? "animate-[slide-out-left_0.4s_cubic-bezier(0.7,0,0.84,0)_both] [animation-delay:300ms]" 
            : "animate-[slide-in-right_0.8s_cubic-bezier(0.16,1,0.3,1)_both] [animation-delay:300ms]"
        )}>
          <Info size={16} className="mb-3 transition-transform group-hover:scale-110 text-white" />
          <p className="text-[9px] font-bold text-white uppercase tracking-[0.4em] text-center leading-loose">
            Editor Operations <br />
            <span className="opacity-50">Authorized Personnel Only</span>
          </p>
        </div>

      </div>
    </div>
  );
};
