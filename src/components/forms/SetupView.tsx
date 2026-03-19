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
import { AdminBar } from '../kanban/AdminBar';
import { KanbanColumn } from '../kanban/KanbanColumn';

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

const BOXES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

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

  const boxes = BOXES;

  // Persistence Logic
  React.useEffect(() => {
    const saved = localStorage.getItem('kanban_active_boxes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setActiveBoxes(parsed);
        } else {
          setActiveBoxes(boxes); // Default to all if empty or invalid
        }
      } catch (e) {
        setActiveBoxes(boxes);
      }
    } else {
      setActiveBoxes([0, 1, 2, 3]);
    }
    setIsLoaded(true);
  }, [boxes]);

  React.useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('kanban_active_boxes', JSON.stringify(activeBoxes));
    }
  }, [activeBoxes, isLoaded]);

  // Form State
  const [pageFormData, setPageFormData] = useState({
    name: '',
    url: '',
    category: 'รายการ',
    status: 'Active' as Page['status'],
    boxId: 1,
    adminIds: [] as string[]
  });

  const [accFormData, setAccFormData] = useState<Omit<FBAccount, 'id' | 'createdAt'>>({
    name: '',
    uid: '',
    status: 'Live',
    boxId: 1,
    password: '',
    twoFactor: '',
    email: '',
    emailPassword: '',
    email2: '',
    profileUrl: '',
    cookie: ''
  });

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
    const grouped: Record<number, FBAccount[]> = {};
    boxes.forEach(boxId => {
      grouped[boxId] = accounts
        .filter(acc => acc.boxId === boxId)
        .sort((a, b) => {
          // Priority: Admin > Live > Others
          const getPriority = (status: string) => {
            if (status === 'Admin') return 0;
            if (status === 'Live') return 1;
            return 2;
          };
          const pA = getPriority(a.status);
          const pB = getPriority(b.status);
          if (pA !== pB) return pA - pB;
          return a.name.localeCompare(b.name);
        });
    });
    return grouped;
  }, [accounts, boxes]);

  const toggleBox = (boxId: number) => {
    setActiveBoxes(prev => 
      prev.includes(boxId) ? prev.filter(id => id !== boxId) : [...prev, boxId].sort((a, b) => a - b)
    );
  };

  const enforceSingleLiveAccount = (boxId: number, exceptAccountId?: string) => {
    // Only enforce for non-admin boxes (boxId !== 0)
    if (boxId === 0) return;

    const accountsInBox = accountsByBox[boxId] || [];
    accountsInBox.forEach(acc => {
      // If an account is Live and not the one being edited/added, change its status to 'Check'
      if (acc.id !== exceptAccountId && acc.status === 'Live') {
        onUpdateAccount({ ...acc, status: 'Check' });
      }
    });
  };

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accFormData.name.trim()) return;

    // Enforce Single Live per Box (except Admin Box 0 or Admin status)
    if (accFormData.status === 'Live' && accFormData.boxId !== 0) {
      enforceSingleLiveAccount(accFormData.boxId, editingAccount?.id);
    }

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
      email: '',
      emailPassword: '',
      email2: '',
      profileUrl: '',
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
      email: acc.email || '',
      emailPassword: acc.emailPassword || '',
      email2: acc.email2 || '',
      profileUrl: acc.profileUrl || '',
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
      boxId: boxId || (activeBoxes[0] || 1),
      adminIds: []
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
      boxId: page.boxId,
      adminIds: page.adminIds || []
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

      <div className="pb-12 bg-slate-50 space-y-8">
        <AdminBar 
          activeBoxes={activeBoxes}
          accountsByBox={accountsByBox}
          handleOpenAccountAdd={handleOpenAccountAdd}
          handleAccountEdit={handleAccountEdit}
          onDeleteAccount={onDeleteAccount}
        />

        <div className="grid grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 px-2">
          {boxes.filter(b => b > 0 && activeBoxes.includes(b)).map(boxId => (
            <KanbanColumn
              key={boxId}
              boxId={boxId}
              viewMode={viewMode}
              pages={pagesByBox[boxId] || []}
              accounts={accountsByBox[boxId] || []}
              handleOpenAdd={handleOpenAdd}
              handleEdit={handleEdit}
              onDelete={onDelete}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              handleDragLeave={handleDragLeave}
              handleDrop={handleDrop}
              handleOpenAccountAdd={handleOpenAccountAdd}
              handleAccountEdit={handleAccountEdit}
              onDeleteAccount={onDeleteAccount}
            />
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
        adminAccounts={accounts.filter(acc => acc.status === 'Admin')}
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
