import { Brand, CompanyConfig, CompanyRule, Announcement, GroupDefinition, Role } from '../types';

const STORAGE_KEY = 'cs_company_config';

const DEFAULT_BRANDS: Brand[] = [
  { id: "brand-1774793169256", name: "USE99", isActive: true },
  { id: "brand-1774793206352", name: "IF888", isActive: true },
  { id: "brand-1774793218627", name: "UFA257", isActive: true },
  { id: "brand-1774793221874", name: "ZEED777", isActive: true }
];

const DEFAULT_RULES: CompanyRule[] = [
  {
    id: "rule-general",
    title: "กฎระเบียบทั่วไป (General Rules)",
    content: "พนักงานทุกคนต้องปฏิบัติตามกฎระเบียบอย่างเคร่งครัด เพื่อรักษามาตรฐานการทำงานและวัฒนธรรมองค์กรที่ดี\n\n- วันทำงานคือวันจันทร์ - อาทิตย์ (หากไม่มีการแจ้งล่วงหน้า)\n- การลางานต้องแจ้งล่วงหน้าอย่างน้อย 24 ชั่วโมงผ่านระบบปฏิทิน\n- ห้ามนำข้อมูลลูกค้าหรือข้อมูลเพจไปเผยแพร่ภายนอกโดยไม่ได้รับอนุญาต",
    category: "General" as any,
    lastUpdated: "2026-03-28T09:48:37.136Z",
    order: 1
  },
  {
    id: "rule-responsibilities",
    title: "หน้าที่รับผิดชอบ (Responsibilities)",
    content: "- หาฟุตเทจ ตัดต่อคลิปสั้น (Reels/Shorts) ความยาว 1-5 นาที\n- แทรกแบนเนอร์โฆษณาลงคลิปตามรูปแบบที่กำหนด\n- โพสต์ลงเพจ Facebook / Social Media ที่ได้รับมอบหมาย (ดูแลขั้นต่ำ 10 เพจ)",
    category: "Operation" as any,
    order: 2,
    targetRoles: [Role.Staff, Role.Manager, Role.SuperAdmin],
    lastUpdated: "2026-03-29T07:59:40.349Z"
  },
  {
    id: "rule-submissions",
    title: "กฎระเบียบการส่งงาน (Submissions)",
    content: "พนักงานต้องส่งงานผ่านระบบ \"ส่งคลิปงานรายวัน\" ทุกวันทำงาน\n\n- จำนวนขั้นต่ำ: 10 เพจ / วัน\n- จำนวนคลิป: 4 คลิป / เพจ (รวม 40 คลิป/วัน)\n\n⚠️ หากส่งไม่ครบถ้วนตามกำหนด ระบบจะถือว่าขาดงาน (Absent)",
    category: "Compliance" as any,
    order: 4,
    targetRoles: [Role.Staff, Role.Manager, Role.SuperAdmin, Role.Developer],
    lastUpdated: "2026-03-29T08:13:00.637Z"
  },
  {
    id: "rule-commission",
    title: "โครงสร้างค่าคอมมิชชัน (Commission)",
    content: "- Tier 1 (Standard): 1,000 THB ต่อยอดวิวทุก 10,000,000 Views\n- Tier 2 (Super Bonus): 1,500 THB ต่อยอดวิวทุก 10,000,000 Views (เมื่อครบ 100M)",
    category: "Finance" as any,
    order: 4,
    targetRoles: [Role.Staff, Role.Manager, Role.SuperAdmin, Role.Developer],
    lastUpdated: "2026-03-29T08:13:00.637Z"
  },
  {
    id: "rule-penalties",
    title: "กฎการหักเงิน (Penalties)",
    content: "หากยอดวิวรวม (Views) ของพนักงานในเดือนนั้น ไม่ถึงเกณฑ์ขั้นต่ำ (10,000,000 Views) จะมีมาตรการหักเงินเดือน -2,000 THB\n\n- หยุดงานหักตามค่าแรง เช่น 12,000 หยุดหัก 400\n\n- ส่งงานไม่ครบ 40 คลิปต่อวันหัก 20 บาท/คลิป\n\n- ส่งลิงก์ซ้ำหัก 50 บาท/คลิป\n\nหากขาดงานจะถูกหักเป็น 2 แรง",
    category: "Safety" as any,
    order: 5,
    targetRoles: [Role.Staff, Role.Manager, Role.SuperAdmin, Role.Developer],
    lastUpdated: "2026-03-29T08:13:00.637Z"
  },
  {
    id: "rule-culture",
    title: "วัฒนธรรมองค์กร (Culture)",
    content: "เราเน้นการทำงานที่รับผิดชอบตนเองเป็นหลัก (High Responsibility) และการวัดผลด้วยความสำเร็จ (Result-Oriented)\n\nCore Values: Honesty, Transparency, Prosperity",
    category: "General" as any,
    lastUpdated: "2026-03-28T09:48:37.136Z",
    order: 6
  }
];

