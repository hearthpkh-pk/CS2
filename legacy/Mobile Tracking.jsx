import React, { useState } from 'react';
import { 
  Search, 
  ChevronLeft, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MoreHorizontal,
  CalendarDays,
  ShieldAlert,
  ArrowRight,
  BarChart3,
  Trophy,
  ExternalLink,
  Eye,
  Users
} from 'lucide-react';

// --- MOCK DATA (Focus on Operations, Removed Views) ---
const MOCK_STAFF = [
  { 
    id: '1', name: 'น้องเอ (Nadech)', role: 'Senior Operator', totalPages: 18, updatedToday: 18, riskCount: 0,
    history: { day1: 'completed', day2: 'completed', day3: 'completed' }, monthlyViews: '45.2M', avatar: 'A' 
  },
  { 
    id: '2', name: 'น้องบี (Yaya)', role: 'Operator', totalPages: 15, updatedToday: 15, riskCount: 1,
    history: { day1: 'completed', day2: 'risk', day3: 'risk' }, monthlyViews: '28.1M', avatar: 'B' 
  },
  { 
    id: '3', name: 'น้องซี (Mario)', role: 'Operator', totalPages: 20, updatedToday: 8, riskCount: 0,
    history: { day1: 'completed', day2: 'completed', day3: 'in-progress' }, monthlyViews: '18.5M', avatar: 'C' 
  },
  { 
    id: '4', name: 'น้องดี (Davika)', role: 'Operator', totalPages: 12, updatedToday: 0, riskCount: 0,
    history: { day1: 'completed', day2: 'pending', day3: 'pending' }, monthlyViews: '12.0M', avatar: 'D' 
  },
  { 
    id: '5', name: 'น้องอี (Baifern)', role: 'Operator', totalPages: 16, updatedToday: 16, riskCount: 0,
    history: { day1: 'completed', day2: 'completed', day3: 'completed' }, monthlyViews: '52.8M', avatar: 'E' 
  },
];

const MOCK_PAGES = [
  { id: 'p1', name: 'เพจสายฮา พารวย', followers: '120K', status: 'completed', time: '10:42 AM', health: 'good', todayViews: '45.2K', link: '#', color: 'from-blue-500 to-indigo-600' },
  { id: 'p2', name: 'รีวิวของอร่อย 2026', followers: '85K', status: 'completed', time: '09:15 AM', health: 'good', todayViews: '12.1K', link: '#', color: 'from-emerald-400 to-teal-500' },
  { id: 'p3', name: 'ข่าวเด่น วันนี้', followers: '210K', status: 'pending', time: '-', health: 'warning', todayViews: '-', link: '#', color: 'from-amber-400 to-orange-500' },
  { id: 'p4', name: 'ทาสแมว ห้ามพลาด', followers: '45K', status: 'completed', time: '11:20 AM', health: 'danger', todayViews: '2.3K', link: '#', color: 'from-rose-400 to-red-500' },
  { id: 'p5', name: 'รวมคลิปสัตว์โลกน่ารัก', followers: '300K', status: 'pending', time: '-', health: 'good', todayViews: '-', link: '#', color: 'from-purple-500 to-fuchsia-600' },
];

