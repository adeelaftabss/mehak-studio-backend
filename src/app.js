import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import inquiryRoutes from "./routes/inquiryRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import portfolioRoutes from "./routes/portfolioRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";

import { notFound, errorHandler } from "./middleware/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Security headers. Cross-origin resource policy is relaxed for
// /uploads and /portfolio-content so the frontend (on a different
// origin/port) can render images and files served from here.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

// General API rate limit (separate, stricter limits apply to auth routes)
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Static file serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  "/portfolio-content",
  express.static(
    process.env.PORTFOLIO_CONTENT_PATH || path.join(__dirname, "..", "portfolio-content")
  )
);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/settings", settingsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
