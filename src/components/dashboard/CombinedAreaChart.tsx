'use client';

import React from 'react';
import { DailyLog } from '@/types';

interface Props {
  data: { date: string; followers: number; views: number }[];
}

const shortThaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

export const CombinedAreaChart = ({ data }: Props) => {
  if (!data || data.length === 0) return <div className="h-72 flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-slate-100 font-noto">ไม่มีข้อมูลในช่วงเวลานี้</div>;

  const width = 900;
  const height = 300;
  const padding = 50;

  const maxFollowers = Math.max(...data.map(d => d.followers), 1);
  const maxViews = Math.max(...data.map(d => d.views), 1);
  const overallMax = Math.max(maxFollowers, maxViews);
  const buffer = overallMax * 0.1;
  const bufferedMax = overallMax + buffer;

  const getPoints = (dataKey: 'followers' | 'views') => data.map((d, i) => {
    const x = padding + (i / Math.max(data.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - (d[dataKey] / bufferedMax) * (height - padding * 2);
    return { x, y, value: d[dataKey], date: d.date };
  });

  const followersPoints = getPoints('followers');
  const viewsPoints = getPoints('views');

  const createPath = (points: {x: number, y: number}[]) => `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
  const createArea = (points: {x: number, y: number}[], path: string) => `M ${points[0].x},${height - padding} L ${path.substring(2)} L ${points[points.length-1].x},${height - padding} Z`;

  const fPath = createPath(followersPoints);
  const vPath = createPath(viewsPoints);
  const fArea = createArea(followersPoints, fPath);

  const formatChartDate = (dateString: string) => {
    if(!dateString) return '';
    const d = new Date(dateString);
    return `${d.getDate()} ${shortThaiMonths[d.getMonth()]}`;
  };

  return (
    <div className="w-full overflow-x-auto overflow-y-visible">
      <div className="min-w-[750px] h-72 relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="grad-followers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#facc15" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#facc15" stopOpacity="0.0" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
              <feOffset dx="0" dy="2" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.1" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
            const y = padding + ratio * (height - padding*2);
            const val = Math.round(bufferedMax - (ratio * bufferedMax));
            return (
              <g key={ratio}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#f8fafc" strokeWidth="1" />
                <text x={padding - 15} y={y + 4} textAnchor="end" fill="#cbd5e1" fontSize="10" className="font-inter font-bold">{val > 0 ? (val/1000).toFixed(1)+'k' : '0'}</text>
              </g>
            );
          })}

          {/* Views Line (Slate) */}
          <path d={vPath} fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 6" />
          
          {/* Followers Line & Area (Yellow) */}
          <path d={fArea} fill="url(#grad-followers)" />
          <path d={fPath} fill="none" stroke="#facc15" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter="url(#shadow)" />
          
          {/* Points & Tooltip Overlay */}
          {followersPoints.map((p, i) => (
            <g key={`f-${i}`} className="group cursor-pointer">
              <rect x={p.x - 20} y={padding} width="40" height={height - padding*2} fill="transparent" />
              <circle cx={p.x} cy={p.y} r="5.5" fill="#ffffff" stroke="#facc15" strokeWidth="3" className="opacity-0 group-hover:opacity-100 transition-opacity" />
              <circle cx={viewsPoints[i].x} cy={viewsPoints[i].y} r="4.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" className="opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                 <rect x={p.x - 75} y={Math.min(p.y, viewsPoints[i].y) - 95} width="150" height="80" rx="12" fill="#0a192f" />
                 <text x={p.x} y={Math.min(p.y, viewsPoints[i].y) - 75} textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold" className="font-outfit uppercase tracking-widest">{formatChartDate(p.date)}</text>
                 <text x={p.x - 55} y={Math.min(p.y, viewsPoints[i].y) - 52} fill="#facc15" fontSize="11" fontWeight="bold" className="font-noto">● ติดตามคืบหน้า:</text>
                 <text x={p.x + 65} y={Math.min(p.y, viewsPoints[i].y) - 52} textAnchor="end" fill="#ffffff" fontSize="12" fontWeight="bold" className="font-inter">{p.value.toLocaleString()}</text>
                 <text x={p.x - 55} y={Math.min(p.y, viewsPoints[i].y) - 32} fill="#cbd5e1" fontSize="11" fontWeight="bold" className="font-noto">● ยอดการรับชม:</text>
                 <text x={p.x + 65} y={Math.min(p.y, viewsPoints[i].y) - 32} textAnchor="end" fill="#ffffff" fontSize="12" fontWeight="bold" className="font-inter">{viewsPoints[i].value.toLocaleString()}</text>
              </g>
            </g>
          ))}
        </svg>
        <div className="flex justify-between px-12 text-[10px] text-slate-300 mt-4 font-bold font-inter uppercase tracking-widest">
           <span>{formatChartDate(data[0]?.date)}</span>
           <span>{formatChartDate(data[Math.floor(data.length/2)]?.date)}</span>
           <span>{formatChartDate(data[data.length-1]?.date)}</span>
        </div>
      </div>
    </div>
  );
};
