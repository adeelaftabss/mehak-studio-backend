import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getSettings);
router.patch("/", requireAuth, requireRole("admin"), updateSettings);

export default router;
