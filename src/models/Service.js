import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        "Creative & Design",
        "Printing Solutions",
        "Career & Professional",
        "Digital Marketing",
        "Documentation & Composing",
        "Online Assistance",
        "Technology Solutions",
        "Photo & Media",
      ],
    },
    short: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    highlights: [{ type: String, trim: true }],
    icon: { type: String, default: "Sparkles" },
    priceFrom: { type: Number },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Service", serviceSchema);
