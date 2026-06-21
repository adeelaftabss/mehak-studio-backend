import Announcement from "../models/Announcement.js";
import { ApiError } from "../middleware/errorHandler.js";

// Public: active announcements, optionally filtered by where they should display
export async function listActiveAnnouncements(req, res, next) {
  try {
    const { placement } = req.query; // "homepage" | "notificationBar" | "dashboard"
    const now = new Date();

    const filter = {
      isActive: true,
      startsAt: { $lte: now },
      $or: [{ endsAt: null }, { endsAt: { $exists: false } }, { endsAt: { $gte: now } }],
      ...(placement && { [`displayOn.${placement}`]: true }),
    };

    const announcements = await Announcement.find(filter).sort({ createdAt: -1 });
    res.json({ announcements });
  } catch (err) {
    next(err);
  }
}

// Admin
export async function listAllAnnouncements(req, res, next) {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json({ announcements });
  } catch (err) {
    next(err);
  }
}

export async function createAnnouncement(req, res, next) {
  try {
    const announcement = await Announcement.create(req.body);
    res.status(201).json({ message: "Announcement created.", announcement });
  } catch (err) {
    next(err);
  }
}

export async function updateAnnouncement(req, res, next) {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!announcement) throw new ApiError(404, "Announcement not found.");
    res.json({ message: "Announcement updated.", announcement });
  } catch (err) {
    next(err);
  }
}

export async function deleteAnnouncement(req, res, next) {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) throw new ApiError(404, "Announcement not found.");
    res.json({ message: "Announcement deleted." });
  } catch (err) {
    next(err);
  }
}
