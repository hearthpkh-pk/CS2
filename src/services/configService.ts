import { CompanyConfig, Brand, CompanyRule } from '../types';

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
    id: 'r1',
    title: 'วินัยการตอกบัตรและเวลาทำงาน',
    content: 'พนักงานต้องลงเวลาเข้างานไม่เกิน 09:30 น. และเลิกงาน 18:30 น. การสายเกิน 30 นาทีถือว่าเป็นครึ่งวัน ยกเว้นมีเหตุจำเป็นแจ้งล่วงหน้า',
    category: 'General',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'r2',
    title: 'ความปลอดภัยของทรัพย์สิน',
    content: 'ห้ามนำอุปกรณ์ที่มีข้อมูลลับของบริษัทออกนอกสถานที่โดยไม่ได้รับความยินยอม และต้องรักษาความสะอาดของโต๊ะทำงานเสมอ',
    category: 'Safety',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'r3',
    title: 'เกณฑ์การคิดผลตอบแทน (KPI)',
    content: 'โบนัสจะคิดจากยอดวิวสะสมตามเป้าหมายของแต่ละเพจ 100% ถึงเกณฑ์รับโบนัสขั้นบันไดตามนโยบายบริษัท',
    category: 'Finance',
    lastUpdated: new Date().toISOString()
  }
];

const DEFAULT_CONFIG: CompanyConfig = {
  name: 'Editor Platform HQ',
  brands: DEFAULT_BRANDS,
  rules: DEFAULT_RULES,
  performancePolicy: {
    minViewTarget: 5000000,
    penaltyAmount: 500,
    bonusStep1: 1000,
    superBonusThreshold: 10000000,
    bonusStep2: 3000,
    requiredPagesPerDay: 4,
    clipsPerPageInLog: 4
  }
};

export const configService = {
  getConfig: (): CompanyConfig => {
    if (typeof window === 'undefined') return DEFAULT_CONFIG;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONFIG));
      return DEFAULT_CONFIG;
    }
    return JSON.parse(saved);
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
  saveRule: (rule: CompanyRule): CompanyConfig => {
    const config = configService.getConfig();
    const idx = config.rules.findIndex(r => r.id === rule.id);
    if (idx >= 0) config.rules[idx] = rule;
    else config.rules.push(rule);
    return configService.updateConfig({ rules: config.rules });
  },

  deleteRule: (id: string): CompanyConfig => {
    const config = configService.getConfig();
    const filtered = config.rules.filter(r => r.id !== id);
    return configService.updateConfig({ rules: filtered });
  }
};
