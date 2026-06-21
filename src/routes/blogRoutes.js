import express from "express";
import { body } from "express-validator";
import {
  listPublicBlogs,
  getBlogBySlug,
  listAllBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.js";
import { handleValidation } from "../middleware/validate.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/", listPublicBlogs);
router.get("/:slug", getBlogBySlug);

// Admin
router.get("/admin/all", requireAuth, requireRole("admin"), listAllBlogs);
router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  [
    body("title").trim().notEmpty().withMessage("Title is required."),
    body("category").trim().notEmpty().withMessage("Category is required."),
    body("excerpt").trim().notEmpty().withMessage("Excerpt is required."),
  ],
  handleValidation,
  createBlog
);
router.patch("/:id", requireAuth, requireRole("admin"), updateBlog);
router.delete("/:id", requireAuth, requireRole("admin"), deleteBlog);

export default router;
