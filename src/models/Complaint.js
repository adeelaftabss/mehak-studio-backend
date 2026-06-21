import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    relatedProject: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["open", "investigating", "resolved", "closed"],
      default: "open",
    },
    resolutionNotes: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Complaint", complaintSchema);
