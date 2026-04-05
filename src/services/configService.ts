import { Brand, CompanyConfig, CompanyRule, Announcement, GroupDefinition, Role } from '../types';
import { supabase } from '@/lib/supabaseClient';

const DEFAULT_CONFIG_ID = 'core-config';

const DEFAULT_BRANDS: Brand[] = [
  { id: "brand-1774793169256", name: "USE99", isActive: true },
  { id: "brand-1774793206352", name: "IF888", isActive: true },
  { id: "brand-1774793218627", name: "UFA257", isActive: true },
  { id: "brand-1774793221874", name: "ZEED777", isActive: true }
];

const DEFAULT_RULES: CompanyRule[] = []; // Migrated into DB, simplified default.
const DEFAULT_HOLIDAYS: any[] = [];

const DEFAULT_CONFIG: CompanyConfig = {
  id: DEFAULT_CONFIG_ID,
  name: "Editor Platform HQ",
  brands: DEFAULT_BRANDS,
  rules: DEFAULT_RULES,
  groups: [
    { id: "news", name: "กลุ่มข่าวสาร", policy: { groupId: "news", minPagesPerDay: 5, minClipsPerPage: 8 }, isDefault: false },
    { id: "shows", name: "กลุ่มรายการ", policy: { groupId: "shows", minPagesPerDay: 10, minClipsPerPage: 4 }, isDefault: true }
  ],
  announcements: [],
  performancePolicy: {
    minViewTarget: 5000000,
    penaltyAmount: 2000,
    bonusStep1: 1000,
    superBonusThreshold: 100000000,
    bonusStep2: 1500,
    requiredPagesPerDay: 4,
    clipsPerPageInLog: 4,
    groupPolicies: []
  },
  holidays: DEFAULT_HOLIDAYS
};

export const configService = {
  getConfig: async (): Promise<CompanyConfig> => {
    const { data, error } = await supabase
      .from('company_configs')
      .select('*')
      .eq('id', DEFAULT_CONFIG_ID)
      .maybeSingle();

    if (error || !data) {
      console.warn('Failed to load remote config or missing, using local default:', error);
      return DEFAULT_CONFIG;
    }

    return {
      id: data.id,
      name: DEFAULT_CONFIG.name, // Static title for now
      brands: Array.isArray(data.brands) ? data.brands : DEFAULT_CONFIG.brands,
      rules: Array.isArray(data.rules) ? data.rules : DEFAULT_CONFIG.rules,
      groups: Array.isArray(data.groups) ? data.groups : DEFAULT_CONFIG.groups,
      announcements: Array.isArray(data.announcements) ? data.announcements : DEFAULT_CONFIG.announcements,
      holidays: Array.isArray(data.holidays) ? data.holidays : DEFAULT_CONFIG.holidays,
      performancePolicy: {
        ...DEFAULT_CONFIG.performancePolicy,
        ...(data.performance_policy || {})
      }
    };
  },

  updateConfig: async (payload: Partial<CompanyConfig>): Promise<CompanyConfig> => {
    const current = await configService.getConfig();
    const updated = { ...current, ...payload };

    // Map TS obj to Postgres JSONB column names
    const dbPayload: any = {};
    if (payload.brands) dbPayload.brands = payload.brands;
    if (payload.rules) dbPayload.rules = payload.rules;
    if (payload.groups) dbPayload.groups = payload.groups;
    if (payload.announcements) dbPayload.announcements = payload.announcements;
    if (payload.holidays) dbPayload.holidays = payload.holidays;
    if (payload.performancePolicy) dbPayload.performance_policy = payload.performancePolicy;

    const { error } = await supabase
      .from('company_configs')
      .update(dbPayload)
      .eq('id', DEFAULT_CONFIG_ID);

    if (error) {
       console.error('Failed to update config in Supabase:', error);
       throw error;
    }
    
    return updated;
  },

  saveBrand: async (brand: Brand): Promise<CompanyConfig> => {
    const config = await configService.getConfig();
    const idx = config.brands.findIndex(b => b.id === brand.id);
    if (idx >= 0) config.brands[idx] = brand;
    else config.brands.push(brand);
    return await configService.updateConfig({ brands: config.brands });
  },

  deleteBrand: async (id: string): Promise<CompanyConfig> => {
    const config = await configService.getConfig();
    const filtered = config.brands.filter(b => b.id !== id);
    return await configService.updateConfig({ brands: filtered });
  },

  saveRule: async (rule: CompanyRule): Promise<CompanyConfig> => {
    const config = await configService.getConfig();
    const rules = [...config.rules];
    const index = rules.findIndex(r => r.id === rule.id);
    if (index >= 0) rules[index] = rule;
    else rules.push(rule);
    return await configService.updateConfig({ rules });
  },

  deleteRule: async (id: string): Promise<CompanyConfig> => {
    const config = await configService.getConfig();
    return await configService.updateConfig({ rules: config.rules.filter(r => r.id !== id) });
  },

  saveGroup: async (group: GroupDefinition): Promise<CompanyConfig> => {
    const config = await configService.getConfig();
    let groups = [...config.groups];

    if (group.isDefault) {
      groups = groups.map(g => ({ ...g, isDefault: false }));
    }

    const index = groups.findIndex(g => g.id === group.id);
    if (index >= 0) groups[index] = group;
    else groups.push(group);
    
    return await configService.updateConfig({ groups });
  },

  deleteGroup: async (id: string): Promise<CompanyConfig> => {
    const config = await configService.getConfig();
    return await configService.updateConfig({ groups: config.groups.filter(g => g.id !== id) });
  },

  saveAnnouncement: async (ann: Announcement): Promise<CompanyConfig> => {
    const config = await configService.getConfig();
    const announcements = [...config.announcements];
    const index = announcements.findIndex(a => a.id === ann.id);
    if (index >= 0) announcements[index] = ann;
    else announcements.push(ann);
    return await configService.updateConfig({ announcements });
  },

  deleteAnnouncement: async (id: string): Promise<CompanyConfig> => {
    const config = await configService.getConfig();
    return await configService.updateConfig({ announcements: config.announcements.filter(a => a.id !== id) });
  },

  saveHoliday: async (holiday: any): Promise<CompanyConfig> => {
    const config = await configService.getConfig();
    const holidays = [...config.holidays];
    const index = holidays.findIndex(h => h.id === holiday.id);
    if (index >= 0) holidays[index] = holiday;
    else holidays.push(holiday);
    return await configService.updateConfig({ holidays });
  },

  deleteHoliday: async (id: string): Promise<CompanyConfig> => {
    const config = await configService.getConfig();
    return await configService.updateConfig({ holidays: config.holidays.filter(h => h.id !== id) });
  },

  reorderRules: async (ruleIds: string[]): Promise<CompanyConfig> => {
    const config = await configService.getConfig();
    const updatedRules = config.rules.map(rule => {
      const newOrder = ruleIds.indexOf(rule.id);
      return { ...rule, order: newOrder >= 0 ? newOrder + 1 : 999 };
    });
    return await configService.updateConfig({ rules: updatedRules.sort((a, b) => a.order - b.order) });
  }
};
