const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3/videos';
const YOUTUBE_SEARCH_API_BASE = 'https://www.googleapis.com/youtube/v3/search';

function extractYouTubeVideoId(raw: string): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;

  try {
    const u = new URL(trimmed);
    const host = u.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtu.be') {
      const id = u.pathname.split('/').filter(Boolean)[0];
      return id || null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (u.pathname === '/watch' || u.pathname === '/watch/') {
        return u.searchParams.get('v');
      }
      if (u.pathname.startsWith('/embed/')) {
        const id = u.pathname.slice('/embed/'.length).split('/')[0];
        return id || null;
      }
      if (u.pathname.startsWith('/shorts/')) {
        const id = u.pathname.split('/')[2];
        return id || null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function formatIso8601Duration(isoDuration: string): string | null {
  const totalSeconds = parseIso8601DurationSeconds(isoDuration);
  if (!totalSeconds) return null;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function parseIso8601DurationSeconds(isoDuration: string): number {
  const match = isoDuration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return 0;

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  return totalSeconds;
}

export async function getYouTubeDurationsByUrl(urls: string[]): Promise<Record<string, string>> {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();
  if (!apiKey || !urls.length) return {};

  const idToUrls = new Map<string, string[]>();
  for (const url of urls) {
    const id = extractYouTubeVideoId(url);
    if (!id) continue;
    const list = idToUrls.get(id) || [];
    list.push(url);
    idToUrls.set(id, list);
  }

  if (!idToUrls.size) return {};

  const ids = Array.from(idToUrls.keys()).join(',');
  const endpoint = `${YOUTUBE_API_BASE}?part=contentDetails&id=${encodeURIComponent(ids)}&key=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(endpoint, { cache: 'no-store' });
    if (!res.ok) return {};
    const json = await res.json() as {
      items?: Array<{
        id?: string;
        contentDetails?: { duration?: string };
      }>;
    };

    const out: Record<string, string> = {};
    for (const item of json.items || []) {
      if (!item.id || !item.contentDetails?.duration) continue;
      const formatted = formatIso8601Duration(item.contentDetails.duration);
      if (!formatted) continue;
      const rawUrls = idToUrls.get(item.id) || [];
      for (const raw of rawUrls) out[raw] = formatted;
    }
    return out;
  } catch {
    return {};
  }
}

export async function findYouTubeVideoByQuery(
  query: string
): Promise<{ url: string; title: string } | null> {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();
  if (!apiKey || !query.trim()) return null;

  const endpoint = `${YOUTUBE_SEARCH_API_BASE}?part=snippet&type=video&videoEmbeddable=true&videoDuration=medium&maxResults=5&q=${encodeURIComponent(query)}&key=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(endpoint, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json() as {
      items?: Array<{
        id?: { videoId?: string };
        snippet?: { title?: string };
      }>;
    };

    const candidates = (json.items || []).filter((item) => {
      const title = (item.snippet?.title || '').toLowerCase();
      if (!item.id?.videoId) return false;
      if (title.includes('shorts') || title.includes('reel') || title.includes('#shorts')) {
        return false;
      }
      return true;
    });
    if (!candidates.length) return null;

    const ids = candidates
      .map((item) => item.id?.videoId)
      .filter(Boolean)
      .join(',');
    if (!ids) return null;

    const detailsEndpoint = `${YOUTUBE_API_BASE}?part=contentDetails&id=${encodeURIComponent(ids)}&key=${encodeURIComponent(apiKey)}`;
    const detailsRes = await fetch(detailsEndpoint, { cache: 'no-store' });
    if (!detailsRes.ok) return null;
    const detailsJson = await detailsRes.json() as {
      items?: Array<{
        id?: string;
        contentDetails?: { duration?: string };
      }>;
    };

    const durationById = new Map<string, number>();
    for (const item of detailsJson.items || []) {
      if (!item.id || !item.contentDetails?.duration) continue;
      durationById.set(item.id, parseIso8601DurationSeconds(item.contentDetails.duration));
    }

    const MIN_SECONDS = 120;
    const best = candidates.find((item) => {
      const id = item.id?.videoId;
      if (!id) return false;
      const durationSec = durationById.get(id) || 0;
      return durationSec >= MIN_SECONDS;
    }) || candidates[0];

    const videoId = best.id?.videoId;
    if (!videoId) return null;
    return {
      url: `https://www.youtube.com/watch?v=${videoId}`,
      title: best.snippet?.title || query,
    };
  } catch {
    return null;
  }
}