export default function MobileDashboard() {
  const [currentScreen, setCurrentScreen] = useState('overview'); 
  const [activeTab, setActiveTab] = useState('daily');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPageId, setSelectedPageId] = useState(null); // ควบคุมเพจที่ถูกเลือกใน Cover Flow

  const handleStaffClick = (staff) => {
    setSelectedStaff(staff);
    setCurrentScreen('staffDetail');
    setSelectedPageId(MOCK_PAGES[0].id); // เลือกเพจแรกเป็นค่าเริ่มต้น
  };

  const handleBack = () => {
    setCurrentScreen('overview');
    setTimeout(() => {
      setSelectedStaff(null);
      setSelectedPageId(null);
    }, 300);
  };

  // --- UI UTILS ---
  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-500/20';
      case 'in-progress': return 'bg-blue-500 text-white border-blue-600 shadow-blue-500/20';
      case 'risk': return 'bg-rose-500 text-white border-rose-600 shadow-rose-500/20';
      case 'pending': default: return 'bg-slate-100 text-slate-400 border-slate-200';
    }
  };

  const getStatusIcon = (status, size = 14) => {
    switch(status) {
      case 'completed': return <CheckCircle2 size={size} />;
      case 'risk': return <AlertCircle size={size} />;
      case 'in-progress': return <MoreHorizontal size={size} />;
      case 'pending': default: return <Clock size={size} />;
    }
  };

  // --- COMPONENT: 3-Day History Block ---
  const HistoryBlock = ({ day, date, status, isToday = false }) => {
    const isPending = status === 'pending';
    return (
      <div className={`flex flex-col items-center justify-center w-[42px] h-[52px] rounded-xl border ${isToday ? 'ring-2 ring-blue-100 ring-offset-1' : ''} ${getStatusColor(status)} shadow-sm transition-all`}>
        <span className={`text-[8px] font-bold uppercase tracking-wider mb-0.5 ${isPending ? 'text-slate-400' : 'text-white/80'}`}>{day}</span>
        <span className={`text-sm font-black font-outfit leading-none mb-1 ${isPending ? 'text-slate-500' : 'text-white'}`}>{date}</span>
        <div className={isPending ? 'text-slate-300' : 'text-white'}>
          {getStatusIcon(status, 10)}
        </div>
      </div>
    );
  };

  // --- TAB 1: DAILY CONTENT ---
  const renderDailyContent = () => {
    const totalAssigned = MOCK_STAFF.reduce((acc, curr) => acc + curr.totalPages, 0);
    const totalUpdated = MOCK_STAFF.reduce((acc, curr) => acc + curr.updatedToday, 0);
    const progressPercent = Math.round((totalUpdated / totalAssigned) * 100);

    return (
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pb-24">
        
        {/* Today's Master Progress */}
        <div className="px-5 mt-4">
          <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-100">
            <div className="flex justify-between items-end mb-3">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-outfit mb-1">Today's Completion</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-blue-600 font-outfit leading-none">{progressPercent}%</span>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-[13px] font-bold text-slate-700 font-outfit">{totalUpdated} <span className="text-[10px] text-slate-400">/ {totalAssigned}</span></p>
                 <p className="text-[10px] font-medium text-slate-500 font-prompt">เพจที่อัปเดตแล้ว</p>
              </div>
            </div>
            {/* Progress Bar Segmented */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
              <div className="h-full bg-blue-600 rounded-full transition-all duration-700 ease-out" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 mt-4">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="ค้นหาพนักงาน..."
              className="w-full bg-white border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-[13px] font-prompt text-[#0f172a] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Unified 3-Day Matrix */}
        <div className="px-4 py-5">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[13px] font-bold text-slate-700 font-prompt">สถานะการทำงาน 3 วันล่าสุด</h3>
          </div>

          <div className="space-y-3">
            {MOCK_STAFF.map((staff) => {
              const isCompleteToday = staff.updatedToday === staff.totalPages;
              
              return (
                <button 
                  key={staff.id}
                  onClick={() => handleStaffClick(staff)}
                  className="w-full bg-white rounded-[1.25rem] p-4 flex flex-col gap-3 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-100 active:scale-[0.98] transition-transform text-left group hover:border-blue-100"
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center font-black text-sm text-blue-700 font-outfit border border-blue-100">
                        {staff.avatar}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#0f172a] text-[14px] font-prompt leading-tight">{staff.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className="text-[10px] text-slate-400 font-prompt">{staff.role}</span>
                           {staff.riskCount > 0 && (
                             <span className="flex items-center gap-0.5 bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded text-[9px] font-bold font-outfit">
                               <ShieldAlert size={10} /> {staff.riskCount}
                             </span>
                           )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                       <p className="text-[11px] font-bold text-slate-400 font-prompt mb-0.5">วันนี้</p>
                       <p className={`text-[15px] font-black font-outfit ${isCompleteToday ? 'text-emerald-500' : 'text-blue-600'}`}>
                         {staff.updatedToday}<span className="text-[11px] text-slate-300">/{staff.totalPages}</span>
                       </p>
                    </div>
                  </div>

                  <div className="h-px w-full bg-slate-50"></div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-400 font-prompt">ประวัติย้อนหลัง</span>
                    <div className="flex gap-1.5">
                      <HistoryBlock day="พ." date="08" status={staff.history.day1} />
                      <HistoryBlock day="พฤ." date="09" status={staff.history.day2} />
                      <HistoryBlock day="ศ." date="10" status={staff.history.day3} isToday={true} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // --- TAB 2: MONTHLY CONTENT ---
  const renderMonthlyContent = () => (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 px-5 pb-24 pt-4">
      
      {/* Month Selector */}
      <div className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl p-3 mb-5 shadow-sm">
        <button className="p-1 text-slate-400 hover:text-blue-600 transition-colors"><ChevronLeft size={18} /></button>
        <span className="text-sm font-bold text-[#0f172a] font-prompt">เมษายน 2026</span>
        <button className="p-1 text-slate-400 hover:text-blue-600 transition-colors transform rotate-180"><ChevronLeft size={18} /></button>
      </div>

      {/* Monthly Hero Chart */}
      <div className="bg-gradient-to-br from-[#0f172a] to-blue-900 rounded-[2rem] p-6 mb-5 text-white shadow-lg shadow-blue-900/20 relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-blue-500/30 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <h3 className="text-[11px] font-bold text-blue-200 uppercase tracking-widest font-outfit mb-1">Monthly Target</h3>
            <p className="text-3xl font-black font-outfit tracking-tight">156.4M</p>
            <p className="text-[10px] font-medium text-blue-200/80 font-prompt mt-1">ยอดวิวสะสมเดือนนี้</p>
          </div>
          <div className="relative w-16 h-16">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/10" />
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" 
                strokeDasharray={`${(70.3/100) * 175} 175`} strokeLinecap="round" className="text-blue-400" 
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[11px] font-bold font-outfit">70%</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 flex justify-between items-center relative z-10 border border-white/10">
          <div>
            <p className="text-[10px] text-blue-200 font-prompt">เป้าหมายองค์กร</p>
            <p className="text-sm font-bold font-outfit">200.0M Views</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-blue-200 font-prompt">คาดการณ์สิ้นเดือน</p>
            <p className="text-sm font-bold font-outfit text-emerald-400">210.5M (105%)</p>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={16} className="text-amber-500" />
          <h3 className="text-xs font-bold text-slate-700 font-prompt uppercase tracking-wider">Top Performers</h3>
        </div>

        <div className="space-y-3">
          {[...MOCK_STAFF].sort((a,b) => parseFloat(b.monthlyViews) - parseFloat(a.monthlyViews)).map((staff, idx) => (
            <div key={staff.id} className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 font-black text-lg font-outfit text-center ${
                  idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-amber-700' : 'text-slate-300'
                }`}>
                  {idx + 1}
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center font-bold text-sm text-slate-600 font-outfit border border-slate-200">
                  {staff.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-[#0f172a] text-[13px] font-prompt">{staff.name}</h4>
                  <p className="text-[10px] text-slate-400 font-prompt">{staff.role}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[15px] font-black text-blue-600 font-outfit">{staff.monthlyViews}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-outfit">Views</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // --- MAIN OVERVIEW WRAPPER ---
  const renderOverview = () => {
    return (
      <div className="flex flex-col h-full w-full bg-[#F4F7F9]">
        
        {/* Header & Tabs */}
        <div className="bg-white px-5 pt-12 pb-4 rounded-b-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative z-20">
          <div className="flex justify-between items-start mb-5">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-black text-[#0f172a] font-outfit uppercase tracking-tight flex items-center gap-2">
                HQ Ops <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              </h1>
              <p className="text-[11px] font-bold text-slate-400 font-prompt">Enterprise Console</p>
            </div>
            <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-blue-100">
              <CalendarDays size={14} />
              <span className="text-[11px] font-bold font-outfit">10 APR</span>
            </div>
          </div>

          {/* Segmented Control */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('daily')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-[13px] font-bold font-prompt rounded-lg transition-all duration-200 ${
                activeTab === 'daily' 
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <CalendarDays size={14} className={activeTab === 'daily' ? 'text-blue-600' : 'text-slate-400'} />
              รายงานรายวัน
            </button>
            <button 
              onClick={() => setActiveTab('monthly')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-[13px] font-bold font-prompt rounded-lg transition-all duration-200 ${
                activeTab === 'monthly' 
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <BarChart3 size={14} className={activeTab === 'monthly' ? 'text-blue-600' : 'text-slate-400'} />
              ภาพรวมรายเดือน
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto relative z-10">
          {activeTab === 'daily' ? renderDailyContent() : renderMonthlyContent()}
        </div>
      </div>
    );
  };

  // --- SCREEN 2: STAFF DETAIL (DRILL-DOWN WITH SWIPE CAROUSEL) ---
  const renderStaffDetail = () => {
    if (!selectedStaff) return null;
    const progressPercent = Math.round((selectedStaff.updatedToday / selectedStaff.totalPages) * 100);
    const isComplete = progressPercent === 100;
    const activePage = MOCK_PAGES.find(p => p.id === selectedPageId) || MOCK_PAGES[0];
    
    return (
      <div className="flex flex-col h-full w-full bg-[#F4F7F9]">
        
        {/* Detail Header */}
        <div className="bg-white px-5 pt-12 pb-5 border-b border-slate-100 shadow-sm sticky top-0 z-20">
          <div className="flex items-center justify-between mb-5">
            <button 
              onClick={handleBack}
              className="flex items-center gap-1.5 text-slate-400 hover:text-blue-600 transition-colors bg-slate-50 py-1.5 px-3 rounded-full"
            >
              <ChevronLeft size={16} />
              <span className="text-[11px] font-bold uppercase tracking-wider font-outfit">Back</span>
            </button>
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold font-prompt border ${
              isComplete ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
              progressPercent > 0 ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}>
              {isComplete ? 'ครบถ้วน (100%)' : `กำลังดำเนินการ (${progressPercent}%)`}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center font-black text-xl text-blue-700 font-outfit border border-blue-100 shadow-sm">
                {selectedStaff.avatar}
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#0f172a] font-prompt leading-tight">{selectedStaff.name}</h1>
                <p className="text-[12px] text-slate-400 font-prompt mt-0.5">{selectedStaff.role} • {selectedStaff.totalPages} เพจ</p>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Page Slider & Dynamic Details */}
        <div className="flex-1 overflow-y-auto pb-24">
          <div className="pt-6">
            <div className="flex items-center justify-between px-5 mb-4">
              <h3 className="text-[13px] font-bold text-slate-700 font-prompt">เลือกเพจเพื่อดูรายละเอียด</h3>
            </div>

            {/* Swipeable Carousel */}
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-5 pb-6 pt-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {MOCK_PAGES.map((page) => (
                <button
                  key={page.id}
                  onClick={() => setSelectedPageId(page.id)}
                  className={`shrink-0 snap-center w-[220px] aspect-[4/3] rounded-[2rem] p-5 flex flex-col justify-between transition-all duration-300 relative overflow-hidden text-left ${
                    selectedPageId === page.id
                      ? 'ring-4 ring-blue-500/30 scale-100 shadow-xl shadow-blue-900/10'
                      : 'scale-95 opacity-60 hover:opacity-80'
                  }`}
                >
                  {/* Card Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${page.color} opacity-[0.08]`}></div>
                  
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start">
                      <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center bg-gradient-to-br ${page.color} text-white shadow-md`}>
                        <span className="font-black font-outfit text-sm">{page.id.toUpperCase()}</span>
                      </div>
                      {page.health === 'danger' && (
                        <span className="bg-rose-100 text-rose-600 p-1.5 rounded-full shadow-sm"><ShieldAlert size={12} /></span>
                      )}
                      {page.health === 'warning' && (
                        <span className="bg-amber-100 text-amber-600 p-1.5 rounded-full shadow-sm"><AlertCircle size={12} /></span>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-[#0f172a] text-[15px] font-prompt leading-tight mb-2 line-clamp-2">{page.name}</h4>
                      <div className="flex items-center gap-1.5">
                        {page.status === 'completed' ? (
                          <CheckCircle2 size={14} className="text-emerald-500" />
                        ) : (
                          <Clock size={14} className="text-slate-400" />
                        )}
                        <span className={`text-[11px] font-bold font-prompt ${page.status === 'completed' ? 'text-emerald-600' : 'text-slate-500'}`}>
                          {page.status === 'completed' ? 'อัปเดตแล้ว' : 'รอลงข้อมูล'}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Bottom Detail Panel (Updates based on selection) */}
            <div className="px-5">
              <div 
                key={activePage.id} // บังคับให้เล่นแอนิเมชันใหม่ทุกครั้งที่เปลี่ยนเพจ
                className="bg-white rounded-[2rem] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.03)] border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-300"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-lg font-bold font-prompt text-[#0f172a] leading-tight mb-1">{activePage.name}</h2>
                    <span className="text-[11px] text-slate-400 font-outfit font-medium tracking-wider">PAGE ID: {activePage.id.toUpperCase()}</span>
                  </div>
                  <a 
                    href={activePage.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-10 h-10 shrink-0 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors shadow-sm border border-blue-100"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-slate-50 rounded-[1.25rem] p-4 border border-slate-100/50">
                    <Users size={16} className="text-blue-500 mb-2" />
                    <p className="text-2xl font-black font-outfit text-[#0f172a]">{activePage.followers}</p>
                    <p className="text-[10px] text-slate-400 font-prompt mt-0.5">ผู้ติดตาม</p>
                  </div>
                  <div className="bg-slate-50 rounded-[1.25rem] p-4 border border-slate-100/50">
                    <Eye size={16} className="text-emerald-500 mb-2" />
                    <p className="text-2xl font-black font-outfit text-[#0f172a]">{activePage.todayViews}</p>
                    <p className="text-[10px] text-slate-400 font-prompt mt-0.5">ยอดวิววันนี้</p>
                  </div>
                </div>

                <div className="bg-[#F4F7F9] rounded-[1.25rem] p-4 flex items-center justify-between border border-slate-100/50">
                  <div className="flex items-center gap-3">
                    {activePage.status === 'completed' ? (
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                        <CheckCircle2 size={16} />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-300 flex items-center justify-center shadow-sm">
                        <Clock size={16} />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className={`text-[13px] font-bold font-prompt ${activePage.status === 'completed' ? 'text-emerald-700' : 'text-slate-600'}`}>
                        {activePage.status === 'completed' ? 'ส่งงานเรียบร้อย' : 'รอการอัปเดตงาน'}
                      </span>
                      {activePage.status === 'completed' ? (
                        <span className="text-[10px] text-slate-400 font-outfit font-medium">Logged at {activePage.time}</span>
                      ) : (
                        <span className="text-[10px] text-rose-500 font-prompt font-medium">กรุณาติดตามงาน</span>
                      )}
                    </div>
                  </div>
                  
                  {activePage.status === 'completed' && (
                     <button className="text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors font-prompt">
                        ดู Log
                     </button>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full max-w-[400px] mx-auto h-[800px] max-h-screen bg-slate-900 overflow-hidden font-sans shadow-2xl rounded-[3rem] border-[14px] border-slate-900">
      
      {/* App Container */}
      <div className="relative w-full h-full bg-[#F4F7F9] overflow-hidden rounded-[2rem]">
        
        {/* Navigation Slider */}
        <div 
          className="absolute inset-0 flex transition-transform duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]"
          style={{ transform: currentScreen === 'overview' ? 'translateX(0)' : 'translateX(-100%)' }}
        >
          {/* Screen 1: Unified Matrix */}
          <div className="w-full h-full flex-shrink-0">
            {renderOverview()}
          </div>

          {/* Screen 2: Drill Down */}
          <div className="w-full h-full flex-shrink-0">
            {renderStaffDetail()}
          </div>
        </div>

        {/* Safe Area Bottom Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/3 h-1.5 bg-slate-300/50 rounded-full z-50"></div>
      </div>
    </div>
  );
}