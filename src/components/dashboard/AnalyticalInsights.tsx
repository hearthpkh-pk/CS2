'use client';

import React from 'react';
import { TrendingUp, AlertCircle, Zap, Target } from 'lucide-react';

interface Insight {
  type: 'positive' | 'warning' | 'neutral';
  title: string;
  description: string;
  icon: any;
}

interface Props {
  views: number;
  prevViews: number;
  followers: number;
  isDemoMode: boolean;
}

export const AnalyticalInsights = ({ views, prevViews, followers, isDemoMode }: Props) => {
  const viewGrowth = ((views - prevViews) / Math.max(prevViews, 1)) * 100;
  
  const progress = 28; // Weekly/Daily progress example
  const totalGoal = 40;
  
  const insights: Insight[] = [
    {
      type: 'neutral',
      title: 'Daily Clips Goal',
      description: `${progress}/${totalGoal} clips posted today across all pages. You are on track!`,
      icon: Zap
    },
    {
      type: viewGrowth > 0 ? 'positive' : 'warning',
      title: viewGrowth > 0 ? 'Performance Trending Up' : 'Watch Your Reach',
      description: viewGrowth > 0 
        ? `ยอดการรับชมเพิ่มขึ้น ${viewGrowth.toFixed(1)}% จากรอบที่แล้ว สัญญาณบวกสำหรับการขยายฐานแฟนคลับ`
        : `ยอดวิวลดลงเล็กน้อย แนะนำให้ตรวจสอบความสม่ำเสมอในการลงคลิป 40 ลิงก์ต่อวัน`,
      icon: viewGrowth > 0 ? TrendingUp : AlertCircle
    },
    {
      type: 'neutral',
      title: 'Audience Loyalty',
      description: `ปัจจุบันมีผู้ติดตามสะสม ${followers.toLocaleString()} คน อัตราการเปลี่ยนใจเป็นผู้ติดตามส่วนใหญ่อยู่ในกลุ่มแฟนตัวยง`,
      icon: Target
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
      {insights.map((insight, i) => (
        <div 
          key={i} 
          className={`p-6 rounded-[2rem] border transition-all duration-300 group hover:scale-[1.02] ${
            insight.type === 'positive' ? 'bg-blue-50/50 border-blue-100' : 
            insight.type === 'warning' ? 'bg-amber-50/50 border-amber-100' : 
            'bg-slate-50 border-slate-100'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl ${
              insight.type === 'positive' ? 'bg-white text-blue-600 shadow-sm shadow-blue-100' : 
              insight.type === 'warning' ? 'bg-white text-amber-600 shadow-sm shadow-amber-100' : 
              'bg-white text-slate-400 shadow-sm'
            }`}>
              <insight.icon size={20} />
            </div>
            <div>
              <h4 className={`text-sm font-black uppercase tracking-widest font-outfit ${
                insight.type === 'positive' ? 'text-blue-700' : 
                insight.type === 'warning' ? 'text-amber-700' : 
                'text-slate-600'
              }`}>
                {insight.title}
                {isDemoMode && <span className="ml-2 text-[8px] opacity-40">(Mockup)</span>}
              </h4>
              <p className="text-[11px] text-slate-500 font-noto mt-1.5 leading-relaxed">
                {insight.description}
              </p>
              
              {insight.title === 'Daily Clips Goal' && (
                <div className="mt-4 flex gap-1 items-center">
                  {Array.from({ length: 10 }).map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${
                        idx < (progress / totalGoal) * 10 ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]' : 'bg-slate-200'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-[10px] font-black text-blue-600 font-inter">
                    {Math.round((progress/totalGoal) * 100)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
