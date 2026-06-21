import crypto from "crypto";
import User from "../models/User.js";
import { signToken, sendTokenCookie, clearTokenCookie } from "../utils/jwt.js";
import { sendEmail, emailTemplates } from "../utils/email.js";
import { ApiError } from "../middleware/errorHandler.js";

export async function register(req, res, next) {
  try {
    const { name, email, phone, password } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new ApiError(409, "An account with this email already exists.");
    }

    const user = await User.create({ name, email, phone, password });
    const token = signToken(user._id);
    sendTokenCookie(res, token);

    res.status(201).json({ message: "Account created successfully.", user });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, "Incorrect email or password.");
    }
    if (user.status === "suspended") {
      throw new ApiError(403, "Your account has been suspended. Contact support for help.");
    }

    const token = signToken(user._id);
    sendTokenCookie(res, token);

    res.json({ message: "Logged in successfully.", user });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  clearTokenCookie(res);
  res.json({ message: "Logged out successfully." });
}

export async function getMe(req, res) {
  res.json({ user: req.user });
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always respond with the same message, whether or not the account
    // exists — this avoids leaking which emails are registered.
    const genericResponse = {
      message: "If an account exists for that email, reset instructions have been sent.",
    };

    if (!user) return res.json(genericResponse);

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: "Reset your Mehak Studio password",
      html: emailTemplates.passwordReset({ name: user.name, resetUrl }),
    });

    res.json(genericResponse);
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      throw new ApiError(400, "This reset link is invalid or has expired.");
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const newToken = signToken(user._id);
    sendTokenCookie(res, newToken);

    res.json({ message: "Password reset successfully.", user });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    if (!(await user.comparePassword(currentPassword))) {
      throw new ApiError(401, "Current password is incorrect.");
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    next(err);
  }
}
