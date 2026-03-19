'use client';

import React, { useState, useMemo } from 'react';
import { Trash2, Plus, ExternalLink, MoreVertical, LayoutGrid, List, Settings } from 'lucide-react';
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
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [activeBoxes, setActiveBoxes] = useState<number[]>([]); 
  const [isLoaded, setIsLoaded] = useState(false);

  // Persistence Logic
  React.useEffect(() => {
    const saved = localStorage.getItem('active-kanban-boxes');
    if (saved) {
      try {
        setActiveBoxes(JSON.parse(saved));
      } catch (e) {
        setActiveBoxes(Array.from({ length: 20 }, (_, i) => i + 1));
      }
    } else {
      setActiveBoxes(Array.from({ length: 20 }, (_, i) => i + 1));
    }
    setIsLoaded(true);
  }, []);

  React.useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('active-kanban-boxes', JSON.stringify(activeBoxes));
    }
  }, [activeBoxes, isLoaded]);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    category: 'รายการ',
    status: 'Active' as Page['status'],
    boxId: 1
  });

  const boxes = Array.from({ length: 20 }, (_, i) => i + 1);

  const pagesByBox = useMemo(() => {
    const map: Record<number, Page[]> = {};
    boxes.forEach(b => map[b] = []);
    pages.forEach(p => {
      if (map[p.boxId]) map[p.boxId].push(p);
    });

    // Sort each group: Active first, then by name
    Object.keys(map).forEach(key => {
      map[parseInt(key)].sort((a, b) => {
        if (a.status === 'Active' && b.status !== 'Active') return -1;
        if (a.status !== 'Active' && b.status === 'Active') return 1;
        return a.name.localeCompare(b.name);
      });
    });

    return map;
  }, [pages, boxes]);

  const toggleBox = (boxId: number) => {
    setActiveBoxes(prev => 
      prev.includes(boxId) ? prev.filter(id => id !== boxId) : [...prev, boxId].sort((a, b) => a - b)
    );
  };

  const handleOpenAdd = (boxId?: number) => {
    setEditingPage(null);
    setFormData({
      name: '',
      url: '',
      category: 'รายการ',
      status: 'Active',
      boxId: boxId || (activeBoxes[0] || 1)
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

  const enforceSingleActive = (boxId: number, exceptPageId?: string) => {
    const pagesInBox = pagesByBox[boxId] || [];
    pagesInBox.forEach(p => {
      if (p.id !== exceptPageId && p.status === 'Active') {
        onUpdate({ ...p, status: 'Rest' });
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingPage) {
      if (formData.status === 'Active') {
        enforceSingleActive(formData.boxId, editingPage.id);
      }
      onUpdate({ ...editingPage, ...formData });
    } else {
      if (formData.status === 'Active') {
        enforceSingleActive(formData.boxId);
      }
      onAdd({ ...formData });
    }
    setIsEditorOpen(false);
  };

  const handleStatusChange = (page: Page, newStatus: Page['status']) => {
    if (newStatus === 'Active') {
      enforceSingleActive(page.boxId, page.id);
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
      if (page.status === 'Active') {
        enforceSingleActive(targetBoxId, page.id);
      }
      onUpdate({ ...page, boxId: targetBoxId });
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
    <div className="animate-fade-in pb-20 relative bg-slate-50 min-h-screen -m-6 p-6">
      {/* Sticky Header - Fixed with solid background and shadow for depth */}
      <div className="sticky top-0 z-40 bg-slate-50 -mx-4 md:-mx-6 px-4 md:px-6 pt-4 pb-6 mb-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[#0f172a] font-outfit uppercase tracking-tight leading-none">Kanban Setup</h2>
          <p className="text-slate-400 font-noto text-[11px] mt-1.5 italic">One Active per box • 20 Units Max</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsConfigOpen(true)}
            className="p-3 bg-white border border-slate-200 text-slate-500 hover:text-[var(--primary-blue)] hover:border-[var(--primary-blue)] rounded-2xl transition-all shadow-sm hover:shadow-md"
            title="ตั้งค่ากล่อง"
          >
            <Settings size={18} />
          </button>
          <button
            onClick={() => handleOpenAdd()}
            className="bg-[var(--primary-blue)] hover:bg-[#0b5ed7] text-white px-5 py-2.5 rounded-2xl font-bold font-noto flex items-center gap-2 transition-all shadow-lg shadow-blue-200 text-sm"
          >
            <Plus size={18} />
            <span>เพิ่มเพจใหม่</span>
          </button>
        </div>
      </div>

      {/* Responsive Board Container - 4 cols for portrait, 5 cols for landscape */}
      <div className="pb-12 bg-slate-50">
        <div className="grid grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
          {boxes.filter(b => activeBoxes.includes(b)).map(boxId => (
            <div key={boxId} className="flex flex-col h-full min-h-[300px]">
              <div className="flex items-center justify-between mb-3 px-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 bg-[var(--primary-blue)] text-white rounded-lg flex items-center justify-center text-xs font-bold font-outfit shadow-sm shadow-blue-100">
                    {boxId}
                  </span>
                  <span className="font-bold text-slate-700 text-sm font-noto">กล่องที่ {boxId}</span>
                </div>
                <span className="text-[10px] bg-blue-50 text-[var(--primary-blue)] font-bold px-2 py-0.5 rounded-full font-inter">
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
      </div>

      {/* Slide-over Editor */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-[100] overflow-hidden font-prompt">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsEditorOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl animate-slide-in-right h-screen">
              <div className="h-full flex flex-col">
                <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                  <div>
                    <h3 className="text-xl font-bold text-primary-navy font-noto uppercase tracking-tight leading-none">
                      {editingPage ? 'แก้ไขข้อมูลเพจ' : 'เพิ่มเพจใหม่'}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1 font-noto uppercase tracking-wider font-bold opacity-60">รายละเอียดและสถานะของเพจ</p>
                  </div>
                  <button onClick={() => setIsEditorOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <Plus size={24} className="rotate-45" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
                  <div className="space-y-1 relative pt-2">
                    <label className="absolute -top-1 left-3 px-1.5 bg-white text-[10px] font-bold text-[var(--primary-blue)] uppercase tracking-widest z-10 transition-colors">ชื่อเพจ</label>
                    <input 
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="ระบุชื่อเพจ..."
                      className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/5 focus:border-[var(--primary-blue)] transition-all placeholder:text-slate-300 text-sm font-noto"
                    />
                  </div>

                  <div className="space-y-1 relative pt-2">
                    <label className="absolute -top-1 left-3 px-1.5 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10">ลิงก์เพจ</label>
                    <input 
                      type="url"
                      value={formData.url}
                      onChange={e => setFormData({...formData, url: e.target.value})}
                      placeholder="https://facebook.com/your-page"
                      className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/5 focus:border-[var(--primary-blue)] transition-all placeholder:text-slate-300 text-sm font-noto"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 relative pt-2">
                      <label className="absolute -top-1 left-3 px-1.5 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10">หมวดหมู่</label>
                      <select 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/5 focus:border-[var(--primary-blue)] transition-all text-sm font-noto"
                      >
                        <option value="รายการ">รายการ</option>
                        <option value="หนัง">หนัง</option>
                        <option value="ข่าว">ข่าว</option>
                      </select>
                    </div>

                    <div className="space-y-1 relative pt-2">
                      <label className="absolute -top-1 left-3 px-1.5 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10">กล่องที่</label>
                      <select 
                        value={formData.boxId}
                        onChange={e => setFormData({...formData, boxId: parseInt(e.target.value)})}
                        className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/5 focus:border-[var(--primary-blue)] transition-all text-sm font-noto"
                      >
                        {boxes.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">สถานะเพจ</label>
                      <span className="text-[10px] text-[var(--primary-blue)] font-bold font-inter bg-blue-50 px-2 py-0.5 rounded-full">MUST BE ACTIVE TO PROCESS</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {(['Active', 'Rest', 'Error'] as Page['status'][]).map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setFormData({...formData, status: s})}
                          className={cn(
                            "py-3 rounded-2xl border text-xs font-bold transition-all relative overflow-hidden",
                            formData.status === s 
                              ? cn(
                                  "shadow-lg shadow-blue-100 scale-[1.02] border-transparent text-white",
                                  s === 'Active' ? "bg-[var(--primary-blue)]" :
                                  s === 'Rest' ? "bg-slate-500" :
                                  "bg-red-500"
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

                <div className="px-8 py-6 border-t border-slate-100 bg-white sticky bottom-0 z-10">
                  <button
                    onClick={handleSubmit}
                    className="w-full bg-[var(--primary-blue)] hover:bg-[#0b5ed7] text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-[0.98] font-noto"
                  >
                    {editingPage ? 'บันทึกการแก้ไข' : 'ยืนยันเพิ่มเพจ'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Box Configuration Modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-[110] overflow-hidden font-prompt">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsConfigOpen(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl animate-fade-in overflow-hidden">
              <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-2xl font-bold text-[#0f172a]">ตั้งค่าการแสดงผลกล่อง</h3>
                  <p className="text-sm text-slate-400 mt-1">เลือกเปิดหรือปิดกล่องที่ต้องการแสดงบนบอร์ด (สูงสุด 20 กล่อง)</p>
                </div>
                <button onClick={() => setIsConfigOpen(false)} className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-600 hover:border-slate-200 transition-all shadow-sm">
                  <Plus size={28} className="rotate-45" />
                </button>
              </div>

              <div className="p-10">
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                  {boxes.map(boxId => (
                    <button
                      key={boxId}
                      onClick={() => toggleBox(boxId)}
                      className={cn(
                        "h-20 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all group",
                        activeBoxes.includes(boxId)
                          ? "bg-[var(--primary-blue)] border-[var(--primary-blue)] text-white shadow-lg shadow-blue-200 scale-[1.02]"
                          : "bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      <span className="text-lg font-bold font-outfit">{boxId}</span>
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-widest transition-opacity",
                        activeBoxes.includes(boxId) ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                      )}>
                        ACTIVE
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-10 flex gap-4">
                  <button 
                    onClick={() => setActiveBoxes(boxes)}
                    className="flex-1 py-4 rounded-2xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-all font-noto"
                  >
                    เปิดทั้งหมด
                  </button>
                  <button 
                    onClick={() => setIsConfigOpen(false)}
                    className="flex-1 py-4 bg-[var(--primary-blue)] text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-[#0b5ed7] transition-all font-noto"
                  >
                    ตกลง
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
