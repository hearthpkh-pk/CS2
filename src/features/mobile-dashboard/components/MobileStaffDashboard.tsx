import React, { useState } from 'react';
import { User, Page, DailyLog, PolicyConfiguration } from '@/types';
import { Wallet, Calendar, Plus, User as UserIcon, LayoutDashboard, ChevronRight, Activity } from 'lucide-react';

interface MobileStaffDashboardProps {
  currentUser: User;
  pages: Page[];
  logs: DailyLog[];
  policy: PolicyConfiguration;
}

export const MobileStaffDashboard = ({ currentUser, pages, logs, policy }: MobileStaffDashboardProps) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'finance' | 'profile'>('dashboard');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-noto relative">
      {/* Header */}
      <header className="bg-white px-6 pt-12 pb-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-40">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight font-inter capitalize">{activeTab}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-50 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
          {currentUser.avatarUrl ? (
            <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-[#054ab3] uppercase">
              {currentUser.name.charAt(0)}
            </span>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 pb-40">
        
        {/* TAB 1: DASHBOARD (Pages) */}
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-lg font-bold text-slate-800">My Pages</h2>
               <span className="text-xs font-bold bg-[#054ab3] text-white px-2.5 py-1 rounded-full">{pages.length}</span>
             </div>
             
             <div className="space-y-3">
               {pages.length === 0 ? (
                 <div className="bg-white p-8 rounded-3xl border border-slate-100 border-dashed text-center">
                   <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-3">
                     <Activity size={24} />
                   </div>
                   <p className="text-sm font-bold text-slate-400">No pages assigned</p>
                 </div>
               ) : (
                 pages.map(page => (
                   <div key={page.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer">
                     <div className="flex items-center gap-3">
                       <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#054ab3]">
                         <span className="font-bold font-inter">{page.name.charAt(0)}</span>
                       </div>
                       <div>
                         <p className="text-sm font-bold text-slate-800 line-clamp-1">{page.name}</p>
                         <p className="text-xs text-slate-500 font-inter">
                           {page.facebookData?.followers ? page.facebookData.followers.toLocaleString() : '0'} Followers
                         </p>
                       </div>
                     </div>
                     <ChevronRight className="text-slate-300" size={20} />
                   </div>
                 ))
               )}
             </div>
          </div>
        )}

        {/* TAB 2: CALENDAR (Leave & Schedule) */}
        {activeTab === 'calendar' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <h2 className="text-lg font-bold text-slate-800 mb-4">Leave & Schedule</h2>
             
             <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center">
                    <Calendar size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Balance</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-800 font-inter mb-1">12</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Vacation</div>
                  </div>
                  <div className="text-center border-l border-r border-slate-100">
                    <div className="text-2xl font-bold text-slate-800 font-inter mb-1">30</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sick</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-800 font-inter mb-1">6</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Personal</div>
                  </div>
                </div>
                <button className="w-full mt-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md active:scale-95 transition-all">
                  Request Leave
                </button>
             </div>
          </div>
        )}

        {/* TAB 3: FINANCE (Payslip) */}
        {activeTab === 'finance' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <h2 className="text-lg font-bold text-slate-800 mb-4">Financial Summary</h2>
             
             <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full translate-x-10 -translate-y-10 blur-2xl opacity-50"></div>
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="w-10 h-10 bg-blue-50 text-[#054ab3] rounded-2xl flex items-center justify-center">
                    <Wallet size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Payslip</span>
                </div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 relative z-10">Estimated Net Pay</p>
                <div className="text-3xl font-bold text-slate-800 font-inter blur-md transition-all active:blur-none select-none relative z-10">
                  ฿ 0.00
                </div>
                <p className="text-[10px] text-slate-400 mt-4 flex items-center gap-1.5 relative z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  Tap and hold to reveal
                </p>
             </div>

             <h3 className="text-sm font-bold text-slate-800 mb-3 mt-6">Recent History</h3>
             <div className="space-y-3">
               {[1].map((i) => (
                 <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                       <Wallet size={16} />
                     </div>
                     <div>
                       <p className="text-sm font-bold text-slate-800">Payroll Draft</p>
                       <p className="text-xs text-slate-500">Pending Review</p>
                     </div>
                   </div>
                   <span className="text-sm font-bold text-slate-400 blur-sm">฿ 0.00</span>
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* TAB 4: PROFILE */}
        {activeTab === 'profile' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <h2 className="text-lg font-bold text-slate-800 mb-4">My Profile</h2>
             <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center">
                <div className="w-20 h-20 bg-blue-50 text-[#054ab3] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  {currentUser.name.charAt(0)}
                </div>
                <h3 className="text-xl font-bold text-slate-800">{currentUser.name}</h3>
                <p className="text-sm text-slate-500 mb-6">{currentUser.email}</p>
                <button className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold border border-slate-200">
                  Edit Profile
                </button>
             </div>
          </div>
        )}

      </main>

      {/* FAB (Floating Action Button) - SUBMIT */}
      <div className="fixed bottom-28 right-6 z-50 animate-bounce-subtle">
        <button className="w-14 h-14 bg-[#054ab3] text-white rounded-full flex items-center justify-center shadow-xl shadow-[#054ab3]/30 transition-transform active:scale-90 hover:scale-105">
          <Plus size={28} strokeWidth={2.5} />
        </button>
      </div>

      {/* Floating Bottom Navigation Bar */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] bg-white/90 backdrop-blur-xl border border-slate-200 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] rounded-[2rem] px-2 py-2 flex justify-between items-center z-50">
        
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 flex flex-col items-center justify-center py-2 transition-all duration-300 ${activeTab === 'dashboard' ? 'text-[#054ab3]' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <div className={`p-1.5 rounded-xl transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-blue-50' : 'bg-transparent'}`}>
            <LayoutDashboard size={22} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
          </div>
          <span className="text-[10px] font-bold tracking-wide mt-1">Home</span>
        </button>

        <button 
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 flex flex-col items-center justify-center py-2 transition-all duration-300 ${activeTab === 'calendar' ? 'text-[#054ab3]' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <div className={`p-1.5 rounded-xl transition-all duration-300 ${activeTab === 'calendar' ? 'bg-blue-50' : 'bg-transparent'}`}>
            <Calendar size={22} strokeWidth={activeTab === 'calendar' ? 2.5 : 2} />
          </div>
          <span className="text-[10px] font-bold tracking-wide mt-1">Calendar</span>
        </button>

        <button 
          onClick={() => setActiveTab('finance')}
          className={`flex-1 flex flex-col items-center justify-center py-2 transition-all duration-300 ${activeTab === 'finance' ? 'text-[#054ab3]' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <div className={`p-1.5 rounded-xl transition-all duration-300 ${activeTab === 'finance' ? 'bg-blue-50' : 'bg-transparent'}`}>
            <Wallet size={22} strokeWidth={activeTab === 'finance' ? 2.5 : 2} />
          </div>
          <span className="text-[10px] font-bold tracking-wide mt-1">Finance</span>
        </button>

        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex-1 flex flex-col items-center justify-center py-2 transition-all duration-300 ${activeTab === 'profile' ? 'text-[#054ab3]' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <div className={`p-1.5 rounded-xl transition-all duration-300 ${activeTab === 'profile' ? 'bg-blue-50' : 'bg-transparent'}`}>
            <UserIcon size={22} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
          </div>
          <span className="text-[10px] font-bold tracking-wide mt-1">Profile</span>
        </button>
        
      </nav>
      
    </div>
  );
};
