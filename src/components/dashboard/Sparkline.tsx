'use client';

import React from 'react';

interface Props {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}

export const Sparkline = ({ data, color, width = 120, height = 40 }: Props) => {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((val - min) / range) * height,
  }));

  const path = `M ${points[0].x},${points[0].y} ` + 
    points.map(p => `L ${p.x},${p.y}`).join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-20 animate-pulse"
      />
    </svg>
  );
};
