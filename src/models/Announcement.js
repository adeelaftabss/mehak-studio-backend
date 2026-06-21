import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["Promotion", "Offer", "News", "Service Update"],
      default: "News",
    },
    displayOn: {
      homepage: { type: Boolean, default: true },
      notificationBar: { type: Boolean, default: false },
      dashboard: { type: Boolean, default: false },
    },
    isActive: { type: Boolean, default: true },
    startsAt: { type: Date, default: Date.now },
    endsAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Announcement", announcementSchema);
