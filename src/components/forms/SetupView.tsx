'use client';

import React, { useState, useMemo } from 'react';
import { 
  Trash2, Plus, ExternalLink, MoreVertical, 
  LayoutGrid, List, Settings, Shield, 
  Key, Database, ChevronRight, Copy, 
  CheckCircle2, AlertCircle 
} from 'lucide-react';
import { Page, FBAccount } from '@/types';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// New Modular Components
import { KanbanHeader } from '../kanban/KanbanHeader';
import { PageCard } from '../kanban/PageCard';
import { AccountCard } from '../kanban/AccountCard';
import { PageEditorDrawer } from '../kanban/PageEditorDrawer';
import { AccountEditorDrawer } from '../kanban/AccountEditorDrawer';
import { BoxConfigModal } from '../kanban/BoxConfigModal';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Props {
  pages: Page[];
  accounts: FBAccount[];
  onAdd: (page: Omit<Page, 'id'>) => void;
  onUpdate: (page: Page) => void;
  onDelete: (id: string) => void;
  onAddAccount: (acc: Omit<FBAccount, 'id'>) => void;
  onUpdateAccount: (acc: FBAccount) => void;
  onDeleteAccount: (id: string) => void;
}

export const SetupView = ({ 
  pages, accounts, onAdd, onUpdate, onDelete,
  onAddAccount, onUpdateAccount, onDeleteAccount 
}: Props) => {
  const [viewMode, setViewMode] = useState<'pages' | 'accounts'>('pages');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isAccountEditorOpen, setIsAccountEditorOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [editingAccount, setEditingAccount] = useState<FBAccount | null>(null);
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
  const [pageFormData, setPageFormData] = useState({
    name: '',
    url: '',
    category: 'รายการ',
    status: 'Active' as Page['status'],
    boxId: 1
  });

  const [accFormData, setAccFormData] = useState({
    name: '',
    uid: '',
    status: 'Live' as FBAccount['status'],
    password: '',
    twoFactor: '',
    cookie: '',
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

  const accountsByBox = useMemo(() => {
    const map: Record<number, FBAccount[]> = {};
    boxes.forEach(b => map[b] = []);
    accounts.forEach(a => {
      if (map[a.boxId]) map[a.boxId].push(a);
    });
    return map;
  }, [accounts, boxes]);

  const toggleBox = (boxId: number) => {
    setActiveBoxes(prev => 
      prev.includes(boxId) ? prev.filter(id => id !== boxId) : [...prev, boxId].sort((a, b) => a - b)
    );
  };

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accFormData.name.trim()) return;

    if (editingAccount) {
      onUpdateAccount({ ...editingAccount, ...accFormData });
    } else {
      onAddAccount({ ...accFormData });
    }
    setIsAccountEditorOpen(false);
  };

  const handleOpenAccountAdd = (boxId?: number) => {
    setEditingAccount(null);
    setAccFormData({
      name: '',
      uid: '',
      status: 'Live',
      password: '',
      twoFactor: '',
      cookie: '',
      boxId: boxId || (activeBoxes[0] || 1)
    });
    setIsAccountEditorOpen(true);
  };

  const handleAccountEdit = (acc: FBAccount) => {
    setEditingAccount(acc);
    setAccFormData({
      name: acc.name,
      uid: acc.uid,
      status: acc.status,
      password: acc.password || '',
      twoFactor: acc.twoFactor || '',
      cookie: acc.cookie || '',
      boxId: acc.boxId
    });
    setIsAccountEditorOpen(true);
  };

  const handleOpenAdd = (boxId?: number) => {
    setEditingPage(null);
    setPageFormData({
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
    setPageFormData({
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
    if (!pageFormData.name.trim()) return;

    if (editingPage) {
      if (pageFormData.status === 'Active') {
        enforceSingleActive(pageFormData.boxId, editingPage.id);
      }
      onUpdate({ ...editingPage, ...pageFormData });
    } else {
      if (pageFormData.status === 'Active') {
        enforceSingleActive(pageFormData.boxId);
      }
      onAdd({ ...pageFormData });
    }
    setIsEditorOpen(false);
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
      <KanbanHeader 
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenConfig={() => setIsConfigOpen(true)}
        onAddPage={() => handleOpenAdd()}
        onAddAccount={() => handleOpenAccountAdd()}
      />

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
                  {viewMode === 'pages' ? pagesByBox[boxId].length : accountsByBox[boxId].length} {viewMode.toUpperCase()}
                </span>
              </div>

              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, boxId)}
                className="flex-1 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 p-3 space-y-3 transition-colors"
              >
                {viewMode === 'pages' ? (
                  <>
                    {pagesByBox[boxId].map(page => (
                      <PageCard 
                        key={page.id}
                        page={page}
                        onEdit={handleEdit}
                        onDelete={onDelete}
                        onDragStart={handleDragStart}
                      />
                    ))}
                    <button 
                      onClick={() => handleOpenAdd(boxId)}
                      className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 text-slate-300 hover:text-slate-500 hover:border-slate-300 transition-all flex items-center justify-center gap-2 text-xs font-bold"
                    >
                      <Plus size={14} /> เพิ่มเพจ
                    </button>
                  </>
                ) : (
                  <>
                    {accountsByBox[boxId].map(acc => (
                      <AccountCard 
                        key={acc.id}
                        account={acc}
                        onEdit={handleAccountEdit}
                        onDelete={onDeleteAccount}
                      />
                    ))}
                    {accountsByBox[boxId].length === 0 && (
                      <button 
                        onClick={() => handleOpenAccountAdd(boxId)}
                        className="w-full py-8 rounded-3xl border-2 border-dashed border-slate-100 text-slate-300 hover:text-[var(--primary-blue)] hover:border-blue-200 transition-all flex flex-col items-center justify-center gap-2"
                      >
                        <Shield size={20} />
                        <span className="text-[10px] font-bold font-noto uppercase tracking-tight">No Account</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <PageEditorDrawer 
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        editingPage={editingPage}
        formData={pageFormData}
        setFormData={setPageFormData}
        onSubmit={handleSubmit}
        boxes={boxes}
      />

      <AccountEditorDrawer 
        isOpen={isAccountEditorOpen}
        onClose={() => setIsAccountEditorOpen(false)}
        editingAccount={editingAccount}
        formData={accFormData}
        setFormData={setAccFormData}
        onSubmit={handleAccountSubmit}
        boxes={boxes}
      />

      <BoxConfigModal 
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        boxes={boxes}
        activeBoxes={activeBoxes}
        onToggle={toggleBox}
        onShowAll={() => setActiveBoxes(boxes)}
      />
    </div>
  );
};
