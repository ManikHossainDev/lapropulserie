'use client';

import { useEffect, useRef, useState } from 'react';

const S3_DOMAIN = 'la-propulserie-media.s3.eu-west-3.amazonaws.com';
const CLOUDFRONT_DOMAIN = 'd4k0cugb067ei.cloudfront.net';
const DEBUG = typeof window !== 'undefined';

function debugLog(step, payload) {
  if (!DEBUG) return;
  // eslint-disable-next-line no-console
  console.log(`[VIDEO DEBUG] ${step}`, payload);
}

export function rewriteMediaUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return rawUrl;
  if (rawUrl.includes(S3_DOMAIN)) {
    return rawUrl.replace(S3_DOMAIN, CLOUDFRONT_DOMAIN);
  }
  return rawUrl;
}

export function resolveVideoUrl(video) {
  if (!video) return null;
  if (typeof video === 'string') return rewriteMediaUrl(video);
  if (video.url) return rewriteMediaUrl(video.url);
  return null;
}

/** Convert YouTube / Vimeo watch URLs (or pasted iframe HTML) into embeddable iframe src. */
export function resolveEmbedUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const url = rawUrl.trim();

  const iframeSrc = url.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i);
  if (iframeSrc?.[1]) {
    return resolveEmbedUrl(iframeSrc[1]);
  }

  const ytWatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{6,})/i,
  );
  if (ytWatch?.[1]) {
    return `https://www.youtube-nocookie.com/embed/${ytWatch[1]}`;
  }

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo?.[1]) {
    return `https://player.vimeo.com/video/${vimeo[1]}`;
  }

  if (url.includes('youtube-nocookie.com/embed/') || url.includes('player.vimeo.com/')) {
    return url;
  }

  if (url.includes('youtube.com/embed/')) {
    return url.replace('youtube.com/embed/', 'youtube-nocookie.com/embed/');
  }

  return null;
}

export function getVideoStatus(video) {
  if (!video) return null;
  const url = resolveVideoUrl(video);
  // Playable URL wins — never block forever on stuck "processing"
  if (url) return 'ready';
  if (typeof video === 'object' && video.status === 'processing') return 'processing';
  if (typeof video === 'object' && video.status === 'failed') return 'failed';
  return null;
}

export default function CapsuleVideoPlayer({ video, className = 'w-full rounded-xl max-h-96 bg-black' }) {
  const videoRef = useRef(null);
  const url = resolveVideoUrl(video);
  const embedUrl = resolveEmbedUrl(url);
  const status = getVideoStatus(video);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    debugLog('1. player props', { video, url, embedUrl, status });
  }, [video, url, embedUrl, status]);

  useEffect(() => {
    setErrorMsg('');
    if (embedUrl) {
      debugLog('2. using YouTube/Vimeo iframe', { embedUrl });
      return undefined;
    }

    const element = videoRef.current;
    if (!url || !element) {
      debugLog('2. skip native <video> mount', { url, hasElement: !!element });
      return undefined;
    }

    const isHls = url.includes('.m3u8');
    debugLog('2. native/HLS path', { url, isHls });

    if (!isHls) {
      element.src = url;
      element.onerror = () => {
        debugLog('3. <video> error', { url, code: element.error?.code, message: element.error?.message });
        setErrorMsg("Impossible de lire cette vidéo (fichier / URL invalide).");
      };
      element.onloadeddata = () => {
        debugLog('3. <video> loadeddata OK', { url });
      };
      return undefined;
    }

    if (element.canPlayType('application/vnd.apple.mpegurl')) {
      element.src = url;
      return undefined;
    }

    let hlsInstance;
    let cancelled = false;

    import('hls.js')
      .then(({ default: Hls }) => {
        if (cancelled || !element) return;
        if (Hls.isSupported()) {
          hlsInstance = new Hls({
            enableWorker: true,
            loader: class CloudFrontLoader extends Hls.DefaultConfig.loader {
              constructor(config) {
                super(config);
                const load = this.load.bind(this);
                this.load = function (context, cfg, callbacks) {
                  if (context?.url) {
                    context.url = rewriteMediaUrl(context.url);
                  }
                  return load(context, cfg, callbacks);
                };
              }
            },
          });
          hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
            if (data?.fatal) {
              debugLog('3. HLS fatal error', data);
              setErrorMsg(
                "Impossible de lire la vidéo pour le moment. Réessayez dans quelques instants.",
              );
            }
          });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(element);
          debugLog('3. HLS attached', { url });
        } else {
          element.src = url;
        }
      })
      .catch((err) => {
        debugLog('3. HLS import failed', err);
        if (element) element.src = url;
        setErrorMsg("Le lecteur vidéo n'a pas pu démarrer.");
      });

    return () => {
      cancelled = true;
      hlsInstance?.destroy();
    };
  }, [url, embedUrl]);

  if (status === 'processing') {
    debugLog('UI: processing (no URL yet)', { video });
    return (
      <p className="text-sm text-gray-500 border border-dashed rounded-xl p-4">
        Vidéo en cours de traitement. Revenez dans quelques instants.
        <span className="block text-xs mt-1 opacity-70">[debug: status=processing, no url]</span>
      </p>
    );
  }

  if (status === 'failed') {
    debugLog('UI: failed', { video });
    return (
      <p className="text-sm text-red-500 border border-red-200 rounded-xl p-4">
        La vidéo n&apos;a pas pu être chargée.
        {typeof video === 'object' && video?.errorMessage
          ? ` (${video.errorMessage})`
          : ''}
      </p>
    );
  }

  if (!url) {
    debugLog('UI: no url', { video });
    return (
      <p className="text-sm text-amber-700 border border-amber-200 bg-amber-50 rounded-xl p-4">
        Aucune vidéo n&apos;est encore disponible pour cette étape.
        <span className="block text-xs mt-1 opacity-70">[debug: empty video field]</span>
      </p>
    );
  }

  if (embedUrl) {
    return (
      <div className="space-y-2">
        <div className="relative w-full overflow-hidden rounded-xl bg-black aspect-video">
          <iframe
            key={embedUrl}
            src={embedUrl}
            title="Capsule video"
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => debugLog('3. iframe loaded', { embedUrl })}
          />
        </div>
        <p className="text-[10px] text-gray-400 break-all">[debug iframe] {embedUrl}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <video ref={videoRef} controls playsInline className={className} />
      <p className="text-[10px] text-gray-400 break-all">[debug file] {url}</p>
      {errorMsg && (
        <p className="text-sm text-red-500 border border-red-200 rounded-xl p-3">{errorMsg}</p>
      )}
    </div>
  );
}
