# Mehak Studio — Backend API

Express + MongoDB backend for the Mehak Career & Creative Studio website.
Covers authentication, project requests, contact/feedback/complaints,
testimonials, portfolio (including the auto-scan folder system), blog,
services, announcements, notifications, and site-wide settings.

## Tech stack

Express 5 · Mongoose 9 · JWT (httpOnly cookies) · bcryptjs · Multer (file
uploads) · Nodemailer · express-validator · helmet · express-rate-limit

## ⚠️ Important: testing status

This backend was built and tested as thoroughly as possible **without a
live MongoDB connection**, because the sandbox this was built in has no
network access to download or install MongoDB. Specifically, what *was*
verified:

- Every file imports/parses correctly under Node (no syntax or module
  errors anywhere in models, controllers, routes, middleware).
- The full Express app boots cleanly with all routes registered.
- Real HTTP requests were sent to running endpoints and confirmed: the
  health check, the 404 handler, express-validator rejecting bad input on
  `/api/auth/register` and `/api/inquiries` with correct error messages,
  and the auth/admin guards correctly returning 401 on protected routes
  without a token.
- JWT signing and verification tested directly (sign → verify round-trip).
- Password hashing tested directly with bcryptjs (correct password
  matches, wrong password is rejected).
- The portfolio auto-scan logic (folder scanning, category mapping, file
  type detection, title generation, skipping unsupported files/folders)
  was extracted and run against a real temporary folder structure with
  9 test files — confirmed it correctly imports 8 valid files with the
  right categories/titles and skips the unsupported one plus the
  unmapped folder.

**What was *not* tested**: actual reads/writes against a real MongoDB
database (registering a real user, submitting a real project request end
to end, etc.), since no MongoDB instance was available. Before you rely on
this in production, please run through the manual testing checklist below
once you have it connected to a real database — it shouldn't take more
than 15–20 minutes and will catch anything specific to your environment.

## Setup

> **Deploying to production?** See `DEPLOYMENT.md` in the frontend
> (`mehak-studio`) repo for a full step-by-step guide covering MongoDB
> Atlas, Render (for this backend), and Vercel (for the frontend).


