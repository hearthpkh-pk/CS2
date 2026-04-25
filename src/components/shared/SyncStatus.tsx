'use client';

import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { logCacheService } from '@/services/logCacheService';
import { cn } from '@/lib/utils';

export const SyncStatus = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkStatus = async () => {
      const items = await logCacheService.getPendingSyncItems();
      setPendingCount(items.length);
      setIsSyncing(items.some(i => i.status === 'syncing'));
    };

    checkStatus();
    
    // Check every 2 seconds for visual feedback
    const interval = setInterval(checkStatus, 2000);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (pendingCount === 0 && isOnline) {
    return null; // ซ่อน UI ไปเลยเมื่อทุกอย่างซิงค์เรียบร้อยและออนไลน์อยู่
  }

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-500",
      !isOnline ? "bg-rose-50 text-rose-600 border-rose-100" : 
      isSyncing ? "bg-blue-50 text-blue-600 border-blue-100 shadow-sm" : 
      "bg-amber-50 text-amber-600 border-amber-100"
    )}>
      {!isOnline ? (
        <CloudOff size={12} className="animate-pulse" />
      ) : isSyncing ? (
        <RefreshCw size={12} className="animate-spin" />
      ) : (
        <Cloud size={12} className="animate-bounce" />
      )}
      <span className="text-[9px] font-bold uppercase tracking-wider">
        {!isOnline ? 'Offline Mode' : isSyncing ? 'Syncing...' : `${pendingCount} Pending Sync`}
      </span>
      {pendingCount > 0 && !isSyncing && (
        <AlertCircle size={10} className="text-amber-400" />
      )}
    </div>
  );
};
