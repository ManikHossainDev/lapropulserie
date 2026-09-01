import fs from 'fs';
import os from 'os';
import path from 'path';
import multer from 'multer';

/** Per-file limit for capsule / journey video uploads (must stay in sync with admin). */
export const MAX_VIDEO_UPLOAD_BYTES = 250 * 1024 * 1024; // 250 MB

/**
 * Prefer /tmp/videos/uploads (shared volume for ffmpeg), but fall back when the
 * host mount is root-owned and the non-root `app` user cannot mkdir there.
 */
function resolveWritableUploadDir(): string {
  const candidates = [
    process.env.VIDEO_UPLOAD_TMP_DIR,
    process.env.NODE_ENV === 'production' ? '/tmp/videos/uploads' : null,
    path.join(process.cwd(), 'temp_videos', 'uploads'),
    path.join(os.tmpdir(), 'lapropulserie-video-uploads'),
  ].filter(Boolean) as string[];

  let lastError: unknown;

  for (const dir of candidates) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      fs.accessSync(dir, fs.constants.W_OK);
      return dir;
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `No writable video upload temp directory. Last error: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`,
  );
}

let resolvedUploadDir: string | null = null;

function getUploadDir(): string {
  if (!resolvedUploadDir) {
    resolvedUploadDir = resolveWritableUploadDir();
  }
  return resolvedUploadDir;
}

/**
 * Disk storage for large videos — avoids loading 100–250 MB into Node heap
 * (memoryStorage + S3 buffer often OOMs / resets the connection on small EC2).
 */
export function createVideoUploadMulter() {
  // Resolve lazily on first middleware load, with fallbacks (do not assume /tmp/videos is writable).
  const uploadDir = getUploadDir();

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      try {
        const dir = getUploadDir();
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      } catch (error) {
        cb(error as Error, uploadDir);
      }
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || '';
      const base = path
        .basename(file.originalname, ext)
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, '-')
        .slice(0, 80);
      cb(null, `${Date.now()}-${base}${ext}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: MAX_VIDEO_UPLOAD_BYTES },
  });
}

export const CAPSULE_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
  'video/x-m4v',
  'video/avi',
  'video/mpeg',
  'video/3gpp',
  'application/octet-stream',
];
