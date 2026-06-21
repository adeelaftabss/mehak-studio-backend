import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema(
  {
    heading: { type: String, required: true, trim: true },
    paragraphs: [{ type: String, trim: true }],
  },
  { _id: false }
);

const blogSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    excerpt: { type: String, required: true, trim: true },
    sections: [sectionSchema],
    coverImageUrl: { type: String },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    readTime: { type: String, default: "4 min read" },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    seo: {
      metaTitle: { type: String, trim: true },
      metaDescription: { type: String, trim: true },
    },
  },
  { timestamps: true }
);

blogSchema.index({ isPublished: 1, publishedAt: -1 });

export default mongoose.model("Blog", blogSchema);
