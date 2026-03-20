'use client';

import React, { useState } from 'react';
import { Scale, FileText, ChevronRight, AlertCircle, DollarSign, Send, Heart, ShieldCheck, HelpCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PolicySection {
  id: string;
  title: string;
  icon: React.ElementType;
  content: React.ReactNode;
}

const policyData: PolicySection[] = [
  {
    id: 'general',
    title: 'กฎระเบียบทั่วไป (General Rules)',
    icon: ShieldCheck,
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 leading-relaxed font-noto">พนักงานทุกคนต้องปฏิบัติตามกฎระเบียบอย่างเคร่งครัด เพื่อรักษามาตรฐานการทำงานและวัฒนธรรมองค์กรที่ดี</p>
        <ul className="space-y-3">
          <li className="flex gap-3 text-sm font-medium text-slate-700">
             <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
             วันทำงานคือวันจันทร์ - อาทิตย์ (หากไม่มีการแจ้งล่วงหน้า)
          </li>
          <li className="flex gap-3 text-sm font-medium text-slate-700">
             <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
             การลางานต้องแจ้งล่วงหน้าอย่างน้อย 24 ชั่วโมงผ่านระบบปฏิทิน
          </li>
          <li className="flex gap-3 text-sm font-medium text-slate-700">
             <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
             ห้ามนำข้อมูลลูกค้าหรือข้อมูลเพจไปเผยแพร่ภายนอกโดยไม่ได้รับอนุญาต
          </li>
        </ul>
      </div>
    )
  },
  {
    id: 'penalties',
    title: 'กฎการหักเงิน (Penalties)',
    icon: AlertCircle,
    content: (
      <div className="space-y-4">
         <div className="bg-red-50 border border-red-100 p-4 rounded-2xl mb-4 text-red-700 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <AlertCircle size={14} /> Critical Compliance Policy
         </div>
         <p className="text-slate-600 leading-relaxed font-noto">หากยอดวิวรวม (Views) ของพนักงานในเดือนนั้น **ไม่ถึงเกณฑ์ขั้นต่ำ (10,000,000 Views)** จะมีมาตรการดังนี้:</p>
         <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h4 className="font-black text-slate-800 text-sm mb-4">ตารางการหักเงินเดือน</h4>
            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">เกณฑ์วิว</p>
                  <p className="text-sm font-black text-slate-700">น้อยกว่า 10M Views</p>
               </div>
               <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">ยอดหัก (Penalty)</p>
                  <p className="text-sm font-black text-red-600">-2,000 THB</p>
               </div>
            </div>
         </div>
         <p className="text-xs text-slate-400 italic font-noto">หมายเหตุ: การหักเงินจะหักจากฐานเงินเดือนก่อนคำนวณค่าคอมมิชชัน</p>
      </div>
    )
  },
  {
    id: 'commission',
    title: 'โครงสร้างค่าคอมมิชชัน (Commission)',
    icon: DollarSign,
    content: (
      <div className="space-y-6">
         <p className="text-slate-600 leading-relaxed font-noto">เราใช้ระบบ Multi-Tier เพื่อส่งเสริมพนักงานที่มีผลงานโดดเด่น (High Performance)</p>
         
         <div className="space-y-4">
            <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-emerald-50 to-emerald-100/30 border border-emerald-100 rounded-[2rem]">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                  <DollarSign size={24} />
               </div>
               <div>
                  <h4 className="font-black text-emerald-800 text-sm uppercase tracking-tight">Tier 1: Standard Rate</h4>
                  <p className="text-emerald-600/70 text-xs font-bold leading-tight">1,000 THB ต่อยอดวิวทุก 10,000,000 Views</p>
               </div>
            </div>

            <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-indigo-50 to-indigo-100/30 border border-indigo-100 rounded-[2rem]">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                  <ShieldCheck size={24} />
               </div>
               <div>
                  <h4 className="font-black text-indigo-800 text-sm uppercase tracking-tight">Tier 2: Super Bonus</h4>
                  <p className="text-indigo-600/70 text-xs font-bold leading-tight">1,500 THB ต่อยอดวิวทุก 10,000,000 Views (เมื่อครบ 100M)</p>
               </div>
            </div>
         </div>
      </div>
    )
  },
  {
    id: 'submissions',
    title: 'กฎระเบียบการส่งงาน (Submissions)',
    icon: Send,
    content: (
      <div className="space-y-4 font-noto">
         <p className="text-slate-600 leading-relaxed">พนักงานต้องส่งงานผ่านระบบ "ส่งคลิปงานรายวัน" ทุกวันทำงาน</p>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-5 border border-slate-100 rounded-3xl bg-slate-50">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">จำนวนขั้นต่ำ</p>
               <h5 className="text-xl font-black text-slate-800 font-outfit">10 เพจ / วัน</h5>
               <p className="text-xs text-slate-500 mt-1">ต้องส่งเพจที่ได้รับมอบหมายให้ครบ</p>
            </div>
            <div className="p-5 border border-slate-100 rounded-3xl bg-slate-50">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">จำนวนคลิป</p>
               <h5 className="text-xl font-black text-slate-800 font-outfit">4 คลิป / เพจ</h5>
               <p className="text-xs text-slate-500 mt-1">รวมทั้งสิ้น 40 คลิปต่อวัน</p>
            </div>
         </div>
         <p className="text-xs text-red-500 font-bold mt-4">⚠️ หากส่งไม่ครบถ้วนตามกำหนด ระบบจะถือว่าขาดงาน (Absent) และไม่ได้รับค่าจ้างรายวัน</p>
      </div>
    )
  },
  {
    id: 'culture',
    title: 'วัฒนธรรมองค์กร (Culture)',
    icon: Heart,
    content: (
      <div className="space-y-4 font-noto">
         <p className="text-slate-600 leading-relaxed">เราเน้นการทำงานที่รับผิดชอบตนเองเป็นหลัก (High Responsibility) และการวัดผลด้วยความสำเร็จ (Result-Oriented)</p>
         <div className="grid grid-cols-3 gap-4 py-4">
            <div className="text-center p-4 bg-white border border-slate-50 rounded-2xl">
               <div className="text-blue-500 mb-2 flex justify-center"><ShieldCheck size={20} /></div>
               <p className="text-[10px] font-black uppercase text-slate-800">Honesty</p>
            </div>
            <div className="text-center p-4 bg-white border border-slate-50 rounded-2xl">
               <div className="text-emerald-500 mb-2 flex justify-center"><Heart size={20} /></div>
               <p className="text-[10px] font-black uppercase text-slate-800">Transparency</p>
            </div>
            <div className="text-center p-4 bg-white border border-slate-50 rounded-2xl">
               <div className="text-indigo-500 mb-2 flex justify-center"><DollarSign size={20} /></div>
               <p className="text-[10px] font-black uppercase text-slate-800">Prosperity</p>
            </div>
         </div>
      </div>
    )
  }
];

