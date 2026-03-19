'use client';

import React, { useState, useMemo } from 'react';
import { Trash2, Plus, ExternalLink, MoreVertical, LayoutGrid, List } from 'lucide-react';
import { Page } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Props {
  pages: Page[];
  onAdd: (page: Omit<Page, 'id'>) => void;
  onUpdate: (page: Page) => void;
  onDelete: (id: string) => void;
}

export const SetupView = ({ pages, onAdd, onUpdate, onDelete }: Props) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    category: 'รายการ',
    status: 'Rest' as Page['status'],
    boxId: 1
  });

  const boxes = Array.from({ length: 20 }, (_, i) => i + 1);

  const pagesByBox = useMemo(() => {
    const map: Record<number, Page[]> = {};
    boxes.forEach(b => map[b] = []);
    pages.forEach(p => {
      if (map[p.boxId]) map[p.boxId].push(p);
    });
    return map;
  }, [pages, boxes]);

  const handleOpenAdd = (boxId?: number) => {
    setEditingPage(null);
    setFormData({
      name: '',
      url: '',
      category: 'รายการ',
      status: 'Rest',
      boxId: boxId || 1
    });
    setIsEditorOpen(true);
  };

  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setFormData({
      name: page.name,
      url: page.url || '',
      category: page.category,
      status: page.status,
      boxId: page.boxId
    });
    setIsEditorOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingPage) {
      const updatedPage = { ...editingPage, ...formData };
      handleStatusChange(updatedPage, formData.status);
    } else {
      const newPageData = { ...formData };
      onAdd(newPageData);
    }
    setIsEditorOpen(false);
  };

  const handleStatusChange = (page: Page, newStatus: Page['status']) => {
    // Business Logic: Only one Active per box
    if (newStatus === 'Active') {
      const pagesInBox = pagesByBox[page.boxId] || [];
      pagesInBox.forEach(p => {
        if (p.id !== page.id && p.status === 'Active') {
          onUpdate({ ...p, status: 'Rest' });
        }
      });
    }
    onUpdate({ ...page, status: newStatus });
  };

  const handleDragStart = (e: React.DragEvent, pageId: string) => {
    e.dataTransfer.setData('pageId', pageId);
  };

  const handleDrop = (e: React.DragEvent, targetBoxId: number) => {
    e.preventDefault();
    const pageId = e.dataTransfer.getData('pageId');
    const page = pages.find(p => p.id === pageId);
    if (page && page.boxId !== targetBoxId) {
      const updatedPage = { ...page, boxId: targetBoxId };
      handleStatusChange(updatedPage, page.status);
    }
    // Remove drag-over effect
    (e.currentTarget as HTMLElement).classList.remove('bg-blue-50', 'border-blue-400', 'border-solid');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).classList.add('bg-blue-50', 'border-blue-400', 'border-solid');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).classList.remove('bg-blue-50', 'border-blue-400', 'border-solid');
  };

  return (
    <div className="animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-slate-100 pb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#0f172a] font-outfit uppercase tracking-tight">Kanban Setup</h2>
          <p className="text-slate-400 font-noto text-sm mt-1">จัดการเพจในระบบทั้ง 20 กล่อง (จำกัด Active ได้เพียง 1 เพจต่อกล่อง)</p>
        </div>
        <button
          onClick={() => handleOpenAdd()}
          className="bg-[#0f172a] hover:bg-[#1e293b] text-white px-6 py-3 rounded-2xl font-bold font-noto flex items-center gap-2 transition-all shadow-lg shadow-slate-200"
        >
          <Plus size={20} />
          <span>เพิ่มเพจใหม่</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {boxes.map(boxId => (
          <div key={boxId} className="flex flex-col h-full min-h-[400px]">
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 bg-[#0f172a] text-white rounded-lg flex items-center justify-center text-xs font-bold font-outfit">
                  {boxId}
                </span>
                <span className="font-bold text-slate-700 text-sm font-noto">กล่องที่ {boxId}</span>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full font-inter">
                {pagesByBox[boxId].length} PAGES
              </span>
            </div>

            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, boxId)}
              className="flex-1 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 p-3 space-y-3 transition-colors"
            >
              {pagesByBox[boxId].map(page => (
                <div 
                  key={page.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, page.id)}
                  onClick={() => handleEdit(page)}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 cursor-grab active:cursor-grabbing hover:border-sidebar-bg hover:shadow-md transition-all group relative"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className={cn(
                      "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-inter",
                      page.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 
                      page.status === 'Rest' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                    )}>
                      {page.status}
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(page.id); }}
                      className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <h4 className="font-bold text-primary-navy text-sm font-noto truncate mb-1">{page.name}</h4>
                  <p className="text-[10px] text-slate-400 font-noto">{page.category}</p>
                  
                  {page.url && (
                    <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
                       <a 
                         href={page.url} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         onClick={(e) => e.stopPropagation()}
                         className="text-[9px] text-blue-500 flex items-center gap-1 hover:underline"
                       >
                         <ExternalLink size={10} /> Link
                       </a>
                    </div>
                  )}
                </div>
              ))}
              <button 
                onClick={() => handleOpenAdd(boxId)}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 text-slate-300 hover:text-slate-500 hover:border-slate-300 transition-all flex items-center justify-center gap-2 text-xs font-bold"
              >
                <Plus size={14} /> เพิ่มเพจ
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Slide-over Editor */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-prompt">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEditorOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl animate-slide-in-right">
              <div className="h-full flex flex-col">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-primary-navy">{editingPage ? 'แก้ไขข้อมูลเพจ' : 'เพิ่มเพจใหม่'}</h3>
                    <p className="text-xs text-slate-400 mt-1">ตั้งค่ารายละเอียดและสถานะของเพจ</p>
                  </div>
                  <button onClick={() => setIsEditorOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <Plus size={24} className="rotate-45" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">ชื่อเพจ</label>
                    <input 
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="ระบุชื่อเพจ..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-sidebar-bg/10 focus:border-sidebar-bg transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">ลิงก์เพจ</label>
                    <input 
                      type="url"
                      value={formData.url}
                      onChange={e => setFormData({...formData, url: e.target.value})}
                      placeholder="https://facebook.com/your-page"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-sidebar-bg/10 focus:border-sidebar-bg transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">หมวดหมู่</label>
                      <select 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-sidebar-bg/10 focus:border-sidebar-bg transition-all"
                      >
                        <option value="รายการ">รายการ</option>
                        <option value="หนัง">หนัง</option>
                        <option value="ข่าว">ข่าว</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">กล่องที่</label>
                      <select 
                        value={formData.boxId}
                        onChange={e => setFormData({...formData, boxId: parseInt(e.target.value)})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-sidebar-bg/10 focus:border-sidebar-bg transition-all"
                      >
                        {boxes.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <label className="text-xs font-bold text-slate-500 uppercase">สถานะเพจ</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['Active', 'Rest', 'Error'] as Page['status'][]).map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setFormData({...formData, status: s})}
                          className={cn(
                            "py-3 rounded-xl border text-xs font-bold transition-all",
                            formData.status === s 
                              ? cn(
                                  "shadow-md scale-[1.02]",
                                  s === 'Active' ? "bg-emerald-500 border-emerald-500 text-white" :
                                  s === 'Rest' ? "bg-blue-500 border-blue-500 text-white" :
                                  "bg-red-500 border-red-500 text-white"
                                )
                              : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </form>

                <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50">
                  <button
                    onClick={handleSubmit}
                    className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold py-4 rounded-2xl shadow-lg shadow-slate-200 transition-all active:scale-[0.98]"
                  >
                    {editingPage ? 'บันทึกการแก้ไข' : 'ยืนยันเพิ่มเพจ'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
