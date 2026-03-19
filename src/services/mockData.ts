import { Page, DailyLog } from "../types";

export const initialPages: Page[] = [
  { id: '1', name: 'กิ้งก่าทอง มาร์เก็ตติ้ง', category: 'หมวดบันเทิง', status: 'Active' },
  { id: '2', name: 'Healthy Life TH', category: 'หมวดสุขภาพ', status: 'Rest' },
  { id: '3', name: 'Tech Inside', category: 'หมวดเทคโนโลยี', status: 'Problem' }
];

export const generateMockLogs = (pages: Page[]): DailyLog[] => {
  const logs: DailyLog[] = [];
  const today = new Date();
  for (let i = 90; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    pages.forEach(p => {
      let baseFollowers = 10000 + parseInt(p.id) * 5000;
      let baseViews = 5000 + parseInt(p.id) * 2000;
      logs.push({
        id: `log-${p.id}-${dateStr}`,
        pageId: p.id,
        date: dateStr,
        followers: baseFollowers + ((90 - i) * 150) + Math.floor(Math.random() * 500),
        views: baseViews + Math.floor(Math.random() * 5000)
      });
    });
  }
  return logs;
};
