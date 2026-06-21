import express from "express";
import {
  listServices,
  getServiceBySlug,
  createService,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/", listServices);
router.get("/:slug", getServiceBySlug);

// Admin
router.post("/", requireAuth, requireRole("admin"), createService);
router.patch("/:id", requireAuth, requireRole("admin"), updateService);
router.delete("/:id", requireAuth, requireRole("admin"), deleteService);

export default router;
