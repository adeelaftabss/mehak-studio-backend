import express from "express";
import { body } from "express-validator";
import { submitFeedback, listFeedback, replyFeedback } from "../controllers/feedbackController.js";
import { handleValidation } from "../middleware/validate.js";
import { requireAuth, requireRole, optionalAuth } from "../middleware/auth.js";
import { createUploader } from "../middleware/upload.js";

const router = express.Router();
const uploadFeedbackImages = createUploader("feedback", { maxFiles: 3 });

router.post(
  "/",
  optionalAuth,
  uploadFeedbackImages.array("images", 3),
  [
    body("type")
      .isIn(["Suggestion", "Compliment", "Complaint", "Experience Review"])
      .withMessage("Invalid feedback type."),
    body("message").trim().notEmpty().withMessage("Message is required."),
  ],
  handleValidation,
  submitFeedback
);

// Admin
router.get("/", requireAuth, requireRole("admin"), listFeedback);
router.patch(
  "/:id/reply",
  requireAuth,
  requireRole("admin"),
  [body("adminReply").trim().notEmpty().withMessage("Reply message is required.")],
  handleValidation,
  replyFeedback
);

export default router;
