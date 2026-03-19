'use client';

import React from 'react';
import { CheckCircle } from 'lucide-react';

interface Props {
  message: string;
}

export const Toast = ({ message }: Props) => (
  <div className="fixed bottom-8 right-8 z-[250] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-emerald-100 bg-white text-emerald-800 animate-fade-in font-noto">
     <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shadow-sm">
        <CheckCircle size={22} className="text-emerald-500" />
     </div>
     <span className="font-bold text-sm tracking-tight">{message}</span>
  </div>
);
