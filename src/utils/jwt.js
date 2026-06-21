import jwt from "jsonwebtoken";

export function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// Sets the auth token as an httpOnly cookie on the response.
export function sendTokenCookie(res, token) {
  const cookieName = process.env.JWT_COOKIE_NAME || "mehak_token";
  const isProd = process.env.NODE_ENV === "production";

  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

export function clearTokenCookie(res) {
  const cookieName = process.env.JWT_COOKIE_NAME || "mehak_token";
  res.clearCookie(cookieName);
}
