import { Page, DailyLog } from '@/types';

export const buildFakeDatabase = (selectedYear: string): { fakePages: Page[], fakeLogs: DailyLog[] } => {
  const fakePages: Page[] = [];
  const fakeLogs: DailyLog[] = [];
  
  // 1. Generate 10 Fake Pages
  for(let p = 1; p <= 10; p++) {
    fakePages.push({
      id: `demo-${p}`,
      name: `PAGE DEMO ${p}`,
      category: 'Fake Category',
      status: 'Active',
      boxId: p,
      ownerId: 'u1',
      teamId: 'team1',
      facebookUrl: `https://facebook.com/demo${p}`,
      facebookData: {
        profilePic: `https://api.dicebear.com/7.x/initials/svg?seed=${p}`,
        description: 'Mock data simulation page',
        followers: 0, // This will be assigned the final accumulated value
        lastSyncAt: new Date().toISOString()
      }
    });
  }

  // 2. Generate exactly 5 months of data (Jan to May)
  const daysInMonths = [31, 28, 31, 30, 31]; // Ignoring leap years for demo simplicity
  
  fakePages.forEach(page => {
    const pageId = Number(page.boxId) || 1;
    let accumulatedFollowers = 2000 + (pageId * 500); // Base followers at Jan 1st
    
    let daysPassed = 0;
    
    // Iterate exactly through the 5 months
    for(let m = 0; m < 5; m++) {
      const monthStr = (m + 1).toString().padStart(2, '0');
      
      for(let d = 1; d <= daysInMonths[m]; d++) {
        daysPassed++;
        const dateStr = `${selectedYear}-${monthStr}-${d.toString().padStart(2, '0')}`;
        
        // --- Views Logic (Spiky / Viral) ---
        const daySeed = (daysPassed * 137) % 251;
        const pageSeed = (pageId * 97) % 193;
        const combined = (daySeed * pageSeed) % 100; // 0 to 99
        
        let multiplier = 1.0;
        let isViral = false;
        
        if (combined > 95) { 
          multiplier = 5.5; // Mega viral
          isViral = true; 
        } else if (combined > 85) { 
          multiplier = 2.8; // High traffic
        } else if (combined < 10) { 
          multiplier = 0.3; // Very slow day
        }
        
        const noise = (Math.abs(Math.sin(daysPassed + pageId)) * 0.3) + 0.85;
        const baseViews = 80000 + (pageId * 15000); 
        const dailyViews = Math.floor(baseViews * multiplier * noise);
        
        // --- Follower Logic (Correlated to Views) ---
        // Base organic growth even on quiet days
        let followerGrowth = 5 + (pageId % 3) * 5; 
        
        if (isViral) {
          // If highly viral, followers spike (e.g. 0.5% conversion of views to followers)
          followerGrowth += Math.floor(dailyViews * 0.005); 
        } else if (multiplier > 1.5) {
          // Good days yield decent followers (e.g. 0.1% conversion)
          followerGrowth += Math.floor(dailyViews * 0.001); 
        } else {
          // Normal/slow days get tiny random fluctuations
          followerGrowth += Math.floor(Math.random() * 10);
        }
        
        accumulatedFollowers += followerGrowth;
        
        // --- Write Daily Record ---
        fakeLogs.push({
          id: `demo-log-${page.id}-${dateStr}`,
          pageId: page.id,
          staffId: 'u1',
          date: dateStr,
          views: dailyViews,
          followers: accumulatedFollowers,
          source: 'API',
          createdAt: new Date().toISOString()
        });
      }
    }
    
    // Set the page's final follower count snapshot
    if (page.facebookData) {
      page.facebookData.followers = accumulatedFollowers;
    }
  });

  return { fakePages, fakeLogs };
};