export const PolicyCenterView: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState(policyData[0].id);

  const activeSection = policyData.find(s => s.id === activeSectionId) || policyData[0];

  return (
    <div className="pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-10">
        <div>
           <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
             <div className="p-3 bg-slate-900 rounded-2xl text-white shadow-xl shadow-slate-200">
                <Scale size={24} />
             </div>
             <h2 className="text-3xl font-black text-slate-800 font-outfit uppercase tracking-tight">Company Policy</h2>
           </div>
           <p className="text-slate-400 font-noto text-sm">คู่มือและกฎระเบียบมาตรฐานของบริษัทฉบับทางการ</p>
        </div>
        <div className="flex items-center justify-center md:justify-start gap-2 px-6 py-3 bg-emerald-50 border border-emerald-100 rounded-full">
           <ShieldCheck className="text-emerald-500" size={16} />
           <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">Verified Compliance 2026/03</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 mb-4">Index / สารบัญ</p>
          {policyData.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSectionId(section.id)}
              className={cn(
                "w-full text-left p-5 rounded-[2rem] transition-all duration-300 flex items-center justify-between group",
                activeSectionId === section.id 
                  ? "bg-white border border-slate-100 shadow-xl shadow-slate-100 translate-x-1" 
                  : "hover:bg-slate-50 text-slate-400 border border-transparent"
              )}
            >
              <div className="flex items-center gap-4">
                 <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    activeSectionId === section.id ? "bg-slate-900 text-white" : "bg-white border border-slate-100 text-slate-300 group-hover:text-slate-900"
                 )}>
                    <section.icon size={20} />
                 </div>
                 <span className={cn(
                   "text-sm font-black font-noto tracking-tight",
                   activeSectionId === section.id ? "text-slate-800" : "text-slate-400 group-hover:text-slate-600"
                 )}>{section.title}</span>
              </div>
              <ChevronRight size={18} className={cn(
                "transition-all",
                activeSectionId === section.id ? "text-blue-500 translate-x-0" : "text-slate-200 -translate-x-2 group-hover:translate-x-0 group-hover:text-slate-400"
              )} />
            </button>
          ))}
          
          <div className="mt-10 p-8 rounded-[2.5rem] bg-indigo-50/50 border border-indigo-100/50 text-center space-y-4">
             <HelpCircle size={32} className="mx-auto text-indigo-400" />
             <p className="text-xs font-bold text-indigo-800 font-noto">มีข้อสงสัยเกี่ยวกับกฎระเบียบ?</p>
             <button className="w-full bg-white text-indigo-600 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-indigo-600 hover:text-white transition-all">
                ติดต่อฝ่ายบุคคล
             </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8 bg-white p-10 md:p-14 rounded-[4rem] border border-slate-100 shadow-sm relative overflow-hidden min-h-[600px]">
           <div className="absolute top-0 right-0 p-10 opacity-[0.02]">
              <FileText size={400} />
           </div>
           
           <div className="relative z-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-1.5 h-10 bg-blue-600 rounded-full" />
                 <h3 className="text-3xl font-black text-slate-800 font-outfit uppercase tracking-tight">{activeSection.title}</h3>
              </div>
              
              <div className="prose prose-slate max-w-none">
                 {activeSection.content}
              </div>
              
              <div className="mt-20 pt-10 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                 <p>Last Updated: Mar 20, 2026</p>
                 <p>Property of CreatorSpace</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
