import type { TrendDir, TrendResult, WeekEntry, LinkedInData, InstagramData, FacebookData, GoogleReviewsData, YouTubeData } from './types';
import { COLORS, emptyLinkedIn, emptyInstagram, emptyFacebook, emptyGoogleReviews, emptyYouTube } from './constants';

export function num(v: unknown): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'number') return isNaN(v) ? 0 : v;
  if (typeof v === 'string') {
    const clean = v.trim().replace(/,/g, '');
    if (!clean) return 0;
    if (clean.toLowerCase().endsWith('k')) {
      const parsed = parseFloat(clean.slice(0, -1));
      return isNaN(parsed) ? 0 : Math.round(parsed * 1000);
    }
    if (clean.toLowerCase().endsWith('m')) {
      const parsed = parseFloat(clean.slice(0, -1));
      return isNaN(parsed) ? 0 : Math.round(parsed * 1000000);
    }
    const n = Number(clean);
    return isNaN(n) ? 0 : n;
  }
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

export function fmtNum(v: number): string {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (v >= 10_000) return (v / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  return v.toLocaleString();
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDateClean(year: number, month1: number, day: number): string {
  const m = MONTH_NAMES[month1 - 1] || 'Jul';
  return `${m} ${day}`;
}

export function parseDateIso(str: string): string | null {
  if (!str) return null;
  const match = str.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  const d = new Date(str.includes('T') ? str : str + 'T12:00:00');
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  return null;
}

export function parseWeekRange(weekId: string): { start: string; end: string } {
  if (!weekId) return { start: '', end: '' };

  const matches = weekId.match(/(\d{4}-\d{2}-\d{2})/g);
  if (matches && matches.length >= 2) {
    return { start: matches[0], end: matches[1] };
  }

  const match = weekId.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const y = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const d = parseInt(match[3], 10);
    const endDate = new Date(y, m - 1, d + 6, 12, 0, 0);

    const endY = endDate.getFullYear();
    const endM = String(endDate.getMonth() + 1).padStart(2, '0');
    const endD = String(endDate.getDate()).padStart(2, '0');
    return {
      start: `${match[1]}-${match[2]}-${match[3]}`,
      end: `${endY}-${endM}-${endD}`,
    };
  }

  return { start: weekId, end: '' };
}

export function formatWeekLabel(weekId: string): string {
  if (!weekId) return '';
  const { start, end } = parseWeekRange(weekId);
  if (!start) return '';

  const m1 = start.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const m2 = end.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (m1) {
    const y1 = parseInt(m1[1], 10);
    const mo1 = parseInt(m1[2], 10);
    const d1 = parseInt(m1[3], 10);
    const startStr = formatDateClean(y1, mo1, d1);

    if (m2) {
      const y2 = parseInt(m2[1], 10);
      const mo2 = parseInt(m2[2], 10);
      const d2 = parseInt(m2[3], 10);
      const endStr = formatDateClean(y2, mo2, d2);
      return `${startStr} – ${endStr}`;
    } else {
      const endCalc = new Date(y1, mo1 - 1, d1 + 6, 12, 0, 0);
      const endStr = formatDateClean(endCalc.getFullYear(), endCalc.getMonth() + 1, endCalc.getDate());
      return `${startStr} – ${endStr}`;
    }
  }

  return weekId;
}

export function shortWeekLabel(weekId: string): string {
  if (!weekId) return '';
  const { start } = parseWeekRange(weekId);
  const m = start.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const y = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10);
    const d = parseInt(m[3], 10);
    return formatDateClean(y, mo, d);
  }
  return start;
}

export function nextMonday(lastWeekId: string | null): string {
  const startDate = lastWeekId ? parseWeekRange(lastWeekId).start : null;
  const m = startDate ? startDate.match(/^(\d{4})-(\d{2})-(\d{2})$/) : null;
  if (m) {
    const y = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10);
    const d = parseInt(m[3], 10);
    const nextD = new Date(y, mo - 1, d + 7, 12, 0, 0);
    const nY = nextD.getFullYear();
    const nM = String(nextD.getMonth() + 1).padStart(2, '0');
    const nD = String(nextD.getDate()).padStart(2, '0');
    return `${nY}-${nM}-${nD}`;
  }
  return '2026-08-03';
}

