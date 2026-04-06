'use client';

import React, { useState, useEffect } from 'react';
import { Lock, User, Activity, ChevronRight, Info, AlertCircle, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export const LoginPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);

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
    if (!email || !password || (isSignUpMode && !name)) {
      setErrorMessage(isSignUpMode ? 'กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อ, อีเมล, รหัสผ่าน)' : 'Please enter both email and password.');
      return;
    }

    setIsAuthenticating(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (isSignUpMode) {
        // โหมดสมัครสมาชิก (Request Access)
        const { error, data } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              name: name
            }
          }
        });

        if (error) {
          setErrorMessage(error.message);
        } else {
          setSuccessMessage('สมัครข้อมูลเรียบร้อย โปรดรอการยืนยันเข้าสู่ระบบผ่าน E-mail\nหากติดปัญหาหรือสอบถามเพิ่มเติมที่ Admin H');
          setIsSignUpMode(false);
          setPassword('');
          setName('');
        }
      } else {
        // โหมดเข้าสู่ระบบ (Login)
        const { error, data } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setErrorMessage('Invalid email or password, or your account has not been approved yet.');
          } else {
            setErrorMessage(error.message);
          }
        }
      }
    } catch (err) {
      setErrorMessage('Failed to connect to authentication server.');
    } finally {
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

      <div className="w-full max-w-[420px] flex flex-col items-center relative z-10 animate-in fade-in zoom-in-95 duration-1000">

        {/* BRAND IDENTITY */}
        <div className="mb-14 flex flex-col items-center group">
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

          {isSignUpMode && (
            <div className="relative group/field shadow-2xl shadow-black/10">
              <div className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400/60 group-focus-within/field:text-[#054ab3] transition-all duration-300">
                <User size={18} strokeWidth={2.5} />
              </div>
              <input
                type="text"
                placeholder="Name Project (ชื่อเรียก) ..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isAuthenticating}
                className="w-full bg-white border-0 rounded-full pl-16 pr-8 py-5 text-[14px] font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-4 focus:ring-white/20 transition-all placeholder:text-slate-300 font-noto disabled:opacity-50"
              />
            </div>
          )}

          <div className="relative group/field shadow-2xl shadow-black/10">
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

          <div className="relative group/field shadow-2xl shadow-black/10">
            <div className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400/60 group-focus-within/field:text-[#054ab3] transition-all duration-300">
              <Lock size={18} strokeWidth={2.5} />
            </div>
            <input
              type="password"
              placeholder="Password ..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isAuthenticating}
              className="w-full bg-white border-0 rounded-full pl-16 pr-8 py-5 text-[14px] font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-4 focus:ring-white/20 transition-all placeholder:text-slate-300 font-inter disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full py-5 bg-white text-[#054ab3] rounded-full font-black text-xs tracking-[0.2em] shadow-2xl shadow-black/10 hover:bg-white/95 hover:shadow-white/10 transition-all active:scale-[0.98] mt-10 uppercase disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {isAuthenticating ? (
              <>
                <Activity size={16} className="animate-spin" />
                PROCESSING...
              </>
            ) : (isSignUpMode ? 'สมัครสมาชิก' : 'SIGN IN')}
          </button>
        </form>

        {/* METADATA INTERACTION */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            onClick={() => { setIsSignUpMode(!isSignUpMode); setErrorMessage(''); setSuccessMessage(''); }}
            className="text-[11px] font-bold text-white hover:text-emerald-300 transition-all uppercase tracking-widest opacity-90"
          >
            {isSignUpMode ? 'กลับสู่หน้าเข้าสู่ระบบ' : 'ยังไม่มีบัญชี? สมัครบัญชี'}
          </button>

          {!isSignUpMode && (
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={isAuthenticating}
              className="text-[10px] font-bold text-white/40 hover:text-white transition-all lowercase tracking-normal opacity-80 hover:opacity-100"
            >
              forgot password?
            </button>
          )}
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
        <div className="mt-16 flex flex-col items-center opacity-10 hover:opacity-30 transition-opacity duration-700 group cursor-default">
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
