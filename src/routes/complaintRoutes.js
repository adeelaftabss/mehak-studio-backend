import express from "express";
import { body } from "express-validator";
import {
  submitComplaint,
  listComplaints,
  updateComplaintStatus,
} from "../controllers/complaintController.js";
import { handleValidation } from "../middleware/validate.js";
import { requireAuth, requireRole, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

router.post(
  "/",
  optionalAuth,
  [
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("email").isEmail().withMessage("A valid email is required.").normalizeEmail(),
    body("subject").trim().notEmpty().withMessage("Subject is required."),
    body("message").trim().notEmpty().withMessage("Message is required."),
  ],
  handleValidation,
  submitComplaint
);

// Admin
router.get("/", requireAuth, requireRole("admin"), listComplaints);
router.patch("/:id/status", requireAuth, requireRole("admin"), updateComplaintStatus);

export default router;