export function getTrend(val: number, prevVal: number | null): TrendResult {
  if (prevVal === null || prevVal === 0) return { dir: 'flat', pct: 0 };
  const pct = ((val - prevVal) / prevVal) * 100;
  if (Math.abs(pct) < 0.5) return { dir: 'flat', pct: 0 };
  return { dir: pct > 0 ? 'up' : 'down', pct };
}

export function trendColors(dir: TrendDir): { s: string; c: string; arrow: string } {
  if (dir === 'up') return { s: COLORS.upSoft, c: COLORS.up, arrow: '▲' };
  if (dir === 'down') return { s: COLORS.downSoft, c: COLORS.down, arrow: '▼' };
  return { s: COLORS.flatSoft, c: COLORS.flat, arrow: '▬' };
}

// ── JSON Normalization & Import Helpers ──

function findKeyVal(obj: Record<string, unknown>, targetKey: string): unknown {
  if (!obj || typeof obj !== 'object') return undefined;
  const normalizedTarget = targetKey.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const k of Object.keys(obj)) {
    if (k.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedTarget) {
      return obj[k];
    }
  }
  return undefined;
}

function findAnyVal(obj: Record<string, unknown>, candidateKeys: string[]): unknown {
  for (const k of candidateKeys) {
    const v = findKeyVal(obj, k);
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}

function findSubObject(obj: Record<string, unknown>, candidateNames: string[]): Record<string, unknown> | null {
  for (const name of candidateNames) {
    const val = findKeyVal(obj, name);
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      return val as Record<string, unknown>;
    }
  }
  return null;
}

const LINKEDIN_MAP: Record<keyof LinkedInData, string[]> = {
  impressions: ['impressions', 'impression', 'views', 'post_impressions', 'postImpressions', 'content_impressions'],
  reactions: ['reactions', 'reaction', 'likes', 'like'],
  comments: ['comments', 'comment'],
  reposts: ['reposts', 'repost', 'shares', 'share'],
  pageViews: ['pageViews', 'page_views', 'pageviews', 'views'],
  uniqueVisitors: ['uniqueVisitors', 'unique_visitors', 'uniquevisitors', 'visitors'],
  totalFollowers: ['totalFollowers', 'total_followers', 'totalfollowers', 'followers', 'followerCount', 'follower_count'],
  newFollowers: ['newFollowers', 'new_followers', 'newfollowers', 'newFollowers300Days', 'new_followers_300_days'],
  searchAppearances: ['searchAppearances', 'search_appearances', 'searchappearances', 'pageSearches', 'page_searches', 'searches'],
  customButtonClick: ['customButtonClick', 'custom_button_clicks', 'custom_button_click', 'custombuttonclicks', 'buttonClicks', 'button_clicks', 'clicks'],
  newFollowers300Days: ['newFollowers300Days', 'new_followers_300_days', 'newfollowers300days', 'newFollowers', 'new_followers'],
  pageSearches: ['pageSearches', 'page_searches', 'pagesearches', 'searchAppearances', 'search_appearances'],
  reach: ['reach', 'organic_reach', 'organicreach'],
  profileViews: ['profileViews', 'profile_views', 'profileviews'],
};

const INSTAGRAM_MAP: Record<keyof InstagramData, string[]> = {
  views: ['views', 'impressions', 'total_views', 'totalviews', 'video_views', 'videoviews'],
  reach: ['reach', 'accounts_reached', 'accountsreached', 'total_reach'],
  contentInteractions: ['contentInteractions', 'content_interactions', 'contentinteractions', 'interactions', 'engagements', 'engagement'],
  linkClicks: ['linkClicks', 'link_clicks', 'linkclicks', 'clicks', 'website_clicks', 'websiteclicks', 'external_link_taps'],
  visits: ['visits', 'profileVisits', 'profile_visits', 'profilevisits', 'profile_activity'],
  follows: ['follows', 'new_follows', 'new_followers', 'newfollows', 'newfollowers', 'follow'],
  impressions: ['impressions', 'views', 'total_views'],
  profileVisits: ['profileVisits', 'profile_visits', 'visits'],
  reelsViews: ['reelsViews', 'reels_views', 'reels', 'reel_views'],
  postViews: ['postViews', 'post_views', 'posts', 'post_impressions'],
  likes: ['likes', 'like'],
  comments: ['comments', 'comment'],
  shares: ['shares', 'share'],
  saves: ['saves', 'save'],
  totalFollowers: ['totalFollowers', 'total_followers', 'followers'],
};

