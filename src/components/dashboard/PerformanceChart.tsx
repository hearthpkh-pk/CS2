'use client';

import React from 'react';

interface PerformanceChartProps {
  data: { date: string; value: number }[];
  label: string;
  color: string;
  gradientId: string;
  unit?: string;
  type?: 'daily' | 'monthly';
  displayValue?: number; // Added displayValue prop
  growth?: number; // Added to preserve analytical depth after card deletion
}

const shortThaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const fullThaiMonths = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

export const PerformanceChart = ({ data, label, color, gradientId, unit = '', type = 'daily', displayValue, growth }: PerformanceChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-300 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-100 font-noto">
        <p className="text-[10px] font-bold uppercase tracking-widest">No Data Available</p>
      </div>
    );
  }

  const width = 800;
  const height = 240;
  const padding = 40;

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const buffer = maxVal * 0.15;
  const bufferedMax = maxVal + buffer;

  // Catmull-Rom to SVG path helper
  const getCurvePath = (points: { x: number, y: number }[]) => {
    if (points.length < 2) return '';
    let path = `M ${points[0].x},${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 === points.length ? i + 1 : i + 2];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return path;
  };

  const points = data.map((d, i) => ({
    x: padding + (i / Math.max(data.length - 1, 1)) * (width - padding * 2),
    y: height - padding - (d.value / bufferedMax) * (height - padding * 2),
    value: d.value,
    date: d.date
  }));

  const mainPath = getCurvePath(points);
  const areaPath = `${mainPath} L ${points[points.length - 1].x},${height - padding} L ${points[0].x},${height - padding} Z`;

  const formatChartDate = (dateString: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (type === 'monthly') return fullThaiMonths[d.getMonth()];
    return `${d.getDate()} ${shortThaiMonths[d.getMonth()]}`;
  };

  const avgVal = data.reduce((acc, d) => acc + d.value, 0) / data.length;
  const latestValue = displayValue !== undefined ? displayValue : data[data.length - 1].value;

  return (
    <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm transition-all hover:shadow-md h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 md:mb-8">
        <div>
          <h3 className="text-base font-medium text-slate-800 font-outfit uppercase tracking-wide">{label}</h3>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Statistical performance over time</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-baseline gap-2">
            <div className="text-xl md:text-2xl font-semibold text-slate-800 font-inter">
              {latestValue.toLocaleString()}{unit && <span className="text-xs text-slate-400 font-normal ml-1">{unit}</span>}
            </div>
            {growth !== undefined && !isNaN(growth) && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${growth >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {growth > 0 ? '+' : ''}{growth}%
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="w-full h-48 overflow-visible">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.15" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines (Subtle) */}
          {[1, 0.5, 0].map(ratio => {
            const y = padding + ratio * (height - padding * 2);
            return (
              <line key={ratio} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#f1f5f9" strokeWidth="1" />
            );
          })}

          {/* Area & Line */}
          <path d={areaPath} fill={`url(#${gradientId})`} className="animate-in fade-in duration-1000" />
          <path d={mainPath} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="animate-in slide-in-from-left-2 duration-700" />

          {/* Interactive Points */}
          {points.map((p, i) => (
            <g key={i} className="group/dot cursor-crosshair">
              <rect x={p.x - 20} y={0} width="40" height={height} fill="transparent" />
              <circle cx={p.x} cy={p.y} r="6" fill="#ffffff" stroke={color} strokeWidth="3" className="opacity-40 group-hover/dot:opacity-0 transition-opacity" />
              <circle cx={p.x} cy={p.y} r="6" fill="#ffffff" stroke={color} strokeWidth="3" className="opacity-0 group-hover/dot:opacity-100 transition-opacity duration-200 shadow-lg shadow-black/20" />
              
              <g className="opacity-0 group-hover/dot:opacity-100 transition-all duration-300 pointer-events-none translate-y-2 group-hover/dot:translate-y-0">
                 {/* Super-Sized Tooltip for Mobile/Vertical Clarity */}
                 <rect 
                    x={p.x - 120} 
                    y={p.y - 170} 
                    width="240" 
                    height="140" 
                    rx="32" 
                    fill="#0a192f" 
                    className="shadow-2xl shadow-black/50"
                 />
                 
                 {/* Date/Month */}
                 <text x={p.x} y={p.y - 135} textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="bold" className="font-noto uppercase tracking-[0.25em]">{formatChartDate(p.date)}</text>
                 
                 {/* Main Value */}
                 <text x={p.x} y={p.y - 95} textAnchor="middle" fill="#ffffff" fontSize="32" fontWeight="black" className="font-inter tracking-tighter">{Math.floor(p.value).toLocaleString()}</text>
                 
                 {/* Average comparison line */}
                 <rect x={p.x - 90} y={p.y - 78} width="180" height="1" fill="#1e293b" />
                 
                 {/* Comparison Logic */}
                 <text x={p.x} y={p.y - 42} textAnchor="middle" fill={p.value >= avgVal ? "#10b981" : "#f59e0b"} fontSize="11" fontWeight="bold" className="font-outfit uppercase tracking-[0.15em]">
                    {p.value >= avgVal ? `+${((p.value/avgVal - 1)*100).toFixed(0)}% สูงกว่าค่าเฉลี่ย` : `${((1 - p.value/avgVal)*100).toFixed(0)}% ต่ำกว่าค่าเฉลี่ย`}
                 </text>
              </g>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};
