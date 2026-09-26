import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomBytes } from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = path.join(__dirname, '../../uploads');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.webm']);
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXT.has(ext) ? ext : '';
    const name = `${Date.now()}-${randomBytes(8).toString('hex')}${safeExt}`;
    cb(null, name);
  },
});

function fileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (ALLOWED_EXT.has(ext) && ALLOWED_MIME.has(file.mimetype)) cb(null, true);
  else cb(new Error('Only JPEG, PNG, WEBP, GIF, MP4, or WEBM files are allowed'));
}

function looksLike(buf, ext) {
  if (ext === '.jpg' || ext === '.jpeg') return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  if (ext === '.png') return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  if (ext === '.gif') return buf.slice(0, 4).toString('ascii') === 'GIF8';
  if (ext === '.webp') return buf.slice(0, 4).toString('ascii') === 'RIFF' && buf.slice(8, 12).toString('ascii') === 'WEBP';
  if (ext === '.webm') return buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3;
  if (ext === '.mp4') return buf.slice(4, 8).toString('ascii') === 'ftyp';
  return false;
}

/** Reject renamed HTML/SVG and anything that is not a real image or video. Deletes the file. */
export function assertSafeUpload(file) {
  if (!file?.path) throw new Error('No file uploaded');
  const ext = path.extname(file.filename || file.originalname || '').toLowerCase();
  const buf = Buffer.alloc(16);
  const fd = fs.openSync(file.path, 'r');
  try {
    fs.readSync(fd, buf, 0, 16, 0);
  } finally {
    fs.closeSync(fd);
  }
  if (!ALLOWED_EXT.has(ext) || !looksLike(buf, ext)) {
    fs.unlink(file.path, () => {});
    throw new Error('Only JPEG, PNG, WEBP, GIF, MP4, or WEBM files are allowed');
  }
}

function uploader(fileSize) {
  return multer({
    storage,
    limits: { fileSize, files: 9 },
    fileFilter,
  });
}

/** Admin property media. */
export const upload = uploader(40 * 1024 * 1024);

/** Guest postcards — smaller, so one visitor cannot fill the disk. */
export const guestUpload = uploader(12 * 1024 * 1024);