const FACEBOOK_MAP: Record<keyof FacebookData, string[]> = {
  views: ['views', 'impressions', 'total_views', 'totalviews', 'video_views'],
  viewers: ['viewers', 'reach', 'unique_viewers', 'uniqueviewers', 'people_reached'],
  contentInteractions: ['contentInteractions', 'content_interactions', 'contentinteractions', 'interactions', 'engagements', 'engagement', 'reactions'],
  linkClicks: ['linkClicks', 'link_clicks', 'linkclicks', 'clicks', 'website_clicks'],
  visits: ['visits', 'profileVisits', 'profile_visits', 'profilevisits', 'page_visits'],
  follows: ['follows', 'new_follows', 'new_followers', 'page_likes', 'followers'],
  profileVisits: ['profileVisits', 'profile_visits', 'visits'],
  reach: ['reach', 'viewers'],
};

function parseSingleWeekObject(raw: Record<string, unknown>, fallbackKey?: string): WeekEntry | null {
  if (!raw || typeof raw !== 'object') return null;

  // Resolve weekId / Date
  let rawWeekId = findAnyVal(raw, ['weekId', 'week_id', 'weekID', 'week', 'id', 'date', 'weekRange', 'week_range', 'range', 'dateRange', 'date_range']);
  if (!rawWeekId && fallbackKey) {
    rawWeekId = fallbackKey;
  }

  const rawStart = findAnyVal(raw, ['startDate', 'start_date', 'start', 'from', 'dateFrom']);
  const rawEnd = findAnyVal(raw, ['endDate', 'end_date', 'end', 'to', 'dateTo']);

  let startIso: string | null = null;
  let endIso: string | null = null;

  if (rawStart) startIso = parseDateIso(String(rawStart));
  if (rawEnd) endIso = parseDateIso(String(rawEnd));

  let finalWeekId = '';
  if (startIso && endIso && startIso !== endIso) {
    finalWeekId = `${startIso}_to_${endIso}`;
  } else if (startIso) {
    const d = new Date(startIso + 'T00:00:00');
    const end = new Date(d);
    end.setDate(end.getDate() + 6);
    finalWeekId = `${startIso}_to_${end.toISOString().slice(0, 10)}`;
  } else if (rawWeekId) {
    const parsedRange = parseWeekRange(String(rawWeekId));
    if (parsedRange.start && parsedRange.end && parsedRange.start !== parsedRange.end) {
      finalWeekId = `${parsedRange.start}_to_${parsedRange.end}`;
    } else if (parsedRange.start) {
      finalWeekId = parsedRange.start;
    } else {
      finalWeekId = String(rawWeekId);
    }
  }

  if (!finalWeekId) {
    return null;
  }

  // Extract platforms
  const liSub = findSubObject(raw, ['linkedin', 'LinkedIn', 'LINKEDIN', 'li']);
  const igSub = findSubObject(raw, ['instagram', 'Instagram', 'INSTAGRAM', 'ig']);
  const fbSub = findSubObject(raw, ['facebook', 'Facebook', 'FACEBOOK', 'fb']);
  const googSub = findSubObject(raw, ['google', 'Google', 'GOOGLE', 'googleReviews', 'reviews']);
  const ytSub = findSubObject(raw, ['youtube', 'YouTube', 'YOUTUBE', 'yt']);

  const linkedin: LinkedInData = { ...emptyLinkedIn() };
  const instagram: InstagramData = { ...emptyInstagram() };
  const facebook: FacebookData = { ...emptyFacebook() };
  const google: GoogleReviewsData = { ...emptyGoogleReviews() };
  const youtube: YouTubeData = { ...emptyYouTube() };

  // Populate LinkedIn
  const liSource = liSub || raw;
  for (const [fKey, aliases] of Object.entries(LINKEDIN_MAP)) {
    const val = findAnyVal(liSource, [fKey, ...aliases]);
    if (val !== undefined) {
      (linkedin as unknown as Record<string, unknown>)[fKey] = num(val);
    }
  }

  // Populate Instagram
  const igSource = igSub || raw;
  for (const [fKey, aliases] of Object.entries(INSTAGRAM_MAP)) {
    const val = findAnyVal(igSource, [fKey, ...aliases]);
    if (val !== undefined) {
      (instagram as unknown as Record<string, unknown>)[fKey] = num(val);
    }
  }

  // Populate Facebook
  const fbSource = fbSub || raw;
  for (const [fKey, aliases] of Object.entries(FACEBOOK_MAP)) {
    const val = findAnyVal(fbSource, [fKey, ...aliases]);
    if (val !== undefined) {
      (facebook as unknown as Record<string, unknown>)[fKey] = num(val);
    }
  }

  // Populate Google
  if (googSub) {
    for (const [k, v] of Object.entries(googSub)) {
      if (k !== 'recentReviews') {
        (google as unknown as Record<string, unknown>)[k] = num(v);
      } else if (Array.isArray(v)) {
        google.recentReviews = v;
      }
    }
  }

  // Populate YouTube
  if (ytSub) {
    for (const [k, v] of Object.entries(ytSub)) {
      if (k !== 'recentVideos') {
        (youtube as unknown as Record<string, unknown>)[k] = num(v);
      } else if (Array.isArray(v)) {
        youtube.recentVideos = v;
      }
    }
  }

  return {
    weekId: finalWeekId,
    linkedin,
    instagram,
    facebook,
    google,
    youtube,
  };
}

