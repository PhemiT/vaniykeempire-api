// Cloudflare Worker — vaniyke-video-worker
// Serves private R2 video files gated behind HMAC-SHA256 signed URLs.
// Rewrites HLS playlist segment URLs so every segment request is also signed.

const TOKEN_EXPIRY_MS = 4 * 60 * 60 * 1000; // 4 hours

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

    // Skip empty lines and EXT tags
    if (!trimmed || trimmed.startsWith('#')) {
      rewritten.push(line);
      continue;
    }

    // Resolve the segment path relative to the playlist's folder
    let segPath;
    if (trimmed.startsWith('http')) {
      // Already absolute — extract the path portion
      const url = new URL(trimmed);
      segPath   = url.pathname.replace(/^\//, '');
    } else {
      // Relative path — join with the playlist's directory
      const dir = basePath.substring(0, basePath.lastIndexOf('/') + 1);
      segPath   = dir + trimmed;
    }

    const token    = await generateToken(segPath, expiresAt, secret);
    const signed   = `/${segPath}?token=${token}&expires=${expiresAt}`;
    rewritten.push(signed);
  }

  return rewritten.join('\n');
}

// ─── Main handler ─────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const url    = new URL(request.url);
    const path   = url.pathname.replace(/^\//, ''); // strip leading slash
    const token  = url.searchParams.get('token');
    const expires = url.searchParams.get('expires');

    // Validate HMAC token
    const valid = await verifyToken(path, token, expires, env.WORKER_SECRET);
    if (!valid) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Fetch the object from R2
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