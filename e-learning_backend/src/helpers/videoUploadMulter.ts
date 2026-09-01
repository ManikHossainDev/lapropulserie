import fs from 'fs';
import path from 'path';
import multer from 'multer';

/** Per-file limit for capsule / journey video uploads (must stay in sync with admin). */
export const MAX_VIDEO_UPLOAD_BYTES = 250 * 1024 * 1024; // 250 MB

const UPLOAD_DIR =
  process.env.NODE_ENV === 'production'
    ? '/tmp/videos/uploads'
    : path.join(process.cwd(), 'temp_videos', 'uploads');

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Disk storage for large videos — avoids loading 100–250 MB into Node heap
 * (memoryStorage + S3 buffer often OOMs / resets the connection on small EC2).
 */
export function createVideoUploadMulter() {
  ensureUploadDir();

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      ensureUploadDir();
      cb(null, UPLOAD_DIR);
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
