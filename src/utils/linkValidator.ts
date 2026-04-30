/**
 * 🛡️ Link Validation Utility — Anti-Fraud System for Daily Submissions
 * 
 * ตรวจสอบลิงก์ที่พนักงานส่งมาว่าเป็นลิงก์ของเพจที่ได้รับมอบหมายจริงหรือไม่
 * 
 * Validation Levels:
 * 1. Domain Check — เป็น facebook.com จริงไหม
 * 2. Format Check — เป็น post/reel/video URL ที่ถูกต้องไหม
 * 3. Page Matching — URL ตรงกับเพจที่ assign ให้ไหม
 * 
 * Edge Cases:
 * - Share URLs (facebook.com/share/...) ไม่สามารถระบุเพจได้ → ให้ผ่านแต่ flag เป็น 'unverifiable'
 * - Shortened URLs (fb.watch, fb.me) → ตรวจ domain ได้แต่ match เพจไม่ได้
 * - URL ที่มี locale (th-th.facebook.com, m.facebook.com) → Normalize ก่อน
 */

export type LinkValidationStatus = 'valid' | 'suspicious' | 'unverifiable' | 'invalid';

export interface LinkValidationResult {
  status: LinkValidationStatus;
  reason: string;
  /** ชื่อเพจที่ดึงจาก URL (ถ้ามี) */
  extractedPageSlug?: string;
}

// ===========================
//  Facebook URL Patterns
// ===========================

/** 
 * Domain whitelist — domain ที่ Facebook ใช้
 * ป้องกันการส่งลิงก์เว็บอื่นมาแทน
 */
const FB_DOMAINS = [
  'facebook.com',
  'www.facebook.com',
  'web.facebook.com',
  'm.facebook.com',
  'fb.com',
  'fb.watch',
  'fb.me',
  'l.facebook.com', // link redirect
];

/** Locale prefix pattern เช่น th-th.facebook.com, en-gb.facebook.com */
const LOCALE_PREFIX_REGEX = /^[a-z]{2}(-[a-z]{2})?\.facebook\.com$/i;

/**
 * Facebook content URL patterns
 * ใช้ตรวจว่า URL เป็นเนื้อหาจริง (post/reel/video) ไม่ใช่แค่หน้า profile
 */
const FB_CONTENT_PATTERNS = [
  /\/posts\//,          // Page posts
  /\/videos\//,         // Videos
  /\/reel\//,           // Reels (from URL bar)
  /\/reels\//,          // Reels (alternative)
  /\/share\/(v|r|p)\//,  // Share links (video/reel/post)
  /\/watch\//,          // Watch section
  /\/watch\?/,          // Watch with query
  /\/stories\//,        // Stories
  /\/photo/,            // Photos
  /\/permalink\//,      // Permalink
  /\/clips\//,          // Clips
  /story_fbid=/,        // Story by ID
  /\/pfbid/,            // Personal FB ID links
];

// ===========================
//  PUBLIC API
// ===========================

/**
 * ตรวจสอบว่า URL เป็น Facebook URL ที่ถูกต้องหรือไม่
 */
export function isFacebookUrl(url: string): boolean {
  try {
    const parsed = new URL(normalizeUrl(url));
    const host = parsed.hostname.toLowerCase();
    return FB_DOMAINS.includes(host) || LOCALE_PREFIX_REGEX.test(host);
  } catch {
    return false;
  }
}

/**
 * ดึงชื่อเพจ (slug) จาก Facebook URL
 * 
 * Examples:
 * - facebook.com/MyPageName/posts/123 → "MyPageName"
 * - facebook.com/profile.php?id=123 → null (personal profile)
 * - facebook.com/share/v/abc → null (ระบุเพจไม่ได้)
 * - facebook.com/reel/123 → null (global reel URL)
 * - facebook.com/MyPage/reel/123 → "MyPage" 
 * - facebook.com/MyPage/videos/123 → "MyPage"
 */
