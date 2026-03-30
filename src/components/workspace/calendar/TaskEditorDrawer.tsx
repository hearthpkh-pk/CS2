'use client';

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { format } from 'date-fns';
import { PersonalTask } from '@/types';
import { cn } from '@/lib/utils';

interface TaskEditorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  task: PersonalTask | null;
  onSave: (updatedTask: PersonalTask) => void;
}

export const TaskEditorDrawer: React.FC<TaskEditorDrawerProps> = ({
  isOpen,
  onClose,
  task,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [completed, setCompleted] = useState(false);

  // Sync state when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      // Ensure date strings are in 'YYYY-MM-DD' format for input[type="date"]
      setStartDate(task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '');
      setEndDate(task.endDate ? new Date(task.endDate).toISOString().split('T')[0] : '');
      setCompleted(task.completed);
    } else {
      setTitle('');
      setStartDate('');
      setEndDate('');
      setCompleted(false);
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      ...task,
      title: title.trim(),
      // Add 'T00:00:00.000Z' explicitly? Or let Date constructor handle it.
      // Usually storing full ISO string is better.
      startDate: startDate ? new Date(startDate).toISOString() : undefined,
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
      completed,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Drawer */}
      <div className="relative bg-white w-full max-w-sm h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-100">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-[#fcfcfd]/50">
          <h3 className="text-xl font-bold font-outfit uppercase tracking-tight text-slate-800">
            Edit Task
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
          
          {/* Title Field */}
          <div>
            <label className="text-xs text-slate-400 font-noto uppercase tracking-wider mb-2 block min-h-[16px]">
              ชื่องาน <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
              placeholder="ระบุชื่องาน..."
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-noto outline-none focus:ring-2 focus:ring-[var(--primary-theme)]/20 focus:border-[var(--primary-theme)] transition-all text-slate-800"
            />
          </div>

          <div className="h-px bg-slate-50 w-full" />

          {/* Dates Fields */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-slate-400 font-noto uppercase tracking-wider mb-2 block min-h-[16px]">
                วันเริ่มต้น (Start Date) <span className="text-slate-300 font-normal lowercase">(optional)</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                }}
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-outfit outline-none focus:ring-2 focus:ring-[var(--primary-theme)]/20 focus:border-[var(--primary-theme)] transition-all text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-noto uppercase tracking-wider mb-2 block min-h-[16px]">
                วันสิ้นสุด (End Date) <span className="text-slate-300 font-normal lowercase">(optional)</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                }}
                min={startDate || undefined} // End date cannot be before start date
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-outfit outline-none focus:ring-2 focus:ring-[var(--primary-theme)]/20 focus:border-[var(--primary-theme)] transition-all text-slate-800"
              />
            </div>
          </div>

          <div className="h-px bg-slate-50 w-full" />

          {/* Status Toggle */}
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100 cursor-pointer" onClick={() => setCompleted(!completed)}>
            <div>
              <p className="text-sm font-bold font-noto text-slate-800">สถานะเสร็จสิ้น</p>
              <p className="text-[11px] text-slate-400 font-noto mt-0.5">ระบุว่าคุณทำงานชิ้นนี้เสร็จแล้ว</p>
            </div>
            <button 
              className={cn(
                "w-12 h-6 rounded-full flex items-center px-1 transition-colors duration-300",
                completed ? "bg-green-500 justify-end" : "bg-slate-300 justify-start"
              )}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center">
                {completed && <Check size={10} className="text-green-500" />}
              </div>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-50 bg-[#fcfcfd]/50 flex gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-noto text-sm transition-all focus:scale-95"
          >
            ยกเลิก
          </button>
          <button 
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex-[2] py-3.5 bg-[var(--primary-theme)] hover:bg-[#1e40af] text-white rounded-2xl font-noto text-sm font-bold transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed focus:scale-95"
          >
            บันทึกการแก้ไข
          </button>
        </div>
        
      </div>
    </div>
  );
};
