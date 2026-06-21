import express from "express";
import { body } from "express-validator";
import {
  listMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  createNotification,
  listAllNotifications,
} from "../controllers/notificationController.js";
import { handleValidation } from "../middleware/validate.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/my", requireAuth, listMyNotifications);
router.patch("/:id/read", requireAuth, markNotificationRead);
router.patch("/read-all", requireAuth, markAllNotificationsRead);

// Admin
router.get("/", requireAuth, requireRole("admin"), listAllNotifications);
router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  [
    body("title").trim().notEmpty().withMessage("Title is required."),
    body("message").trim().notEmpty().withMessage("Message is required."),
  ],
  handleValidation,
  createNotification
);

export default router;