export function extractPageSlug(url: string): string | null {
  try {
    const parsed = new URL(normalizeUrl(url));
    const pathParts = parsed.pathname.split('/').filter(Boolean);

    // Skip share links — ระบุเพจไม่ได้
    if (pathParts[0] === 'share') return null;

    // Skip global paths ที่ไม่มีชื่อเพจ
    const globalPaths = ['reel', 'reels', 'watch', 'stories', 'photo', 'photo.php', 'permalink.php', 'groups', 'events', 'marketplace', 'gaming', 'profile.php'];
    if (globalPaths.includes(pathParts[0])) return null;

    // Path แรกน่าจะเป็นชื่อเพจ ถ้ามี path ย่อยตามมา
    // เช่น /MyPage/posts/123 → MyPage
    // เช่น /MyPage/videos/123 → MyPage
    if (pathParts.length >= 2) {
      const slug = pathParts[0];
      // ตรวจว่า slug ไม่ใช่ path ระบบ
      if (!globalPaths.includes(slug) && slug !== 'people') {
        return slug.toLowerCase();
      }
    }

    // ถ้ามีแค่ path เดียว เช่น /MyPage → เป็นหน้าเพจ ไม่ใช่เนื้อหา
    if (pathParts.length === 1 && !globalPaths.includes(pathParts[0])) {
      return pathParts[0].toLowerCase();
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * ดึง slug จาก facebookUrl ที่เก็บในระบบ
 * เช่น https://facebook.com/MyPageName → "mypagename"
 */
export function extractPageSlugFromFacebookUrl(facebookUrl: string): string | null {
  try {
    const parsed = new URL(normalizeUrl(facebookUrl));
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 1) {
      return pathParts[0].toLowerCase();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * 🛡️ Main Validation Function
 * 
 * ตรวจสอบลิงก์ที่พนักงานส่งมาทั้ง 3 ระดับ:
 * 1. เป็น facebook.com URL จริงไหม
 * 2. เป็น content URL (post/reel/video) ไหม
 * 3. ตรงกับเพจที่ assign ให้ไหม
 * 
 * @param link - URL ที่พนักงานส่งมา
 * @param pageFacebookUrl - Facebook URL ของเพจที่ assign ให้ (เก็บใน Page.facebookUrl)
 * @param pageName - ชื่อเพจในระบบ (ใช้เป็น fallback สำหรับ matching)
 */
export function validateSubmittedLink(
  link: string,
  pageFacebookUrl?: string,
  pageName?: string
): LinkValidationResult {
  const trimmed = link.trim();

  // --- Level 0: ลิงก์ว่าง ---
  if (!trimmed) {
    return { status: 'invalid', reason: 'Empty URL' };
  }

  // --- Level 1: Domain Check ---
  if (!isFacebookUrl(trimmed)) {
    return { status: 'invalid', reason: 'Not a Facebook URL' };
  }

  // --- Level 2: Content Format Check ---
  const isContentUrl = FB_CONTENT_PATTERNS.some(pattern => pattern.test(trimmed));
  if (!isContentUrl) {
    return { status: 'suspicious', reason: 'Not a content URL (post/reel/video)' };
  }

  // --- Level 3: Page Matching ---
  const submittedSlug = extractPageSlug(trimmed);

  // ถ้าเป็น share link หรือ URL ที่ระบุเพจไม่ได้
  if (!submittedSlug) {
    return { 
      status: 'unverifiable', 
      reason: 'Share/shortened URL — cannot verify page ownership',
      extractedPageSlug: undefined
    };
  }

  // ถ้าเพจในระบบมี facebookUrl → เทียบ slug
  if (pageFacebookUrl) {
    const pageSlug = extractPageSlugFromFacebookUrl(pageFacebookUrl);
    if (pageSlug && submittedSlug === pageSlug) {
      return { 
        status: 'valid', 
        reason: 'URL matches assigned page',
        extractedPageSlug: submittedSlug
      };
    }
    if (pageSlug && submittedSlug !== pageSlug) {
      return { 
        status: 'suspicious', 
        reason: `Page mismatch: expected "${pageSlug}", got "${submittedSlug}"`,
        extractedPageSlug: submittedSlug
      };
    }
  }

  // Fallback: เทียบกับชื่อเพจในระบบ (Fuzzy)
  if (pageName) {
    const normalizedPageName = pageName.toLowerCase().replace(/[\s\-_]+/g, '');
    const normalizedSlug = submittedSlug.replace(/[\s\-_\.]+/g, '');
    
    if (normalizedSlug.includes(normalizedPageName) || normalizedPageName.includes(normalizedSlug)) {
      return { 
        status: 'valid', 
        reason: 'URL matches page name',
        extractedPageSlug: submittedSlug
      };
    }
  }

  // ถ้าเป็น content URL แต่ไม่สามารถยืนยันว่าเป็นของเพจนี้
  return { 
    status: 'unverifiable', 
    reason: 'Valid content URL but page ownership unconfirmed',
    extractedPageSlug: submittedSlug
  };
}

/**
 * Batch validation — ตรวจลิงก์ทั้งหมดพร้อมกัน แล้วสรุปผล
 */
export function validateAllLinks(
  links: string[],
  pageFacebookUrl?: string,
  pageName?: string
): {
  results: LinkValidationResult[];
  summary: { valid: number; suspicious: number; unverifiable: number; invalid: number };
} {
  const results = links.map(link => validateSubmittedLink(link, pageFacebookUrl, pageName));
  
  const summary = {
    valid: results.filter(r => r.status === 'valid').length,
    suspicious: results.filter(r => r.status === 'suspicious').length,
    unverifiable: results.filter(r => r.status === 'unverifiable').length,
    invalid: results.filter(r => r.status === 'invalid').length,
  };

  return { results, summary };
}

// ===========================
//  HELPERS
// ===========================

/** Normalize URL — เพิ่ม https:// ถ้าไม่มี, trim whitespace */
function normalizeUrl(url: string): string {
  let normalized = url.trim();
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = 'https://' + normalized;
  }
  return normalized;
}
