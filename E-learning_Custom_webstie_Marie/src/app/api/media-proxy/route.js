import { NextResponse } from 'next/server';

const ALLOWED_HOSTS = new Set([
  'd4k0cugb067ei.cloudfront.net',
  'la-propulserie-media.s3.eu-west-3.amazonaws.com',
]);

const S3_HOST = 'la-propulserie-media.s3.eu-west-3.amazonaws.com';
const CF_HOST = 'd4k0cugb067ei.cloudfront.net';

function corsHeaders(extra = {}) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    ...extra,
  };
}

function toCloudFront(urlString) {
  try {
    const u = new URL(urlString);
    if (u.hostname === S3_HOST) {
      u.hostname = CF_HOST;
      return u.toString();
    }
  } catch {
    // ignore
  }
  return urlString;
}

function proxyHref(absoluteUrl) {
  return `/api/media-proxy?url=${encodeURIComponent(toCloudFront(absoluteUrl))}`;
}

function absolutize(ref, baseUrl) {
  try {
    return new URL(ref, baseUrl).toString();
  } catch {
    return ref;
  }
}

/** Rewrite m3u8 so KEY / segments go through this same-origin proxy (fixes CORS + private S3). */
function rewritePlaylist(body, masterUrl) {
  const base = masterUrl.replace(/\/[^/?#]+(\?.*)?$/, '/');
  return body
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return line;

      if (trimmed.startsWith('#')) {
        return line.replace(/URI="([^"]+)"/g, (_m, uri) => {
          const abs = absolutize(uri, base);
          return `URI="${proxyHref(abs)}"`;
        });
      }

      const abs = absolutize(trimmed, base);
      return proxyHref(abs);
    })
    .join('\n');
}

function isAllowedUrl(raw) {
  try {
    const u = new URL(raw);
    return (u.protocol === 'https:' || u.protocol === 'http:') && ALLOWED_HOSTS.has(u.hostname);
  } catch {
    return false;
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET(request) {
  const raw = request.nextUrl.searchParams.get('url');
  if (!raw || !isAllowedUrl(raw)) {
    return NextResponse.json({ message: 'Invalid media URL' }, { status: 400, headers: corsHeaders() });
  }

  const upstreamUrl = toCloudFront(raw);

  let upstream;
  try {
    upstream = await fetch(upstreamUrl, {
      headers: { Accept: '*/*' },
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json({ message: 'Upstream fetch failed' }, { status: 502, headers: corsHeaders() });
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { message: `Upstream ${upstream.status}` },
      { status: upstream.status, headers: corsHeaders() },
    );
  }

  const contentType = upstream.headers.get('content-type') || '';
  const isPlaylist =
    contentType.includes('mpegurl') ||
    contentType.includes('m3u8') ||
    /\.m3u8(\?|$)/i.test(upstreamUrl);

  if (isPlaylist) {
    const text = await upstream.text();
    const rewritten = rewritePlaylist(text, upstreamUrl);
    return new NextResponse(rewritten, {
      status: 200,
      headers: corsHeaders({
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Cache-Control': 'public, max-age=60',
      }),
    });
  }

  // Stream segments/keys — do not buffer entire .ts into memory
  return new NextResponse(upstream.body, {
    status: 200,
    headers: corsHeaders({
      'Content-Type': contentType || 'application/octet-stream',
      'Cache-Control': upstream.headers.get('cache-control') || 'public, max-age=3600',
    }),
  });
}
