'use client';

import React from 'react';

interface POCLogoProps {
  size?: number | string;
  className?: string;
}

/**
 * Official Brand Logo for POC (Page Operations Command Center)
 * Uses the iconic Facebook 'f' mark for maximum aesthetic fidelity as requested.
 */
export const POCLogo = ({ size = 64, className = "" }: POCLogoProps) => {
  return (
    <div 
      className={`relative select-none pointer-events-none transition-all duration-700 hover:brightness-110 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-[0_12px_24px_rgba(8,102,255,0.4)]">
        {/* Brand Background (Rounded Square) - Official FB Blue #0866FF */}
        <rect width="120" height="120" rx="32" fill="#0866FF" />
        
        {/* Official Facebook 'f' Glyph - Precision Path (2023-24 Version) */}
        <path 
           d="M85.5 120V73.4H101.9L104.3 54.4H85.5V42.3C85.5 36.8 87 33 94.8 33H105V16C103.3 15.8 97.4 15.3 90.5 15.3C76.1 15.3 66.2 24.1 66.2 40.3V54.4H50V73.4H66.21V120H85.5Z" 
           fill="white" 
        />
      </svg>
    </div>
  );
};
