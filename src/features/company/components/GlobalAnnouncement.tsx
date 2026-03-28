'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { AnnouncementMarquee } from './AnnouncementMarquee';

export const GlobalAnnouncement: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) return null;

  return <AnnouncementMarquee currentUser={user} />;
};
