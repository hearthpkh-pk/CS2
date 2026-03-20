import { FacebookPageMeta } from '@/types';

/**
 * Simulates fetching metadata from a Facebook Page URL.
 * In a real production app, this would use the Graph API or a Scraper service.
 */
export const getFacebookPageData = async (url: string): Promise<Partial<FacebookPageMeta>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(p => p !== '');
    
    // Extract a potential name from the URL
    // e.g., facebook.com/MyAwesomePage -> MyAwesomePage
    const rawName = pathParts[0] || 'Facebook Page';
    const cleanName = rawName.replace(/[-_.]/g, ' ');

    // Generate random but consistent data based on the URL string
    const seed = url.length;
    const followers = Math.floor(1500 + (seed * 1234.5) % 50000);
    
    // Using high-quality placeholder images for the demo
    const profilePics = [
      'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=400&q=80',
      'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=400&q=80',
      'https://images.unsplash.com/photo-1614850523011-8f49ffc73908?w=400&q=80',
      'https://images.unsplash.com/photo-1614850523598-92751cd01d1d?w=400&q=80',
    ];
    const profilePic = profilePics[seed % profilePics.length];

    return {
      profilePic,
      description: `นี่คือคำอธิบายของเพจ ${cleanName} ซึ่งดึงมาจาก Facebook โดยอัตโนมัติ เพื่อประหยัดเวลาในการตั้งค่าระบบ`,
      followers,
      lastSyncAt: new Date().toISOString()
    };
  } catch (error) {
    return {
      profilePic: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80',
      description: 'ไม่สามารถดึงข้อมูลจากลิงก์ที่ระบุได้ กรุณาตรวจสอบความถูกต้อง',
      followers: 0,
      lastSyncAt: new Date().toISOString()
    };
  }
};
