'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export const PendingApprovalPage = () => {
  const { user, logout } = useAuth();
  const [isExiting, setIsExiting] = useState(false);

  const handleLogout = async () => {
    setIsExiting(true);
    await new Promise(resolve => setTimeout(resolve, 400));
    logout();
  };

  return (
    <div className="min-h-screen w-full bg-[#054ab3] flex items-center justify-center p-8 font-noto antialiased overflow-hidden text-white relative">
      
      <style>{`
        @keyframes smooth-flow {
          0% { transform: translateX(-100%); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateX(200%); opacity: 0; }
        }
        .animate-flowing-line {
          animation: smooth-flow 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

      {/* Subtle Depth Layers (Exactly as LoginPage) */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-white/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-400/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[420px] flex flex-col items-center relative z-10 animate-[slide-in-right_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">

        <style>{`
           @keyframes slide-in-right {
             0% { transform: translateX(150%); opacity: 0; }
             100% { transform: translateX(0); opacity: 1; }
           }
        `}</style>

        {/* BRAND IDENTITY */}
        <div className={cn(
          "mb-14 flex flex-col items-center group transition-all duration-300 transform",
          isExiting ? "-translate-x-[150vw] opacity-0" : "translate-x-0 opacity-100"
        )}>
          <h1 className="text-6xl font-bold font-outfit tracking-tighter lowercase text-white">Editor</h1>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.6em] mt-1 opacity-60">HQ Terminal</p>
        </div>

        {/* REPLACEMENT FOR LOGIN FORM */}
        <div className="w-full flex flex-col items-center space-y-12">
          
          <div className={cn(
            "flex flex-col items-center text-center transition-all duration-300 transform delay-[50ms]",
            isExiting ? "-translate-x-[150vw] opacity-0" : "translate-x-0 opacity-100"
          )}>
            <h2 className="text-sm md:text-base font-outfit tracking-[0.3em] text-white/90 font-light uppercase">
              Authorization Pending
            </h2>
            <p className="text-xs text-white/40 mt-3 tracking-wide font-noto font-light leading-relaxed max-w-[280px]">
              สิทธิ์เข้าใช้งานของคุณกำลังรอการอนุมัติ<br/>ระบบจะปลดล็อคเมื่อผู้ดูแลระบบยืนยันตัวตนแล้ว
            </p>
          </div>

          {/* Continuous Flowing Line (replacing the progress bar/box) */}
          <div className={cn(
            "relative w-48 mx-auto h-[1px] bg-white/5 overflow-hidden transition-all duration-300 transform delay-[100ms]",
            isExiting ? "-translate-x-[150vw] opacity-0" : "translate-x-0 opacity-100"
          )}>
            <div className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-flowing-line" />
          </div>

        {/* Account Detail & Action */}
          <div className="flex flex-col items-center space-y-6">
            <div className={cn(
              "flex items-center gap-3 text-white/30 text-[10px] tracking-widest font-outfit uppercase transition-all duration-300 transform delay-[150ms]",
              isExiting ? "-translate-x-[150vw] opacity-0" : "translate-x-0 opacity-100"
            )}>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              {user?.email || 'Validating Account'}
            </div>

            <div className={cn(
              "transition-all duration-300 transform delay-[200ms]",
              isExiting ? "-translate-x-[150vw] opacity-0" : "translate-x-0 opacity-100"
            )}>
              <button 
                onClick={handleLogout}
                className="text-[9px] font-bold text-white/20 hover:text-white/60 transition-colors uppercase tracking-[0.2em]"
              >
                Cancel / Sign out
              </button>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className={cn(
          "mt-auto pt-16 text-center opacity-40 transition-all duration-700 transform delay-[300ms]",
          isExiting ? "-translate-x-[150vw] opacity-0" : "translate-x-0"
        )}>
          <div className="w-4 h-4 rounded-full border border-white/50 flex items-center justify-center mx-auto mb-3">
            <span className="text-[8px] font-bold">i</span>
          </div>
          <p className="text-[8px] font-medium tracking-[0.2em] font-noto uppercase">
            EDITOR OPERATIONS
            <br />
            AUTHORIZED PERSONNEL ONLY
          </p>
        </div>

      </div>
    </div>
  );
};