const DEFAULT_CONFIG: CompanyConfig = {
  id: "company-editor",
  name: "Editor Platform HQ",
  brands: DEFAULT_BRANDS,
  rules: DEFAULT_RULES,
  groups: [
    { id: "news", name: "กลุ่มข่าวสาร", description: "กลุ่มเน้นงานปริมาณข่าวสารรายวัน", policy: { groupId: "news", minPagesPerDay: 5, minClipsPerPage: 8 }, isDefault: false },
    { id: "movies", name: "กลุ่มหนัง", description: "กลุ่มงานคุณภาพภาพยนตร์", policy: { groupId: "movies", minPagesPerDay: 10, minClipsPerPage: 4 }, isDefault: false },
    { id: "shows", name: "กลุ่มรายการ", description: "กลุ่มวาไรตี้และรายการทีวี", policy: { groupId: "shows", minPagesPerDay: 10, minClipsPerPage: 4 }, isDefault: true }
  ],
  announcements: [
    {
      id: "ann-1774791920928",
      message: "ฟหกฟดฟดฟหด",
      type: "warning",
      isActive: true,
      startDate: "2026-03-28T17:00:00.000Z",
      endDate: "2026-03-30T17:00:00.000Z",
      targetRoles: [Role.Staff, Role.Manager, Role.SuperAdmin],
      targetGroups: ["news", "shows", "movies"],
      targetTeams: [],
      targetUsers: []
    }
  ],
  performancePolicy: {
    minViewTarget: 5000000,
    penaltyAmount: 2000,
    bonusStep1: 1000,
    superBonusThreshold: 100000000,
    bonusStep2: 1500,
    requiredPagesPerDay: 4,
    clipsPerPageInLog: 4,
    groupPolicies: [
      { groupId: "news", minPagesPerDay: 5, minClipsPerPage: 8 },
      { groupId: "movies", minPagesPerDay: 10, minClipsPerPage: 4 },
      { groupId: "shows", minPagesPerDay: 10, minClipsPerPage: 4 }
    ]
  }
};

const loadConfig = (): CompanyConfig => {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return DEFAULT_CONFIG;
  try {
    const parsed = JSON.parse(stored);
    
    // Migration: Merge rules and filter out deprecated ones (Work Format, Training)
    const deprecatedIds = ['rule-work-format', 'rule-training'];
    const currentRules = (parsed.rules || []).filter((r: CompanyRule) => !deprecatedIds.includes(r.id));
    
    const mergedRules = [...currentRules];
    DEFAULT_RULES.forEach(defaultRule => {
      const idx = mergedRules.findIndex(r => r.id === defaultRule.id);
      if (idx < 0) {
        mergedRules.push(defaultRule);
      } else if (!mergedRules[idx].order || !mergedRules[idx].targetRoles) {
        // Force refresh if missing new properties
        mergedRules[idx] = defaultRule;
      }
    });

    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      rules: mergedRules,
      groups: (parsed.groups && parsed.groups.length > 0) ? parsed.groups : DEFAULT_CONFIG.groups,
      announcements: (parsed.announcements && parsed.announcements.length > 0) ? parsed.announcements : DEFAULT_CONFIG.announcements,
      brands: (parsed.brands && parsed.brands.length > 0) ? parsed.brands : DEFAULT_CONFIG.brands,
      performancePolicy: {
        ...DEFAULT_CONFIG.performancePolicy,
        ...(parsed.performancePolicy || {})
      }
    };
  } catch (e) {
    console.error('Failed to parse company config:', e);
    return DEFAULT_CONFIG;
  }
};

export const configService = {
  getConfig: (): CompanyConfig => {
    return loadConfig();
  },

  updateConfig: (config: Partial<CompanyConfig>): CompanyConfig => {
    const current = configService.getConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  // Brand Helpers
  saveBrand: (brand: Brand): CompanyConfig => {
    const config = configService.getConfig();
    const idx = config.brands.findIndex(b => b.id === brand.id);
    if (idx >= 0) config.brands[idx] = brand;
    else config.brands.push(brand);
    return configService.updateConfig({ brands: config.brands });
  },

  deleteBrand: (id: string): CompanyConfig => {
    const config = configService.getConfig();
    const filtered = config.brands.filter(b => b.id !== id);
    return configService.updateConfig({ brands: filtered });
  },

  // Rules Helpers
  saveRule(rule: CompanyRule): CompanyConfig {
    const config = this.getConfig();
    const rules = [...config.rules];
    const index = rules.findIndex(r => r.id === rule.id);
    if (index >= 0) rules[index] = rule;
    else rules.push(rule);
    return this.updateConfig({ ...config, rules });
  },

  deleteRule(id: string): CompanyConfig {
    const config = this.getConfig();
    return this.updateConfig({ ...config, rules: config.rules.filter(r => r.id !== id) });
  },

  saveGroup(group: GroupDefinition): CompanyConfig {
    const config = this.getConfig();
    let groups = [...config.groups];

    // If setting a new default, ensure all others are set to false
    if (group.isDefault) {
      groups = groups.map(g => ({ ...g, isDefault: false }));
    }

    const index = groups.findIndex(g => g.id === group.id);
    if (index >= 0) groups[index] = group;
    else groups.push(group);
    
    return this.updateConfig({ ...config, groups });
  },

  deleteGroup(id: string): CompanyConfig {
    const config = this.getConfig();
    return this.updateConfig({ ...config, groups: config.groups.filter(g => g.id !== id) });
  },

  saveAnnouncement(ann: Announcement): CompanyConfig {
    const config = this.getConfig();
    const announcements = [...config.announcements];
    const index = announcements.findIndex(a => a.id === ann.id);
    if (index >= 0) announcements[index] = ann;
    else announcements.push(ann);
    return this.updateConfig({ ...config, announcements });
  },

  deleteAnnouncement(id: string): CompanyConfig {
    const config = this.getConfig();
    return this.updateConfig({ ...config, announcements: config.announcements.filter(a => a.id !== id) });
  },

  reorderRules(ruleIds: string[]): CompanyConfig {
    const config = this.getConfig();
    const updatedRules = config.rules.map(rule => {
      const newOrder = ruleIds.indexOf(rule.id);
      return { ...rule, order: newOrder >= 0 ? newOrder + 1 : 999 };
    });
    return this.updateConfig({ ...config, rules: updatedRules.sort((a, b) => a.order - b.order) });
  },

  resetConfig(): CompanyConfig {
    localStorage.removeItem(STORAGE_KEY);
    return DEFAULT_CONFIG;
  }
};
