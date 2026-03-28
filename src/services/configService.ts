import { Brand, CompanyConfig, CompanyRule, Announcement, GroupDefinition } from '../types';

const STORAGE_KEY = 'cs_company_config';

const DEFAULT_BRANDS: Brand[] = [
  { id: 'b1', name: 'Nike', isActive: true },
  { id: 'b2', name: 'Apple', isActive: true },
  { id: 'b3', name: 'Disney', isActive: true },
  { id: 'b4', name: 'Coca Cola', isActive: true },
  { id: 'b5', name: 'Pepsi', isActive: true },
  { id: 'b6', name: 'Adidas', isActive: true },
  { id: 'b7', name: 'Netflix', isActive: true },
];

const DEFAULT_RULES: CompanyRule[] = [
  {
    id: 'rule-general',
    title: 'กฎระเบียบทั่วไป (General Rules)',
    content: `พนักงานทุกคนต้องปฏิบัติตามกฎระเบียบอย่างเคร่งครัด เพื่อรักษามาตรฐานการทำงานและวัฒนธรรมองค์กรที่ดี\n\n- วันทำงานคือวันจันทร์ - อาทิตย์ (หากไม่มีการแจ้งล่วงหน้า)\n- การลางานต้องแจ้งล่วงหน้าอย่างน้อย 24 ชั่วโมงผ่านระบบปฏิทิน\n- ห้ามนำข้อมูลลูกค้าหรือข้อมูลเพจไปเผยแพร่ภายนอกโดยไม่ได้รับอนุญาต`,
    category: 'General',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'rule-penalties',
    title: 'กฎการหักเงิน (Penalties)',
    content: `หากยอดวิวรวม (Views) ของพนักงานในเดือนนั้น ไม่ถึงเกณฑ์ขั้นต่ำ (10,000,000 Views) จะมีมาตรการหักเงินเดือน -2,000 THB\n\nหมายเหตุ: การหักเงินจะหักจากฐานเงินเดือนก่อนคำนวณค่าคอมมิชชัน`,
    category: 'Safety',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'rule-commission',
    title: 'โครงสร้างค่าคอมมิชชัน (Commission)',
    content: `- Tier 1 (Standard): 1,000 THB ต่อยอดวิวทุก 10,000,000 Views\n- Tier 2 (Super Bonus): 1,500 THB ต่อยอดวิวทุก 10,000,000 Views (เมื่อครบ 100M)`,
    category: 'Finance',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'rule-submissions',
    title: 'กฎระเบียบการส่งงาน (Submissions)',
    content: `พนักงานต้องส่งงานผ่านระบบ "ส่งคลิปงานรายวัน" ทุกวันทำงาน\n\n- จำนวนขั้นต่ำ: 10 เพจ / วัน\n- จำนวนคลิป: 4 คลิป / เพจ (รวม 40 คลิป/วัน)\n\n⚠️ หากส่งไม่ครบถ้วนตามกำหนด ระบบจะถือว่าขาดงาน (Absent)`,
    category: 'Compliance',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'rule-culture',
    title: 'วัฒนธรรมองค์กร (Culture)',
    content: `เราเน้นการทำงานที่รับผิดชอบตนเองเป็นหลัก (High Responsibility) และการวัดผลด้วยความสำเร็จ (Result-Oriented)\n\nCore Values: Honesty, Transparency, Prosperity`,
    category: 'General',
    lastUpdated: new Date().toISOString()
  }
];

const DEFAULT_CONFIG: CompanyConfig = {
  id: 'company-editor',
  name: 'Editor Platform',
  brands: [
    { id: 'b1', name: 'Nike', isActive: true },
    { id: 'b2', name: 'Apple', isActive: true },
    { id: 'b3', name: 'Samsung', isActive: true }
  ],
  rules: DEFAULT_RULES,
  groups: [
    { id: 'news', name: 'กลุ่มข่าวสาร', description: 'กลุ่มเน้นงานปริมาณข่าวสารรายวัน', policy: { groupId: 'news', minPagesPerDay: 5, minClipsPerPage: 8 } },
    { id: 'movies', name: 'กลุ่มหนัง', description: 'กลุ่มงานคุณภาพภาพยนตร์', policy: { groupId: 'movies', minPagesPerDay: 10, minClipsPerPage: 4 } },
    { id: 'shows', name: 'กลุ่มรายการ', description: 'กลุ่มวาไรตี้และรายการทีวี', policy: { groupId: 'shows', minPagesPerDay: 10, minClipsPerPage: 4 } }
  ],
  announcements: [
    {
      id: 'announcement-1',
      message: 'ยินดีต้อนรับสู่ระบบ Editor v2.0 - ตรวจสอบกฏระเบียบใหม่ได้ที่หน้า Company Policy',
      type: 'info',
      isActive: true,
      startDate: new Date().toISOString()
    }
  ],
  performancePolicy: {
    minViewTarget: 5000000,
    penaltyAmount: 500,
    bonusStep1: 1000,
    superBonusThreshold: 10000000,
    bonusStep2: 3000,
    requiredPagesPerDay: 10,
    clipsPerPageInLog: 4,
    groupPolicies: [
      { groupId: 'News', minPagesPerDay: 5, minClipsPerPage: 8 },
      { groupId: 'Movies', minPagesPerDay: 10, minClipsPerPage: 4 },
      { groupId: 'Shows', minPagesPerDay: 10, minClipsPerPage: 4 }
    ]
  }
};

const loadConfig = (): CompanyConfig => {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return DEFAULT_CONFIG;
  try {
    const parsed = JSON.parse(stored);
    // Migration: Deep merge with DEFAULT_CONFIG to ensure all new schema fields exist
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      // Migration: Ensure arrays are restored from defaults if empty or missing
      groups: (parsed.groups && parsed.groups.length > 0) ? parsed.groups : DEFAULT_CONFIG.groups,
      announcements: (parsed.announcements && parsed.announcements.length > 0) ? parsed.announcements : DEFAULT_CONFIG.announcements,
      rules: (parsed.rules && parsed.rules.length > 0) ? parsed.rules : DEFAULT_CONFIG.rules,
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
    const groups = [...config.groups];
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
  }
};
