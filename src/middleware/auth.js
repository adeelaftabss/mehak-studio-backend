import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Verifies the JWT and attaches the authenticated user to req.user.
// Looks for the token in the auth cookie first, then falls back to
// an Authorization: Bearer header (useful for non-browser API clients).
export async function requireAuth(req, res, next) {
  try {
    const cookieName = process.env.JWT_COOKIE_NAME || "mehak_token";
    let token = req.cookies?.[cookieName];

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authenticated. Please log in." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User no longer exists." });
    }
    if (user.status === "suspended") {
      return res.status(403).json({ message: "Your account has been suspended." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired session. Please log in again." });
  }
}

// Restricts a route to one or more roles. Use after requireAuth.
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to do this." });
    }
    next();
  };
}

// Attaches req.user if a valid token is present, but doesn't block the
// request if there isn't one. Useful for routes usable by guests or users.
export async function optionalAuth(req, res, next) {
  try {
    const cookieName = process.env.JWT_COOKIE_NAME || "mehak_token";
    const token = req.cookies?.[cookieName];
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user && user.status !== "suspended") {
      req.user = user;
    }
    next();
  } catch {
    next();
  }
}
