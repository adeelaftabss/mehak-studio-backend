import express from "express";
import {
  scanPortfolioFolders,
  listPublicPortfolio,
  listAllPortfolio,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
} from "../controllers/portfolioController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { createUploader, toPublicUrl } from "../middleware/upload.js";

const router = express.Router();
const uploadPortfolioFile = createUploader("portfolio", { maxFiles: 1 });

router.get("/", listPublicPortfolio);

// Admin
router.get("/all", requireAuth, requireRole("admin"), listAllPortfolio);

// Triggers a scan of /portfolio-content/* and imports any new files found.
// Can also be wired to a scheduled job (e.g. cron) for fully hands-off
// updates, instead of requiring the admin to click "Scan" in the panel.
router.post("/scan", requireAuth, requireRole("admin"), scanPortfolioFolders);

// Manual upload path (admin uploads directly through the panel rather than
// dropping a file into the portfolio-content folder)
router.post(
  "/upload",
  requireAuth,
  requireRole("admin"),
  uploadPortfolioFile.single("file"),
  (req, res, next) => {
    if (req.file) {
      req.body.fileUrl = toPublicUrl("portfolio", req.file.filename);
      req.body.fileType = req.file.mimetype.startsWith("video")
        ? "video"
        : req.file.mimetype === "application/pdf"
        ? "pdf"
        : "image";
    }
    next();
  },
  createPortfolioItem
);

router.patch("/:id", requireAuth, requireRole("admin"), updatePortfolioItem);
router.delete("/:id", requireAuth, requireRole("admin"), deletePortfolioItem);

export default router;
