'use client';

import React from 'react';
import { CheckCircle } from 'lucide-react';

interface Props {
  message: string;
}

export const Toast = ({ message }: Props) => (
  <div className="fixed top-5 right-5 z-[100] px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 border border-emerald-200 bg-white text-emerald-700 animate-fade-in font-prompt">
     <CheckCircle size={20} className="text-emerald-500" />
     <span className="font-medium text-sm">{message}</span>
  </div>
);
