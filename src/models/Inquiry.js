import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["new", "replied", "archived"],
      default: "new",
    },
    adminReply: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Inquiry", inquirySchema);
