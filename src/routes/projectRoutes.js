import express from "express";
import { body } from "express-validator";
import {
  submitProject,
  listMyProjects,
  listAllProjects,
  updateProjectStatus,
} from "../controllers/projectController.js";
import { handleValidation } from "../middleware/validate.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { createUploader } from "../middleware/upload.js";

const router = express.Router();
const uploadProjectFiles = createUploader("projects", { maxFiles: 5 });

router.post(
  "/",
  requireAuth,
  uploadProjectFiles.array("files", 5),
  [
    body("serviceType").trim().notEmpty().withMessage("Service type is required."),
    body("details").trim().notEmpty().withMessage("Project details are required."),
  ],
  handleValidation,
  submitProject
);

router.get("/my", requireAuth, listMyProjects);

// Admin
router.get("/", requireAuth, requireRole("admin"), listAllProjects);
router.patch("/:id/status", requireAuth, requireRole("admin"), updateProjectStatus);

export default router;
