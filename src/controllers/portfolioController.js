import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Portfolio from "../models/Portfolio.js";
import { ApiError } from "../middleware/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Maps a portfolio-content subfolder name to the category enum used by the
// Portfolio model. This is the bridge between the "drop files in a folder"
// workflow described in the spec and the structured data the site renders.
const FOLDER_CATEGORY_MAP = {
  logos: "Logos & Branding",
  branding: "Logos & Branding",
  "social-media": "Social Media",
  resumes: "Resumes & CVs",
  printing: "Printing",
  ads: "Ads & Marketing",
  "photo-editing": "Photo Editing",
  "ai-content": "AI Content",
};

const IMAGE_EXT = [".png", ".jpg", ".jpeg", ".webp"];
const VIDEO_EXT = [".mp4"];
const PDF_EXT = [".pdf"];

// Root folder admins drop files into. Configurable via env so it can point
// at a mounted network drive in production.
const PORTFOLIO_CONTENT_ROOT =
  process.env.PORTFOLIO_CONTENT_PATH || path.join(__dirname, "..", "..", "portfolio-content");

function detectFileType(ext) {
  if (IMAGE_EXT.includes(ext)) return "image";
  if (VIDEO_EXT.includes(ext)) return "video";
  if (PDF_EXT.includes(ext)) return "pdf";
  return null;
}

function titleFromFilename(filename) {
  const base = filename.replace(path.extname(filename), "");
  return base
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Scans /portfolio-content/<folder>/* and upserts a Portfolio document for
// every supported file found that isn't already tracked (matched by
// sourceFolder + original filename encoded in fileUrl). This is what makes
// "drop a file in the folder, it shows up on the site" work without code
// changes, as described in the master spec.
export async function scanPortfolioFolders(req, res, next) {
  try {
    if (!fs.existsSync(PORTFOLIO_CONTENT_ROOT)) {
      return res.status(200).json({
        message: `No portfolio-content folder found at ${PORTFOLIO_CONTENT_ROOT}. Create it with subfolders (logos, branding, social-media, resumes, printing, ads, photo-editing, ai-content) and add files to enable auto-import.`,
        created: 0,
      });
    }

    const subfolders = fs
      .readdirSync(PORTFOLIO_CONTENT_ROOT, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    let created = 0;
    const skippedFolders = [];

    for (const folder of subfolders) {
      const category = FOLDER_CATEGORY_MAP[folder];
      if (!category) {
        skippedFolders.push(folder);
        continue;
      }

      const folderPath = path.join(PORTFOLIO_CONTENT_ROOT, folder);
      const files = fs.readdirSync(folderPath, { withFileTypes: true }).filter((f) => f.isFile());

      for (const file of files) {
        const ext = path.extname(file.name).toLowerCase();
        const fileType = detectFileType(ext);
        if (!fileType) continue; // unsupported file type, skip silently

        const fileUrl = `/portfolio-content/${folder}/${file.name}`;

        const existing = await Portfolio.findOne({ fileUrl });
        if (existing) continue; // already imported

        await Portfolio.create({
          title: titleFromFilename(file.name),
          category,
          fileUrl,
          fileType,
          thumbnailUrl: fileType === "image" ? fileUrl : undefined,
          sourceFolder: folder,
          isPublished: true,
        });
        created += 1;
      }
    }

    res.json({
      message: `Scan complete. ${created} new item(s) imported.`,
      created,
      skippedFolders: skippedFolders.length ? skippedFolders : undefined,
    });
  } catch (err) {
    next(err);
  }
}

export async function listPublicPortfolio(req, res, next) {
  try {
    const { category } = req.query;
    const filter = { isPublished: true, ...(category && category !== "All" && { category }) };
    const items = await Portfolio.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function listAllPortfolio(req, res, next) {
  try {
    const items = await Portfolio.find().sort({ sortOrder: 1, createdAt: -1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function createPortfolioItem(req, res, next) {
  try {
    const item = await Portfolio.create(req.body);
    res.status(201).json({ message: "Portfolio item created.", item });
  } catch (err) {
    next(err);
  }
}

export async function updatePortfolioItem(req, res, next) {
  try {
    const item = await Portfolio.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) throw new ApiError(404, "Portfolio item not found.");
    res.json({ message: "Portfolio item updated.", item });
  } catch (err) {
    next(err);
  }
}

export async function deletePortfolioItem(req, res, next) {
  try {
    const item = await Portfolio.findByIdAndDelete(req.params.id);
    if (!item) throw new ApiError(404, "Portfolio item not found.");
    res.json({ message: "Portfolio item deleted." });
  } catch (err) {
    next(err);
  }
}
