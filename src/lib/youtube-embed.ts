/**
 * Build a single-video YouTube embed URL for iframes.
 * Returns null for search pages, channels, playlists without v=, etc.
 */
export function toYouTubeEmbedUrl(raw: string): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;

  try {
    const u = new URL(trimmed);
    const host = u.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtu.be') {
      const id = u.pathname.split('/').filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (u.pathname.startsWith('/embed/')) {
        const id = u.pathname.slice('/embed/'.length).split('/')[0];
        return id ? `https://www.youtube.com/embed/${id}${u.search}` : null;
      }
      if (u.pathname === '/watch' || u.pathname === '/watch/') {
        const v = u.searchParams.get('v');
        if (v) {
          const start = parseStartSeconds(u.searchParams);
          const base = `https://www.youtube.com/embed/${v}`;
          return start != null ? `${base}?start=${start}` : base;
        }
      }
      if (u.pathname.startsWith('/shorts/')) {
        const id = u.pathname.split('/')[2];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
    }
  } catch {
    return null;
  }
  return null;
}

/** YouTube `t` / `start` query values: seconds or forms like "1m30s". */
function parseStartSeconds(params: URLSearchParams): number | null {
  const start = params.get('start');
  if (start && /^\d+$/.test(start)) return parseInt(start, 10);
  const t = params.get('t');
  if (!t) return null;
  if (/^\d+$/.test(t)) return parseInt(t, 10);
  let sec = 0;
  const h = t.match(/(\d+)h/);
  const m = t.match(/(\d+)m/);
  const s = t.match(/(\d+)s/);
  if (h) sec += parseInt(h[1]!, 10) * 3600;
  if (m) sec += parseInt(m[1]!, 10) * 60;
  if (s) sec += parseInt(s[1]!, 10);
  if (!h && !m && !s && /^\d+$/.test(t)) sec = parseInt(t, 10);
  return sec > 0 ? sec : null;
}

/**
 * For iframe src: normalize YouTube watch/shorts links to embed; pass through other URLs (e.g. Vimeo).
 */
export function resolveVideoIframeSrc(url: string): string {
  const y = toYouTubeEmbedUrl(url);
  return y ?? url;
}
