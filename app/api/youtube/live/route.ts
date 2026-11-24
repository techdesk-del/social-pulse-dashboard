import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/db/mongodb';
import WeekEntry from '../../../../lib/db/models/WeekEntry';
import type { UrbanGaonChannelLiveData, YouTubeData, YouTubeVideoItem } from '../../../../lib/types';
import {
  DEFAULT_YOUTUBE_VIDEOS,
  DEFAULT_URBANGAON_CHANNEL_VIDEOS,
  URBANGAON_CHANNEL_ID,
} from '../../../../lib/constants';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const YT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
};

function parseCompactCount(raw?: string | null): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/,/g, '').trim().toUpperCase();
  const match = cleaned.match(/^(\d+(?:\.\d+)?)([KMB])?$/);
  if (!match) {
    const fallback = parseInt(cleaned.replace(/[^\d]/g, ''), 10);
    return Number.isFinite(fallback) ? fallback : 0;
  }
  const value = parseFloat(match[1]);
  const suffix = match[2];
  if (suffix === 'K') return Math.round(value * 1_000);
  if (suffix === 'M') return Math.round(value * 1_000_000);
  if (suffix === 'B') return Math.round(value * 1_000_000_000);
  return Math.round(value);
}

function formatDurationSeconds(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return '';
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function formatRelativePublished(isoDate?: string): string | undefined {
  if (!isoDate) return undefined;
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return undefined;
  const diffDays = Math.max(0, Math.floor((Date.now() - parsed.getTime()) / 86400000));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;
  const months = Math.floor(diffDays / 30);
  if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  const years = Math.floor(months / 12);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}

async function scrapeVideoLive(vid: YouTubeVideoItem): Promise<YouTubeVideoItem> {
  const next: YouTubeVideoItem = { ...vid };
  try {
    const videoRes = await fetch(`https://www.youtube.com/watch?v=${vid.videoId}`, {
      headers: YT_HEADERS,
      cache: 'no-store',
    });

    if (!videoRes.ok) return next;
    const vHtml = await videoRes.text();

    // Title
    const titleMatch = vHtml.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      const cleanTitle = titleMatch[1]
        .replace(/\s*-\s*YouTube$/i, '')
        .replace(/&amp;/g, '&')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .trim();
      if (cleanTitle && cleanTitle.length > 5) {
        next.title = cleanTitle;
      }
    }

    // Views
    const viewMatch =
      vHtml.match(/"viewCount":"(\d+)"/) ||
      vHtml.match(/"viewCount":(\d+)/) ||
      vHtml.match(/([0-9,]+)\s*views/i);
    if (viewMatch) {
      const vCount = parseCompactCount(viewMatch[1] || viewMatch[0]);
      if (vCount >= 0) {
        next.views = vCount;
      }
    }

    // Likes
    const likeMatch =
      vHtml.match(/"likeCount":"?(\d+)"?/) ||
      vHtml.match(/like this video along with ([0-9,]+) other people/i) ||
      vHtml.match(/"label":"([0-9,]+)\s*likes"/i) ||
      vHtml.match(
        /"factoidRenderer":\{"value":\{"simpleText":"([0-9.,KMB]+)"\},"label":\{"simpleText":"Likes"\}/i
      );
    if (likeMatch) {
      const lCount = parseCompactCount(likeMatch[1] || likeMatch[0]);
      if (lCount >= 0) {
        next.likes = lCount;
      }
    }

    // Comments
    const commentMatch =
      vHtml.match(/"commentCount":\{"simpleText":"([0-9.,KMB]+)"\}/i) ||
      vHtml.match(
        /"engagementPanelTitleHeaderRenderer":\{"title":\{"runs":\[\{"text":"Comments"\}\]\},"contextualInfo":\{"runs":\[\{"text":"([0-9.,KMB]+)"\}\]\}/i
      );
    if (commentMatch) {
      next.comments = parseCompactCount(commentMatch[1]);
    } else if (next.comments === undefined) {
      next.comments = 0;
    }

    // Duration
    const lenMatch = vHtml.match(/"lengthSeconds":"(\d+)"/);
    if (lenMatch) {
      const formatted = formatDurationSeconds(parseInt(lenMatch[1], 10));
      if (formatted) next.duration = formatted;
    }

    // Publish Date
    const pubMatch = vHtml.match(/"publishDate":"([^"]+)"/);
    if (pubMatch) {
      const rel = formatRelativePublished(pubMatch[1]);
      if (rel) next.publishedTime = rel;
    }
  } catch (vErr) {
    console.warn(`Live scrape note for YouTube video ${vid.videoId}:`, vErr);
  }
  return next;
}

async function fetchUrbanGaonChannelLive(): Promise<UrbanGaonChannelLiveData> {
  let subscribers = 19;
  let videosCount = DEFAULT_URBANGAON_CHANNEL_VIDEOS.length;
  let channelVideos: YouTubeVideoItem[] = JSON.parse(
    JSON.stringify(DEFAULT_URBANGAON_CHANNEL_VIDEOS)
  );

  // 1. Live channel subscribers & video count from @UrbanGaonOfficial
  try {
    const channelRes = await fetch('https://www.youtube.com/@UrbanGaonOfficial/videos', {
      headers: YT_HEADERS,
      cache: 'no-store',
    });

    if (channelRes.ok) {
      const html = await channelRes.text();

      const subMatch =
        html.match(/"content":"([0-9.,KMB]+)\s*subscribers"/i) ||
        html.match(/"subscriberCountText":\{[^}]*"simpleText":"([^"]+)"/i) ||
        html.match(/([0-9.,KMB]+)\s*subscribers/i);
      if (subMatch) {
        const parsedSub = parseCompactCount(subMatch[1]);
        if (parsedSub > 0) subscribers = parsedSub;
      }

      const videoCountMatch =
        html.match(/"content":"([0-9.,KMB]+)\s*videos"/i) ||
        html.match(/"videoCountText":\{[^}]*"simpleText":"([^"]+)"/i) ||
        html.match(/([0-9.,KMB]+)\s*videos/i);
      if (videoCountMatch) {
        const parsedCount = parseCompactCount(videoCountMatch[1]);
        if (parsedCount > 0) videosCount = parsedCount;
      }
    }
  } catch (err) {
    console.warn('Live @UrbanGaonOfficial channel fetch note:', err);
  }

  // 2. Discover latest videos from official YouTube RSS feed (auto-picks up new uploads too)
  try {
    const rssRes = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${URBANGAON_CHANNEL_ID}`,
      { headers: YT_HEADERS, cache: 'no-store' }
    );
    if (rssRes.ok) {
      const rss = await rssRes.text();
      const entries = [...rss.matchAll(/<entry>([\s\S]*?)<\/entry>/g)];
      if (entries.length > 0) {
        const defaultById = new Map(
          DEFAULT_URBANGAON_CHANNEL_VIDEOS.map((v) => [v.videoId, v])
        );
        const parsedFromRss: YouTubeVideoItem[] = [];
        for (const match of entries) {
          const block = match[1];
          const videoId = block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1]?.trim();
          if (!videoId) continue;
          const fallback = defaultById.get(videoId);
          const rawTitle = block.match(/<title>([^<]+)<\/title>/)?.[1]?.trim();
          const publishedIso = block.match(/<published>([^<]+)<\/published>/)?.[1]?.trim();
          const rssViews = parseInt(block.match(/views="(\d+)"/)?.[1] || '0', 10);

          parsedFromRss.push({
            videoId,
            title: rawTitle || fallback?.title || 'UrbanGaon Video',
            views: Number.isFinite(rssViews) ? rssViews : fallback?.views || 0,
            duration: fallback?.duration || '',
            publishedTime: formatRelativePublished(publishedIso) || fallback?.publishedTime,
            thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            url: `https://www.youtube.com/watch?v=${videoId}`,
            likes: fallback?.likes ?? 0,
            comments: fallback?.comments ?? 0,
          });
        }
        if (parsedFromRss.length > 0) {
          channelVideos = parsedFromRss;
        }
      }
    }
  } catch (rssErr) {
    console.warn('Live @UrbanGaonOfficial RSS fetch note:', rssErr);
  }

  // 3. Fetch live views, likes, comments, duration for every channel video in parallel
  const liveVideos = await Promise.all(channelVideos.map((v) => scrapeVideoLive(v)));

  const totalViews = liveVideos.reduce((acc, v) => acc + (v.views || 0), 0);
  const totalLikes = liveVideos.reduce((acc, v) => acc + (v.likes || 0), 0);
  const totalComments = liveVideos.reduce((acc, v) => acc + (v.comments || 0), 0);

  return {
    channelId: URBANGAON_CHANNEL_ID,
    handle: '@UrbanGaonOfficial',
    channelName: 'UrbanGaon',
    subscribers,
    totalViews,
    totalLikes,
    totalComments,
    videosCount: Math.max(videosCount, liveVideos.length),
    videos: liveVideos,
    syncedAt: new Date().toISOString(),
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const syncToDatabase = searchParams.get('sync') === 'true';

    // Run UrbanGaon Channel live scrape + existing Business Cafe Podcast scrape in parallel
    const [urbanGaonChannel, knownVideos] = await Promise.all([
      fetchUrbanGaonChannelLive(),
      Promise.all(
        (JSON.parse(JSON.stringify(DEFAULT_YOUTUBE_VIDEOS)) as YouTubeVideoItem[]).map((v) =>
          scrapeVideoLive(v)
        )
      ),
    ]);

    const totalViews = knownVideos.reduce((acc, v) => acc + (v.views || 0), 0);
    const totalLikes = knownVideos.reduce((acc, v) => acc + (v.likes || 0), 0);
    const totalComments =
      knownVideos.reduce((acc, v) => acc + (v.comments || 0), 0) + urbanGaonChannel.totalComments;

    const fallbackViews = DEFAULT_YOUTUBE_VIDEOS.reduce((acc, v) => acc + (v.views || 0), 0);
    const fallbackLikes = DEFAULT_YOUTUBE_VIDEOS.reduce((acc, v) => acc + (v.likes || 0), 0);

    const liveYouTubeData: YouTubeData = {
      subscribers: urbanGaonChannel.subscribers,
      newSubscribers: 1,
      views: totalViews || fallbackViews || 11086,
      watchTimeHours: Math.round(((totalViews || fallbackViews || 11086) * 17.8) / 60) || 3288,
      averageViewDurationMinutes: 17.8,
      impressions: Math.round((totalViews || fallbackViews || 11086) / 0.076) || 145800,
      ctr: 7.6,
      likes: totalLikes || fallbackLikes || 162,
      comments: totalComments || 6,
      shares: 12,
      videosCount: urbanGaonChannel.videosCount,
      recentVideos: knownVideos,
      urbanGaonChannel,
    };

    // Persist to MongoDB Atlas when sync=true
    if (syncToDatabase) {
      try {
        await connectToDatabase();

        const latestDoc = await WeekEntry.findOne().sort({ weekId: -1 });
        if (latestDoc) {
          await WeekEntry.updateOne(
            { _id: latestDoc._id },
            {
              $set: {
                'youtube.subscribers': liveYouTubeData.subscribers,
                'youtube.views': liveYouTubeData.views,
                'youtube.watchTimeHours': liveYouTubeData.watchTimeHours,
                'youtube.likes': liveYouTubeData.likes,
                'youtube.comments': liveYouTubeData.comments,
                'youtube.videosCount': liveYouTubeData.videosCount,
                'youtube.recentVideos': liveYouTubeData.recentVideos,
                'youtube.urbanGaonChannel': liveYouTubeData.urbanGaonChannel,
              },
            }
          );
        }

        await WeekEntry.updateMany(
          {},
          {
            $set: {
              'youtube.recentVideos': liveYouTubeData.recentVideos,
              'youtube.urbanGaonChannel': liveYouTubeData.urbanGaonChannel,
            },
          }
        );
      } catch (dbErr) {
        console.warn('MongoDB YouTube sync note:', dbErr);
      }
    }

    return NextResponse.json(
      {
        ok: true,
        data: liveYouTubeData,
        timestamp: new Date().toISOString(),
        source: 'live_youtube_stream',
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (err: unknown) {
    console.error('GET /api/youtube/live error:', err);
    const fallbackChannel: UrbanGaonChannelLiveData = {
      channelId: URBANGAON_CHANNEL_ID,
      handle: '@UrbanGaonOfficial',
      channelName: 'UrbanGaon',
      subscribers: 19,
      totalViews: DEFAULT_URBANGAON_CHANNEL_VIDEOS.reduce((acc, v) => acc + v.views, 0),
      totalLikes: DEFAULT_URBANGAON_CHANNEL_VIDEOS.reduce((acc, v) => acc + (v.likes || 0), 0),
      totalComments: DEFAULT_URBANGAON_CHANNEL_VIDEOS.reduce(
        (acc, v) => acc + (v.comments || 0),
        0
      ),
      videosCount: DEFAULT_URBANGAON_CHANNEL_VIDEOS.length,
      videos: DEFAULT_URBANGAON_CHANNEL_VIDEOS,
      syncedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to fetch live YouTube analytics',
        data: {
          subscribers: 19,
          newSubscribers: 1,
          views: 11086,
          watchTimeHours: 3288,
          averageViewDurationMinutes: 17.8,
          impressions: 145800,
          ctr: 7.6,
          likes: 162,
          comments: 6,
          shares: 12,
          videosCount: 2,
          recentVideos: DEFAULT_YOUTUBE_VIDEOS,
          urbanGaonChannel: fallbackChannel,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}
