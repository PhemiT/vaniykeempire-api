// Cloudflare Worker — vaniyke-video-worker
// Serves private R2 video files gated behind HMAC-SHA256 signed URLs.
// Rewrites HLS playlist segment URLs so every segment request is also signed.
// Also handles virtual /preview/ playlists — builds a 2-segment mini-playlist
// on the fly without storing anything extra in R2.

const TOKEN_EXPIRY_MS   = 4 * 60 * 60 * 1000; // 4 hours  (full content)
const PREVIEW_EXPIRY_MS = 30 * 60 * 1000;      // 30 min   (preview segments)
const PREVIEW_SEGMENTS  = 4;                    

// ─── HMAC helpers ─────────────────────────────────────────────────────────

async function hmacSign(secret, message) {
  const enc     = new TextEncoder();
  const keyData = enc.encode(secret);
  const msgData = enc.encode(message);

  const key = await crypto.subtle.importKey(
    'raw', keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sig = await crypto.subtle.sign('HMAC', key, msgData);
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyToken(path, token, expires, secret) {
  if (!token || !expires) return false;
  if (Date.now() > Number(expires)) return false;

  const expected = await hmacSign(secret, `${path}:${expires}`);
  return expected === token;
}

async function generateToken(path, expiresAt, secret) {
  return hmacSign(secret, `${path}:${expiresAt}`);
}

// ─── Playlist rewriter ────────────────────────────────────────────────────
// Rewrites every segment/playlist line inside an .m3u8 so that each URL
// carries its own signed token. The client never touches R2 directly.

async function rewritePlaylist(text, basePath, secret) {
  const expiresAt = Date.now() + TOKEN_EXPIRY_MS;
  const lines     = text.split('\n');
  const rewritten = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      rewritten.push(line);
      continue;
    }

    let segPath;
    if (trimmed.startsWith('http')) {
      const url = new URL(trimmed);
      segPath   = url.pathname.replace(/^\//, '');
    } else {
      const dir = basePath.substring(0, basePath.lastIndexOf('/') + 1);
      segPath   = dir + trimmed;
    }

    const token  = await generateToken(segPath, expiresAt, secret);
    const signed = `/${segPath}?token=${token}&expires=${expiresAt}`;
    rewritten.push(signed);
  }

  return rewritten.join('\n');
}

// ─── Preview virtual playlist builder ────────────────────────────────────
// Reads seg000.ts … seg001.ts from the 1080p folder and returns a minimal
// #EXTM3U playlist with signed URLs for each segment.
// The segment duration is read from the real playlist.m3u8 so the HLS
// player gets an accurate EXTINF value.

async function buildPreviewPlaylist(contentId, bucket, secret) {
  const expiresAt  = Date.now() + PREVIEW_EXPIRY_MS;

  // Try renditions in preference order
  const candidates = ['1080p', '720p', '480p'];
  let playlistObj  = null;
  let hlsBase      = null;

  for (const res of candidates) {
    const key = `videos/${contentId}/hls/${res}/playlist.m3u8`;
    const obj = await bucket.get(key);
    if (obj) {
      playlistObj = obj;
      hlsBase     = `videos/${contentId}/hls/${res}`;
      break;
    }
  }

  if (!playlistObj) return null;

  const playlistText = await playlistObj.text();
  const lines        = playlistText.split('\n');

  // Collect up to PREVIEW_SEGMENTS { extinf, segName } pairs
  const segments = [];
  for (let i = 0; i < lines.length && segments.length < PREVIEW_SEGMENTS; i++) {
    const line = lines[i].trim();
    if (line.startsWith('#EXTINF:')) {
      const nextLine = (lines[i + 1] || '').trim();
      if (nextLine && !nextLine.startsWith('#')) {
        // nextLine is the segment filename, e.g. seg000.ts
        segments.push({ extinf: line, segName: nextLine });
        i++; // skip the segment line we just consumed
      }
    }
  }

  if (segments.length === 0) return null;

  // Build signed URLs for each segment
  const m3uLines = ['#EXTM3U', '#EXT-X-VERSION:3'];

  // Derive target duration from the first EXTINF
  const firstDur = parseFloat(segments[0].extinf.replace('#EXTINF:', '').replace(',', ''));
  m3uLines.push(`#EXT-X-TARGETDURATION:${Math.ceil(firstDur)}`);
  m3uLines.push('#EXT-X-MEDIA-SEQUENCE:0');
  m3uLines.push('#EXT-X-PLAYLIST-TYPE:VOD');

  for (const { extinf, segName } of segments) {
    const segPath = `${hlsBase}/${segName}`;
    const token   = await generateToken(segPath, expiresAt, secret);
    m3uLines.push(extinf);
    m3uLines.push(`/${segPath}?token=${token}&expires=${expiresAt}`);
  }

  m3uLines.push('#EXT-X-ENDLIST');
  return m3uLines.join('\n');
}

// ─── Main handler ─────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin':  '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Range',
        },
      });
    }

    const url     = new URL(request.url);
    const path    = url.pathname.replace(/^\//, '');
    const token   = url.searchParams.get('token');
    const expires = url.searchParams.get('expires');

    // ── Preview virtual route ──────────────────────────────────────────────
    // Pattern: videos/{contentId}/preview/playlist.m3u8
    const previewMatch = path.match(/^videos\/([^/]+)\/preview\/playlist\.m3u8$/);
    if (previewMatch) {
      // Validate token against the virtual path (same signing logic as real files)
      const valid = await verifyToken(path, token, expires, env.WORKER_SECRET);
      if (!valid) return new Response('Unauthorized', { status: 401 });

      const contentId      = previewMatch[1];
      const previewPlaylist = await buildPreviewPlaylist(contentId, env.R2_BUCKET, env.WORKER_SECRET);

      if (!previewPlaylist) {
        return new Response('Preview not available', { status: 404 });
      }

      return new Response(previewPlaylist, {
        status: 200,
        headers: {
          'Content-Type':  'application/vnd.apple.mpegurl',
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // ── Normal signed-file route ───────────────────────────────────────────
    const valid = await verifyToken(path, token, expires, env.WORKER_SECRET);
    if (!valid) {
      return new Response('Unauthorized', { status: 401 });
    }

    const object = await env.R2_BUCKET.get(path);
    if (!object) {
      return new Response('Not Found', { status: 404 });
    }

    const isPlaylist = path.endsWith('.m3u8');

    if (isPlaylist) {
      const text      = await object.text();
      const rewritten = await rewritePlaylist(text, path, env.WORKER_SECRET);

      return new Response(rewritten, {
        status: 200,
        headers: {
          'Content-Type':  'application/vnd.apple.mpegurl',
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Serve segment (.ts) or any other binary
    return new Response(object.body, {
      status: 200,
      headers: {
        'Content-Type':  object.httpMetadata?.contentType || 'video/mp2t',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  },
};