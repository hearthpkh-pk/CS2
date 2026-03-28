'use client';

import { useState, useCallback, useEffect } from 'react';
import { configService } from '@/services/configService';
import { Announcement, CompanyConfig, GroupDefinition, GroupPolicy, Role, User } from '@/types';

export const useCompanyConfig = () => {
  const [config, setConfig] = useState<CompanyConfig>(configService.getConfig());

  const refreshConfig = useCallback(() => {
    setConfig(configService.getConfig());
  }, []);

  // --- Group Management ---
  const saveGroup = useCallback((group: GroupDefinition) => {
    const updated = configService.saveGroup(group);
    setConfig(updated);
    return updated;
  }, []);

  const deleteGroup = useCallback((id: string) => {
    const updated = configService.deleteGroup(id);
    setConfig(updated);
    return updated;
  }, []);

  // --- Group Policy Logic ---
  const getPolicyForUser = useCallback((user: User) => {
    const globalPolicy = config.performancePolicy;
    const userGroup = (config.groups || []).find(g => g.id === user.group);
    
    const resolve = (pages: number, clips: number) => ({
      requiredPagesPerDay: pages,
      clipsPerPageInLog: clips
    });

    if (!userGroup) {
      return resolve(globalPolicy.requiredPagesPerDay, globalPolicy.clipsPerPageInLog);
    }

    return resolve(userGroup.policy.minPagesPerDay, userGroup.policy.minClipsPerPage);
  }, [config.groups, config.performancePolicy]);

  // --- Announcement Targeting ---
  const getActiveAnnouncements = useCallback((user: User) => {
    const now = new Date();
    return (config.announcements || []).filter(ann => {
      // 1. Basic Active Check
      if (!ann.isActive) return false;

      // 2. Schedule Check (Temporal)
      if (ann.startDate && now < new Date(ann.startDate)) return false;
      if (ann.endDate && now > new Date(ann.endDate)) return false;

      // 3. Targeting
      const hasRoleTarget = ann.targetRoles && ann.targetRoles.length > 0;
      const hasGroupTarget = ann.targetGroups && ann.targetGroups.length > 0;
      const hasTeamTarget = ann.targetTeams && ann.targetTeams.length > 0;
      const hasUserTarget = ann.targetUsers && ann.targetUsers.length > 0;

      // If no targets defined, it's public
      if (!hasRoleTarget && !hasGroupTarget && !hasTeamTarget && !hasUserTarget) return true;

      // Check specific targets
      if (hasRoleTarget && ann.targetRoles?.includes(user.role)) return true;
      if (hasGroupTarget && user.group && ann.targetGroups?.includes(user.group)) return true;
      if (hasTeamTarget && user.teamId && ann.targetTeams?.includes(user.teamId)) return true;
      if (hasUserTarget && ann.targetUsers?.includes(user.id)) return true;

      return false;
    });
  }, [config.announcements]);

  const saveAnnouncement = useCallback((ann: Announcement) => {
    const updated = configService.saveAnnouncement(ann);
    setConfig(updated);
    return updated;
  }, []);

  const deleteAnnouncement = useCallback((id: string) => {
    const updated = configService.deleteAnnouncement(id);
    setConfig(updated);
    return updated;
  }, []);

  return {
    config,
    saveGroup,
    deleteGroup,
    getPolicyForUser,
    getActiveAnnouncements,
    saveAnnouncement,
    deleteAnnouncement,
    refreshConfig
  };
};
