import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional, for guest submissions
    name: { type: String, required: true, trim: true },
    role: { type: String, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    quote: { type: String, required: true, trim: true },
    imageUrl: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

testimonialSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Testimonial", testimonialSchema);
