import express from "express";
import {
  updateMyProfile,
  listUsers,
  getUser,
  updateUser,
  suspendUser,
  reactivateUser,
  deleteUser,
} from "../controllers/userController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.patch("/me", requireAuth, updateMyProfile);

// Admin
router.get("/", requireAuth, requireRole("admin"), listUsers);
router.get("/:id", requireAuth, requireRole("admin"), getUser);
router.patch("/:id", requireAuth, requireRole("admin"), updateUser);
router.patch("/:id/suspend", requireAuth, requireRole("admin"), suspendUser);
router.patch("/:id/reactivate", requireAuth, requireRole("admin"), reactivateUser);
router.delete("/:id", requireAuth, requireRole("admin"), deleteUser);

export default router;
