import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        "Logos & Branding",
        "Social Media",
        "Resumes & CVs",
        "Printing",
        "Ads & Marketing",
        "Photo Editing",
        "AI Content",
      ],
    },
    description: { type: String, trim: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, enum: ["image", "video", "pdf"], default: "image" },
    thumbnailUrl: { type: String },
    sourceFolder: { type: String, trim: true }, // populated by the folder auto-scan system
    isPublished: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

portfolioSchema.index({ category: 1, sortOrder: 1 });

export default mongoose.model("Portfolio", portfolioSchema);