export function normalizeImportedWeeks(jsonContent: unknown): WeekEntry[] {
  if (!jsonContent) return [];
  const entries: WeekEntry[] = [];

  if (Array.isArray(jsonContent)) {
    for (const item of jsonContent) {
      if (item && typeof item === 'object') {
        const parsed = parseSingleWeekObject(item as Record<string, unknown>);
        if (parsed) entries.push(parsed);
      }
    }
  } else if (typeof jsonContent === 'object') {
    const obj = jsonContent as Record<string, unknown>;

    // Case: { weeks: [...] } or { data: [...] } or { entries: [...] } or { items: [...] }
    const arrayContainer = findAnyVal(obj, ['weeks', 'data', 'entries', 'items', 'weekEntries', 'list']);
    if (Array.isArray(arrayContainer)) {
      for (const item of arrayContainer) {
        if (item && typeof item === 'object') {
          const parsed = parseSingleWeekObject(item as Record<string, unknown>);
          if (parsed) entries.push(parsed);
        }
      }
    } else {
      // Check if it's a single week object
      const directSingle = parseSingleWeekObject(obj);
      if (directSingle && (directSingle.weekId || Object.keys(obj).some((k) => ['linkedin', 'instagram', 'facebook', 'google', 'impressions', 'views'].includes(k.toLowerCase())))) {
        entries.push(directSingle);
      } else {
        // Case: Object with week keys: { "2025-08-04_to_2025-08-10": { ... }, "2025-08-11": { ... } }
        for (const [key, val] of Object.entries(obj)) {
          if (val && typeof val === 'object' && !Array.isArray(val)) {
            const parsed = parseSingleWeekObject(val as Record<string, unknown>, key);
            if (parsed) entries.push(parsed);
          }
        }
      }
    }
  }

  return entries;
}

export function mergeWeekEntries(existingWeeks: WeekEntry[], incomingWeeks: WeekEntry[]): WeekEntry[] {
  const map = new Map<string, WeekEntry>();
  const getKey = (weekId: string) => parseWeekRange(weekId).start || weekId;

  for (const w of existingWeeks) {
    if (w && w.weekId) {
      map.set(getKey(w.weekId), { ...w });
    }
  }

  for (const inc of incomingWeeks) {
    if (!inc || !inc.weekId) continue;
    const key = getKey(inc.weekId);
    const existing = map.get(key);

    if (existing) {
      map.set(key, {
        weekId: inc.weekId.includes('_to_') ? inc.weekId : existing.weekId,
        linkedin: { ...existing.linkedin, ...inc.linkedin },
        instagram: { ...existing.instagram, ...inc.instagram },
        facebook: { ...existing.facebook, ...inc.facebook },
        google: { ...(existing.google || emptyGoogleReviews()), ...(inc.google || {}) },
      });
    } else {
      map.set(key, {
        ...inc,
        google: inc.google || emptyGoogleReviews(),
      });
    }
  }


  return Array.from(map.values()).sort((a, b) => {
    const startA = parseWeekRange(a.weekId).start || a.weekId;
    const startB = parseWeekRange(b.weekId).start || b.weekId;
    return startA.localeCompare(startB);
  });
}

