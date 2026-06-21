import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: ["Suggestion", "Compliment", "Complaint", "Experience Review"],
      required: true,
    },
    message: { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5 },
    images: [{ type: String }],
    status: {
      type: String,
      enum: ["new", "reviewed", "replied"],
      default: "new",
    },
    adminReply: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);
