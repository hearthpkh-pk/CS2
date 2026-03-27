export interface DailyReport {
  id: string;
  userId: string;
  userName: string;
  date: string;
  brand: string;
  postCount: number;
  totalPostsRequired: number;
  submissionTime: string;
  status: 'Complete' | 'Pending' | 'Missing';
  views: number;
  pagesCount: number;
  isPinned: boolean;
  team: string;
  tags: string[];
}

const teams = ['Core Ops', 'Creative Force', 'Strategic Alpha', 'Growth Beta'];
const availableTags = ['Top Performer', 'New Hire', 'Night Shift', 'Weekend Crew'];
const brandsList = ['Nike', 'Apple', 'Disney', 'Coca Cola', 'Pepsi', 'Adidas', 'Netflix', 'None'];

export const mockReports: DailyReport[] = Array.from({ length: 20 }).map((_, i) => {
  const isComplete = Math.random() > 0.3;
  const pagesCount = 10 + (i % 11);
  const totalRequired = Math.floor(pagesCount * 0.6);
  const userName = `Operator ${String.fromCharCode(65 + (i % 26))}${i + 1}`;
  const team = teams[i % teams.length];
  const tags = i % 5 === 0 ? [availableTags[i % availableTags.length]] : [];
  
  return {
    id: `r-${i + 1}`,
    userId: `u${i + 1}`,
    userName,
    date: '2026-03-27',
    brand: brandsList[i % brandsList.length],
    postCount: isComplete ? totalRequired : Math.floor(totalRequired * 0.5),
    totalPostsRequired: totalRequired,
    submissionTime: isComplete ? `${10 + Math.floor(i/4)}:${(i * 13) % 60 < 10 ? '0' : ''}${(i * 13) % 60}` : '-',
    status: isComplete ? 'Complete' : 'Pending',
    views: Math.floor(Math.random() * 5000000) + 1000000,
    pagesCount,
    isPinned: i < 3, // Pin the first 3 by default for demo
    team,
    tags
  };
});
