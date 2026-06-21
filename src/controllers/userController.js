import User from "../models/User.js";
import { ApiError } from "../middleware/errorHandler.js";

// Self-service: logged-in user updates their own profile
export async function updateMyProfile(req, res, next) {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { ...(name && { name }), ...(phone !== undefined && { phone }) },
      { new: true }
    );
    res.json({ message: "Profile updated.", user });
  } catch (err) {
    next(err);
  }
}

// Admin: list/manage all users
export async function listUsers(req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

export async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, "User not found.");
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req, res, next) {
  try {
    const { name, email, phone, role, status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(role && { role }),
        ...(status && { status }),
      },
      { new: true }
    );
    if (!user) throw new ApiError(404, "User not found.");
    res.json({ message: "User updated.", user });
  } catch (err) {
    next(err);
  }
}

export async function suspendUser(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "suspended" },
      { new: true }
    );
    if (!user) throw new ApiError(404, "User not found.");
    res.json({ message: "User suspended.", user });
  } catch (err) {
    next(err);
  }
}

export async function reactivateUser(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: "active" }, { new: true });
    if (!user) throw new ApiError(404, "User not found.");
    res.json({ message: "User reactivated.", user });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      throw new ApiError(400, "You cannot delete your own account from here.");
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw new ApiError(404, "User not found.");
    res.json({ message: "User deleted." });
  } catch (err) {
    next(err);
  }
}