1. **Get a MongoDB database.** Easiest option: a free
   [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster.
   Or run MongoDB locally if you have it installed.
2. Copy `.env.example` to `.env` and fill in:
   - `MONGODB_URI` — your connection string
   - `JWT_SECRET` — any long random string (e.g. generate with
     `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — used once by the seed script to
     create your first admin login
   - `SMTP_USER` / `SMTP_PASSWORD` — for email notifications (a Gmail
     [App Password](https://support.google.com/accounts/answer/185833)
     works well; regular Gmail passwords won't work here)
3. Install dependencies:
   ```bash
   npm install
   ```
4. Seed the database (creates your admin user, default settings, and all
   21 services):
   ```bash
   npm run seed
   ```
5. Start the server:
   ```bash
   npm run dev    # with auto-restart (nodemon)
   # or
   npm start      # plain node
   ```
   The API runs on `http://localhost:5000` by default.

## Manual testing checklist (do this once connected to a real database)

- [ ] `GET /api/health` returns `{ status: "ok" }`
- [ ] `npm run seed` runs without errors and creates the admin user
- [ ] `POST /api/auth/register` creates a user and sets a login cookie
- [ ] `POST /api/auth/login` with the seeded admin credentials logs in
- [ ] `GET /api/auth/me` (with the cookie) returns the logged-in user
- [ ] `POST /api/inquiries` (contact form) creates an inquiry and — if SMTP
      is configured — sends both the admin notification and the user
      confirmation email
- [ ] `POST /api/projects` (as a logged-in user, with a file attached)
      creates a project and stores the file under `src/uploads/projects/`
- [ ] `GET /api/projects/my` returns that user's own projects only
- [ ] As the admin: `GET /api/projects` returns all projects;
      `PATCH /api/projects/:id/status` updates status and emails the user
- [ ] Drop a test image into `portfolio-content/logos/`, then call
      `POST /api/portfolio/scan` as admin — confirm it appears via
      `GET /api/portfolio`
- [ ] `POST /api/testimonials` creates a pending testimonial;
      `PATCH /api/testimonials/:id/moderate` (admin) approves it; it then
      appears via `GET /api/testimonials` (public)

## Folder structure

```
src/
  config/db.js          MongoDB connection
  models/                12 Mongoose schemas (User, Project, Portfolio, ...)
  controllers/            Business logic per resource
  routes/                 Express routers per resource
  middleware/             auth (JWT), error handling, validation, file upload
  utils/
    jwt.js                Token signing + cookie helpers
    email.js              Nodemailer wrapper + HTML email templates
    seed.js               One-time setup script (npm run seed)
  uploads/                User-submitted files (projects, feedback, etc.)
  app.js                  Express app: middleware + route wiring
  server.js               Entry point: connects DB, starts listening
portfolio-content/        Drop files here for the portfolio auto-scan system
  logos/ branding/ social-media/ resumes/ printing/ ads/ photo-editing/ ai-content/
```

## How the portfolio auto-scan system works

This implements the spec's requirement: *"Whenever admin uploads content
inside folders: Website automatically displays Images, Videos, PDFs...
without modifying code."*

1. Drop a file into the matching subfolder under `portfolio-content/` (e.g.
   a logo PNG into `portfolio-content/logos/`).
2. Call `POST /api/portfolio/scan` (as an admin — this can be wired to a
   button in the admin panel, or to a scheduled cron job for fully
   hands-off updates).
3. The scanner reads every subfolder, maps it to a portfolio category
   (`logos`/`branding` → "Logos & Branding", `social-media` → "Social
   Media", etc.), detects the file type (image/video/PDF) from its
   extension, generates a human-readable title from the filename (e.g.
   `client-logo-final.png` → "Client Logo Final"), and creates a
   `Portfolio` document — skipping anything already imported (so it's safe
   to re-run) and anything with an unsupported extension or in an
   unmapped folder.
4. The file becomes visible at `GET /api/portfolio` and is served directly
   from `/portfolio-content/...` via the static file route in `app.js`.

Supported extensions: `.png .jpg .jpeg .webp` (image), `.mp4` (video),
`.pdf` (document/case study).

## API overview

All routes are prefixed with `/api`. Routes marked **(admin)** require a
logged-in user with `role: "admin"`.

| Resource | Routes |
|---|---|
| Auth | `POST /auth/register`, `/login`, `/logout`, `GET /auth/me`, `POST /auth/forgot-password`, `/reset-password`, `/change-password` |
| Users | `PATCH /users/me` (self), `GET/PATCH/DELETE /users/:id` **(admin)**, `PATCH /users/:id/suspend`\|`reactivate` **(admin)** |
| Inquiries (contact form) | `POST /inquiries`, `GET /inquiries` **(admin)**, `PATCH /inquiries/:id/reply` **(admin)** |
| Projects | `POST /projects` (auth, with file upload), `GET /projects/my` (auth), `GET /projects` **(admin)**, `PATCH /projects/:id/status` **(admin)** |
| Feedback | `POST /feedback`, `GET /feedback` **(admin)**, `PATCH /feedback/:id/reply` **(admin)** |
| Complaints | `POST /complaints`, `GET /complaints` **(admin)**, `PATCH /complaints/:id/status` **(admin)** |
| Testimonials | `GET /testimonials` (approved only), `POST /testimonials`, `GET /testimonials/all` **(admin)**, `PATCH /testimonials/:id/moderate` **(admin)** |
| Portfolio | `GET /portfolio`, `POST /portfolio/scan` **(admin)**, `POST /portfolio/upload` **(admin)**, `PATCH/DELETE /portfolio/:id` **(admin)** |
| Blog | `GET /blogs`, `GET /blogs/:slug`, `POST /blogs` **(admin)**, `PATCH/DELETE /blogs/:id` **(admin)** |
| Services | `GET /services`, `GET /services/:slug`, `POST /services` **(admin)**, `PATCH/DELETE /services/:id` **(admin)** |
| Announcements | `GET /announcements`, `POST /announcements` **(admin)**, `PATCH/DELETE /announcements/:id` **(admin)** |
| Notifications | `GET /notifications/my` (auth), `PATCH /notifications/:id/read`, `GET /notifications` **(admin)**, `POST /notifications` **(admin)** |
| Settings | `GET /settings`, `PATCH /settings` **(admin)** |

## Security notes

- Passwords are hashed with bcrypt (12 rounds) and never returned in API
  responses.
- Auth uses httpOnly cookies (not readable by JS), with `secure: true` and
  `sameSite: "none"` automatically applied in production.
- Rate limiting: 300 req/15min generally, 20 req/15min on auth endpoints.
- `helmet` sets standard security headers.
- File uploads are restricted by extension + MIME type and capped at 15MB
  (configurable via `MAX_FILE_SIZE_MB`).
- All admin-only routes are protected by both `requireAuth` and
  `requireRole("admin")` — never just one.

## Connecting the frontend

The frontend's `ContactForm.jsx`, `DashboardSubmit.jsx`, `Login.jsx`,
`Register.jsx`, and `ForgotPassword.jsx` all have `// TODO (Phase 3)`
comments marking exactly where to swap the simulated submit handlers for
real `fetch`/`axios` calls to these endpoints. Set
`credentials: "include"` on those requests so the auth cookie is sent.
