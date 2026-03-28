'use client';

import React, { useState, useEffect } from 'react';
import { Lock, User, Terminal, ChevronRight, Activity, ArrowRight, Info } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/types';
import { cn } from '@/lib/utils';

export const LoginPage = () => {
   const { login } = useAuth();
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [logoClicks, setLogoClicks] = useState(0);
   const [pinInput, setPinInput] = useState('');
   const [showPinPrompt, setShowPinPrompt] = useState(false);
   const [showDevTools, setShowDevTools] = useState(false);

   const SECRET_PIN = '777';

   useEffect(() => {
      if (logoClicks >= 5) {
         setShowPinPrompt(true);
         const timer = setTimeout(() => {
            if (!showDevTools) {
               setLogoClicks(0);
               setShowPinPrompt(false);
               setPinInput('');
            }
         }, 15000);
         return () => clearTimeout(timer);
      }
   }, [logoClicks, showDevTools]);

   useEffect(() => {
      if (pinInput === SECRET_PIN) {
         setShowDevTools(true);
         setShowPinPrompt(false);
      }
   }, [pinInput]);

   const handleDirectLogin = (role: Role) => {
      login(role);
   };

   return (
      <div className="min-h-screen w-full bg-[#0866FF] flex items-center justify-center p-8 font-noto antialiased overflow-hidden text-white">
         {/* Subtle Depth Layers (Mirroring the Truvio focus) */}
         <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-white/5 rounded-full blur-[140px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-400/10 rounded-full blur-[120px]" />
         </div>

         <div className="w-full max-w-[420px] flex flex-col items-center relative z-10 animate-in fade-in zoom-in-95 duration-1000">

            {/* BRAND IDENTITY: EDITOR (TRUVIO STYLE) */}
            <div className="mb-16 flex flex-col items-center group">
               <button
                  onClick={() => setLogoClicks(prev => prev + 1)}
                  className="mb-2 select-none active:scale-95 transition-transform duration-300"
               >
                  <h1 className="text-6xl font-bold font-outfit tracking-tighter lowercase text-white">Editor</h1>
               </button>
               <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.6em] mt-1 opacity-60">Command Matrix</p>
            </div>

            {/* ACCESS INTERFACE (Pill-shaped, White on Blue) */}
            <form className="w-full space-y-4" onSubmit={(e) => { e.preventDefault(); handleDirectLogin(Role.SuperAdmin); }}>

               <div className="relative group/field shadow-2xl shadow-black/10">
                  <div className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400/60 group-focus-within/field:text-[#0866FF] transition-all duration-300">
                     <User size={18} strokeWidth={2.5} />
                  </div>
                  <input
                     type="email"
                     placeholder="Enter your username ..."
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="w-full bg-white border-0 rounded-full pl-16 pr-8 py-5 text-[14px] font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-4 focus:ring-white/20 transition-all placeholder:text-slate-300 font-inter"
                  />
               </div>

               <div className="relative group/field shadow-2xl shadow-black/10">
                  <div className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400/60 group-focus-within/field:text-[#0866FF] transition-all duration-300">
                     <Lock size={18} strokeWidth={2.5} />
                  </div>
                  <input
                     type="password"
                     placeholder="Enter your password ..."
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="w-full bg-white border-0 rounded-full pl-16 pr-8 py-5 text-[14px] font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-4 focus:ring-white/20 transition-all placeholder:text-slate-300 font-inter"
                  />
               </div>

               <button
                  type="submit"
                  className="w-full py-5 bg-white text-[#0866FF] rounded-full font-black text-xs tracking-[0.2em] shadow-2xl shadow-black/10 hover:bg-white/95 hover:shadow-white/10 transition-all hover:-translate-y-0.5 active:scale-[0.98] mt-10 uppercase"
               >
                  SIGN IN
               </button>
            </form>

            {/* METADATA INTERACTION */}
            <div className="mt-10 text-center">
               <button className="text-[11px] font-bold text-white/40 hover:text-white transition-all lowercase tracking-normal opacity-80 hover:opacity-100">
                  forget your password?
               </button>
            </div>

            {/* HIDDEN OPERATOR CONSOLE (REDUCED FOR DEV ONLY) */}
            <div className="w-full">
               {showPinPrompt && !showDevTools && (
                  <div className="mt-10 p-8 bg-black/20 backdrop-blur-xl rounded-[2.5rem] border border-white/10 animate-in fade-in slide-in-from-top-4 duration-500 shadow-3xl">
                     <div className="flex items-center gap-3 mb-6 px-1">
                        <div className="w-2 h-2 rounded-full bg-blue-300 animate-pulse" />
                        <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.3em]">Identity Verification Required</p>
                     </div>
                     <input
                        type="password"
                        autoFocus
                        placeholder="******"
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-full px-6 py-4 text-white text-center text-[15px] font-black focus:outline-none focus:border-blue-300/40 transition-all font-inter placeholder:text-white/5"
                     />
                  </div>
               )}

               {showDevTools && (
                  <div className="mt-10 p-8 bg-black/30 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 animate-in fade-in slide-in-from-top-4 duration-500 shadow-3xl">
                     <div className="flex items-center justify-between mb-6 px-1">
                        <div className="flex items-center gap-3">
                           <Activity size={14} className="text-blue-300 animate-pulse" />
                           <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Developer Portal</p>
                        </div>
                        <button onClick={() => { setShowDevTools(false); setLogoClicks(0); setPinInput(''); }} className="text-white/20 hover:text-white transition-colors">
                           <ChevronRight size={16} className="rotate-90" />
                        </button>
                     </div>
                     <div className="space-y-3">
                        <button onClick={() => handleDirectLogin(Role.Developer)} className="w-full p-4 rounded-full bg-blue-500 text-white shadow-xl shadow-blue-500/20 transition-all text-center group active:scale-95">
                           <span className="text-[11px] font-bold tracking-widest uppercase">Enter Developer POV</span>
                        </button>
                        <p className="text-[9px] text-white/20 text-center uppercase tracking-widest font-medium">Bypass authentication for testing only</p>
                     </div>
                  </div>
               )}
            </div>

            {/* SECURITY FOOTER */}
            <div className="mt-24 flex flex-col items-center opacity-10 hover:opacity-30 transition-opacity duration-700 group cursor-default">
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
