import Notification from "../models/Notification.js";
import { ApiError } from "../middleware/errorHandler.js";

// Logged-in user: their own notifications + any broadcast (user: null) ones
export async function listMyNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({
      $or: [{ user: req.user._id }, { user: null }],
    })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = notifications.filter((n) => !n.isRead).length;
    res.json({ notifications, unreadCount });
  } catch (err) {
    next(err);
  }
}

export async function markNotificationRead(req, res, next) {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) throw new ApiError(404, "Notification not found.");
    res.json({ notification });
  } catch (err) {
    next(err);
  }
}

export async function markAllNotificationsRead(req, res, next) {
  try {
    await Notification.updateMany(
      { $or: [{ user: req.user._id }, { user: null }], isRead: false },
      { isRead: true }
    );
    res.json({ message: "All notifications marked as read." });
  } catch (err) {
    next(err);
  }
}

// Admin: broadcast a notification to all users, or create an announcement-style entry
export async function createNotification(req, res, next) {
  try {
    const { title, message, type, user } = req.body;
    const notification = await Notification.create({
      title,
      message,
      type: type || "info",
      user: user || undefined, // omit for a broadcast to all users
    });
    res.status(201).json({ message: "Notification created.", notification });
  } catch (err) {
    next(err);
  }
}

// Admin: view all notifications (e.g. the activity/notification log)
export async function listAllNotifications(req, res, next) {
  try {
    const notifications = await Notification.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ notifications });
  } catch (err) {
    next(err);
  }
}
