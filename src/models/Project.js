import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    serviceType: { type: String, required: true, trim: true },
    details: { type: String, required: true, trim: true },
    deadline: { type: Date },
    budget: { type: String, trim: true },
    files: [
      {
        url: String,
        originalName: String,
        mimeType: String,
        size: Number,
      },
    ],
    status: {
      type: String,
      enum: ["Submitted", "In Progress", "Awaiting Feedback", "Completed", "Cancelled"],
      default: "Submitted",
    },
    adminNotes: { type: String, trim: true },
  },
  { timestamps: true }
);

projectSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Project", projectSchema);
