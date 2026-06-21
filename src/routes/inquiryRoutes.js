import express from "express";
import { body } from "express-validator";
import { submitInquiry, listInquiries, replyInquiry } from "../controllers/inquiryController.js";
import { handleValidation } from "../middleware/validate.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("email").isEmail().withMessage("A valid email is required.").normalizeEmail(),
    body("subject").trim().notEmpty().withMessage("Subject is required."),
    body("message").trim().notEmpty().withMessage("Message is required."),
  ],
  handleValidation,
  submitInquiry
);

// Admin-only
router.get("/", requireAuth, requireRole("admin"), listInquiries);
router.patch(
  "/:id/reply",
  requireAuth,
  requireRole("admin"),
  [body("adminReply").trim().notEmpty().withMessage("Reply message is required.")],
  handleValidation,
  replyInquiry
);

export default router;
