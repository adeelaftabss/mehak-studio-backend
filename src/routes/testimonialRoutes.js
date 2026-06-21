import express from "express";
import { body } from "express-validator";
import {
  submitTestimonial,
  listApprovedTestimonials,
  listAllTestimonials,
  moderateTestimonial,
} from "../controllers/testimonialController.js";
import { handleValidation } from "../middleware/validate.js";
import { requireAuth, requireRole, optionalAuth } from "../middleware/auth.js";
import { createUploader } from "../middleware/upload.js";

const router = express.Router();
const uploadTestimonialImage = createUploader("testimonials", { maxFiles: 1 });

router.get("/", listApprovedTestimonials);

router.post(
  "/",
  optionalAuth,
  uploadTestimonialImage.single("image"),
  [
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5."),
    body("quote").trim().notEmpty().withMessage("Review text is required."),
  ],
  handleValidation,
  submitTestimonial
);

// Admin
router.get("/all", requireAuth, requireRole("admin"), listAllTestimonials);
router.patch(
  "/:id/moderate",
  requireAuth,
  requireRole("admin"),
  [body("status").isIn(["approved", "rejected"]).withMessage("Status must be approved or rejected.")],
  handleValidation,
  moderateTestimonial
);

export default router;
