import express from "express";
import { body } from "express-validator";
import {
  listActiveAnnouncements,
  listAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js";
import { handleValidation } from "../middleware/validate.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/", listActiveAnnouncements);

// Admin
router.get("/all", requireAuth, requireRole("admin"), listAllAnnouncements);
router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  [
    body("title").trim().notEmpty().withMessage("Title is required."),
    body("message").trim().notEmpty().withMessage("Message is required."),
  ],
  handleValidation,
  createAnnouncement
);
router.patch("/:id", requireAuth, requireRole("admin"), updateAnnouncement);
router.delete("/:id", requireAuth, requireRole("admin"), deleteAnnouncement);

export default router;
