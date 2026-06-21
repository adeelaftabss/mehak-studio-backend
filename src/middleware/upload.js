import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = path.join(__dirname, "..", "uploads");

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".doc", ".png", ".jpg", ".jpeg", ".zip", ".mp4", ".webp"];
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/zip",
  "application/x-zip-compressed",
  "video/mp4",
];

function makeStorage(subfolder) {
  const dest = path.join(uploadsRoot, subfolder);
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, safeName);
    },
  });
}

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error("Unsupported file type. Allowed: PDF, DOCX, PNG, JPG, ZIP."));
  }
  cb(null, true);
}

const maxSizeMb = Number(process.env.MAX_FILE_SIZE_MB || 15);

export function createUploader(subfolder, { maxFiles = 5 } = {}) {
  return multer({
    storage: makeStorage(subfolder),
    fileFilter,
    limits: {
      fileSize: maxSizeMb * 1024 * 1024,
      files: maxFiles,
    },
  });
}

// Builds a public-facing URL for a file saved under /src/uploads
export function toPublicUrl(subfolder, filename) {
  return `/uploads/${subfolder}/${filename}`;
}
