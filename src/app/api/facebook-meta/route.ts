import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side OG Meta Tag scraper for Facebook Pages.
 * 
 * Why server-side? 
 * - Browser (client) cannot fetch Facebook directly due to CORS restrictions.
 * - Server has no CORS limitation, so it can freely fetch any public URL.
 * 
 * Flow: Client → /api/facebook-meta?url=... → Server fetches HTML → Parses OG tags → Returns JSON
 */

interface OGResult {
  title: string | null;
  description: string | null;
  image: string | null;
  followers: number | null;
  url: string;
  success: boolean;
  error?: string;
}

/**
 * Extract content from an OG meta tag in raw HTML.
 * Handles both `content="..."` and `content='...'` formats,
 * as well as reversed attribute order (content before property).
 */
function extractOGTag(html: string, property: string): string | null {
  // Pattern 1: <meta property="og:title" content="..." />
  const regex1 = new RegExp(
    `<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`,
    'i'
  );
  const match1 = html.match(regex1);
  if (match1?.[1]) return decodeHTMLEntities(match1[1]);

  // Pattern 2: <meta content="..." property="og:title" /> (reversed order)
  const regex2 = new RegExp(
    `<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${property}["']`,
    'i'
  );
  const match2 = html.match(regex2);
  if (match2?.[1]) return decodeHTMLEntities(match2[1]);

  return null;
}

/**
 * Attempt to extract follower/like count from the HTML body text.
 * Facebook sometimes includes this in visible text or structured data.
 */
function extractFollowerCount(html: string): number | null {
  // Pattern: "XXX followers" or "XXX people like this"
  const patterns = [
    /(\d[\d,\.]*)\s*(?:followers|ผู้ติดตาม)/i,
    /(?:followers|ผู้ติดตาม)[^<]*?(\d[\d,\.]*)/i,
    /"follower_count":(\d+)/i,
    /"followers_count":(\d+)/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      const cleaned = match[1].replace(/[,\.]/g, '');
      const num = parseInt(cleaned, 10);
      if (!isNaN(num) && num > 0) return num;
    }
  }

  return null;
}

/** Decode common HTML entities like &amp; → & */
function decodeHTMLEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'");
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { success: false, error: 'Missing ?url= parameter' } as OGResult,
      { status: 400 }
    );
  }

  try {
    // Fetch the Facebook page HTML from the server side (no CORS issue here)
    const response = await fetch(url, {
      headers: {
        // Mimic a real browser to avoid bot detection
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `Facebook returned HTTP ${response.status}`,
        title: null, description: null, image: null, followers: null, url,
      } as OGResult);
    }

    const html = await response.text();

    // Extract OG meta tags from the raw HTML
    const title = extractOGTag(html, 'og:title');
    const description = extractOGTag(html, 'og:description');
    const image = extractOGTag(html, 'og:image');
    const followers = extractFollowerCount(html);

    return NextResponse.json({
      success: true,
      title,
      description,
      image,
      followers,
      url,
    } as OGResult);

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown fetch error';
    return NextResponse.json({
      success: false,
      error: message,
      title: null, description: null, image: null, followers: null, url,
    } as OGResult);
  }
}
