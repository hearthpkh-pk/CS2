'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configService } from '@/services/configService';
import { Announcement, CompanyConfig, GroupDefinition, Role, User, PolicyConfiguration, Brand, CompanyRule } from '@/types';
import { useAuth } from '@/context/AuthContext';

// Create a fallback config so we always have valid data shape during initial render
const FALLBACK_CONFIG: CompanyConfig = {
  id: 'core-config',
  name: "Editor Platform HQ",
  brands: [],
  rules: [],
  groups: [],
  announcements: [],
  holidays: [],
  performancePolicy: {
    minViewTarget: 5000000,
    penaltyAmount: 2000,
    bonusStep1: 1000,
    superBonusThreshold: 100000000,
    bonusStep2: 1500,
    requiredPagesPerDay: 4,
    clipsPerPageInLog: 4,
    groupPolicies: []
  }
};

export const useCompanyConfig = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const { data: config = FALLBACK_CONFIG, isLoading, refetch: refreshConfig } = useQuery({
    queryKey: ['companyConfig'],
    queryFn: async () => {
      const data = await configService.getConfig();
      return data || FALLBACK_CONFIG;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    enabled: isAuthenticated,
  });

  const setConfig = useCallback((newData: CompanyConfig) => {
    queryClient.setQueryData(['companyConfig'], newData);
  }, [queryClient]);

  // --- Group Management ---
  const saveGroup = useCallback(async (group: GroupDefinition) => {
    const updated = await configService.saveGroup(group);
    setConfig(updated);
    return updated;
  }, []);

  const deleteGroup = useCallback(async (id: string) => {
    const updated = await configService.deleteGroup(id);
    setConfig(updated);
    return updated;
  }, []);

  // --- Brand Management ---
  const saveBrand = useCallback(async (brand: Brand) => {
    const updated = await configService.saveBrand(brand);
    setConfig(updated);
    return updated;
  }, []);

  const deleteBrand = useCallback(async (id: string) => {
    const updated = await configService.deleteBrand(id);
    setConfig(updated);
    return updated;
  }, []);

  // --- Rules Management ---
  const saveRule = useCallback(async (rule: CompanyRule) => {
    const updated = await configService.saveRule(rule);
    setConfig(updated);
    return updated;
  }, []);

  const deleteRule = useCallback(async (id: string) => {
    const updated = await configService.deleteRule(id);
    setConfig(updated);
    return updated;
  }, []);

  const reorderRules = useCallback(async (ruleIds: string[]) => {
    const updated = await configService.reorderRules(ruleIds);
    setConfig(updated);
    return updated;
  }, []);


  // --- Performance Policy ---
  const updatePerformancePolicy = useCallback(async (policy: Partial<PolicyConfiguration>) => {
    const currentConfig = await configService.getConfig();
    const updatedPolicy = { ...currentConfig.performancePolicy, ...policy };
    const updatedConfig = await configService.updateConfig({ performancePolicy: updatedPolicy });
    setConfig(updatedConfig);
    return updatedConfig;
  }, []);

  // --- Group Policy Logic ---
  const getPolicyForUser = useCallback((user: User) => {
    const globalPolicy = config.performancePolicy;
    const userGroup = (config.groups || []).find(g => g.id === user.group);
    const defaultGroup = (config.groups || []).find(g => g.isDefault);
    
    const resolve = (pages: number, clips: number) => ({
      requiredPagesPerDay: pages,
      clipsPerPageInLog: clips
    });

    if (userGroup) {
      return resolve(userGroup.policy.minPagesPerDay, userGroup.policy.minClipsPerPage);
    }

    if (defaultGroup) {
      return resolve(defaultGroup.policy.minPagesPerDay, defaultGroup.policy.minClipsPerPage);
    }

    // Last resort fallback (matches global KPI Matrix setting)
    return resolve(globalPolicy.requiredPagesPerDay, globalPolicy.clipsPerPageInLog);
  }, [config.groups, config.performancePolicy]);

  // --- Announcement Targeting ---
  const getActiveAnnouncements = useCallback((user: User) => {
    const now = new Date();
    return (config.announcements || []).filter(ann => {
      if (!ann.isActive) return false;
      if (ann.startDate && now < new Date(ann.startDate)) return false;
      if (ann.endDate && now > new Date(ann.endDate)) return false;

      const hasRoleTarget = ann.targetRoles && ann.targetRoles.length > 0;
      const hasGroupTarget = ann.targetGroups && ann.targetGroups.length > 0;
      const hasTeamTarget = ann.targetTeams && ann.targetTeams.length > 0;
      const hasUserTarget = ann.targetUsers && ann.targetUsers.length > 0;

      if (!hasRoleTarget && !hasGroupTarget && !hasTeamTarget && !hasUserTarget) return true;

      if (hasRoleTarget && ann.targetRoles?.includes(user.role)) return true;
      if (hasGroupTarget && user.group && ann.targetGroups?.includes(user.group)) return true;
      if (hasTeamTarget && user.teamId && ann.targetTeams?.includes(user.teamId)) return true;
      if (hasUserTarget && ann.targetUsers?.includes(user.id)) return true;

      return false;
    });
  }, [config.announcements]);

  const saveAnnouncement = useCallback(async (ann: Announcement) => {
    const updated = await configService.saveAnnouncement(ann);
    setConfig(updated);
    return updated;
  }, []);

  const deleteAnnouncement = useCallback(async (id: string) => {
    const updated = await configService.deleteAnnouncement(id);
    setConfig(updated);
    return updated;
  }, []);

  const saveHoliday = useCallback(async (holiday: any) => {
    const updated = await configService.saveHoliday(holiday);
    setConfig(updated);
    return updated;
  }, []);

  const deleteHoliday = useCallback(async (id: string) => {
    const updated = await configService.deleteHoliday(id);
    setConfig(updated);
    return updated;
  }, []);

  return {
    config,
    isLoading,
    refreshConfig,
    saveBrand,
    deleteBrand,
    saveRule,
    deleteRule,
    reorderRules,
    saveGroup,
    deleteGroup,
    getPolicyForUser,
    getActiveAnnouncements,
    saveAnnouncement,
    deleteAnnouncement,
    saveHoliday,
    deleteHoliday,
    updatePerformancePolicy,
  };
};
