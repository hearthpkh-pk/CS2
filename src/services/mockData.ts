import { Page, DailyLog } from "../types";

export const initialPages: Page[] = [
  { id: '1', name: 'กิ้งก่าทอง มาร์เก็ตติ้ง', url: 'fb.com/goldlizard', category: 'หมวดบันเทิง', status: 'Active', boxId: 1 },
  { id: '2', name: 'Healthy Life TH', url: 'fb.com/healthylife', category: 'หมวดสุขภาพ', status: 'Rest', boxId: 1 },
  { id: '3', name: 'Tech Inside', url: 'fb.com/techinside', category: 'หมวดเทคโนโลยี', status: 'Problem', boxId: 2 },
  { id: '4', name: 'News Today', url: 'fb.com/newstoday', category: 'ข่าว', status: 'Active', boxId: 3 },
  { id: '5', name: 'Movie Lover', url: 'fb.com/movielover', category: 'หนัง', status: 'Rest', boxId: 3 }
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
