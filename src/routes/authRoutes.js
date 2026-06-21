import express from "express";
import { body } from "express-validator";
import rateLimit from "express-rate-limit";
import {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
} from "../controllers/authController.js";
import { handleValidation } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Stricter rate limit on auth endpoints to slow down brute-force attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again later." },
});

router.post(
  "/register",
  authLimiter,
  [
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("email").isEmail().withMessage("A valid email is required.").normalizeEmail(),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
  ],
  handleValidation,
  register
);

router.post(
  "/login",
  authLimiter,
  [
    body("email").isEmail().withMessage("A valid email is required.").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  handleValidation,
  login
);

router.post("/logout", logout);
router.get("/me", requireAuth, getMe);

router.post(
  "/forgot-password",
  authLimiter,
  [body("email").isEmail().withMessage("A valid email is required.").normalizeEmail()],
  handleValidation,
  forgotPassword
);

router.post(
  "/reset-password",
  authLimiter,
  [
    body("token").notEmpty().withMessage("Reset token is required."),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
  ],
  handleValidation,
  resetPassword
);

router.post(
  "/change-password",
  requireAuth,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required."),
    body("newPassword").isLength({ min: 8 }).withMessage("New password must be at least 8 characters."),
  ],
  handleValidation,
  changePassword
);

export default router;
