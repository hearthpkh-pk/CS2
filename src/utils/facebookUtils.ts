import { FacebookPageMeta } from '@/types';

/**
 * Fetches real public metadata from a Facebook Page URL
 * by calling our server-side API Route that scrapes OG meta tags.
 * 
 * Pipeline:
 *   Client → /api/facebook-meta?url=... → Server fetches HTML → Parses OG tags → Returns JSON
 */
export const getFacebookPageData = async (url: string): Promise<FacebookPageMeta> => {
  try {
    const encodedUrl = encodeURIComponent(url);
    const response = await fetch(`/api/facebook-meta?url=${encodedUrl}`);
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      console.warn('[FacebookSync] Scrape failed:', data.error);
      return buildFallback(url, data.error);
    }

    return {
      profilePic: data.image || undefined,
      description: data.description || undefined,
      followers: data.followers || 0,
      lastSyncAt: new Date().toISOString(),
    };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Network error';
    console.error('[FacebookSync] Fetch error:', message);
    return buildFallback(url, message);
  }
};

/** Build a fallback response when scraping fails */
function buildFallback(url: string, error?: string): FacebookPageMeta {
  return {
    profilePic: undefined,
    description: error 
      ? `ไม่สามารถดึงข้อมูลได้: ${error}` 
      : 'ไม่สามารถดึงข้อมูลจากลิงก์ที่ระบุได้',
    followers: 0,
    lastSyncAt: new Date().toISOString(),
  };
}
