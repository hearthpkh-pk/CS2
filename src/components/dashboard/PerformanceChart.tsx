import React, { useState } from 'react';
import { Lightbulb, Activity } from 'lucide-react';

interface PerformanceChartProps {
  data: { date: string; value: number }[];
  label: string;
  color: string;
  gradientId: string;
  type?: 'daily' | 'monthly';
  primaryValue?: number;
  primaryLabel?: string;
  secondaryValue?: number;
  secondaryLabel?: string;
}

const shortThaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const fullThaiMonths = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

export const PerformanceChart = ({ 
  data, label, color, gradientId, type = 'daily',
  primaryValue, primaryLabel, secondaryValue, secondaryLabel
}: PerformanceChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-300 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-100 font-noto">
        <p className="text-[10px] font-bold uppercase tracking-widest">No Data Available</p>
      </div>
    );
  }

  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

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

  return (
    <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm transition-all hover:shadow-md h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h3 className="text-base font-bold text-slate-800 font-noto tracking-wide">{label}</h3>
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
            <g key={i}>
              <rect x={p.x - 20} y={0} width="40" height={height} fill="transparent" cursor="crosshair"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              />
              <circle cx={p.x} cy={p.y} r="6" fill="#ffffff" stroke={color} strokeWidth="3" 
                className={`transition-all duration-300 pointer-events-none ${hoverIndex === i ? 'opacity-0' : 'opacity-40'}`} 
              />
              <circle cx={p.x} cy={p.y} r="6" fill="#ffffff" stroke={color} strokeWidth="3" 
                style={{ transformOrigin: `${p.x}px ${p.y}px` }}
                className={`transition-all duration-300 pointer-events-none shadow-lg shadow-black/20 ${hoverIndex === i ? 'opacity-100 scale-125' : 'opacity-0 scale-100'}`} 
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Strategic Insight Block (Hover Data) */}
      <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5 font-noto">
            {hoverIndex !== null ? 'ข้อมูลที่เลือก' : 'สถิติล่าสุด'} • {formatChartDate(hoverIndex !== null ? data[hoverIndex].date : data[data.length - 1].date)}
          </span>
          <span className="text-xl font-bold font-inter text-slate-800 tracking-tight transition-all duration-300">
            {Math.floor(hoverIndex !== null ? data[hoverIndex].value : data[data.length - 1].value).toLocaleString()}
          </span>
        </div>
        
        <div className="text-right flex flex-col items-end">
                   <span className={`text-[10px] font-bold uppercase tracking-widest block mb-0.5 ${
                     (hoverIndex !== null ? data[hoverIndex].value : data[data.length - 1].value) >= avgVal 
                       ? 'text-emerald-500' 
                       : 'text-amber-500'
                   }`}>
                     {(hoverIndex !== null ? data[hoverIndex].value : data[data.length - 1].value) >= avgVal ? 'สูงกว่าค่าเฉลี่ย' : 'ต่ำกว่าค่าเฉลี่ย'}
                   </span>
                   <span className={`text-sm font-bold font-outfit transition-all duration-300 ${
                     (hoverIndex !== null ? data[hoverIndex].value : data[data.length - 1].value) >= avgVal 
                       ? 'text-emerald-500' 
                       : 'text-amber-500'
                   }`}>
                     {(hoverIndex !== null ? data[hoverIndex].value : data[data.length - 1].value) >= avgVal ? '+' : ''}
             {Math.abs((((hoverIndex !== null ? data[hoverIndex].value : data[data.length - 1].value) / avgVal) - 1) * 100).toFixed(1)}%
           </span>
        </div>
      </div>
    </div>
  );
};
