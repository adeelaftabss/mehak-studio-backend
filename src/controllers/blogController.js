import Blog from "../models/Blog.js";
import { ApiError } from "../middleware/errorHandler.js";

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export async function listPublicBlogs(req, res, next) {
  try {
    const { category } = req.query;
    const filter = { isPublished: true, ...(category && category !== "All" && { category }) };
    const blogs = await Blog.find(filter).sort({ publishedAt: -1 });
    res.json({ blogs });
  } catch (err) {
    next(err);
  }
}

export async function getBlogBySlug(req, res, next) {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true });
    if (!blog) throw new ApiError(404, "Article not found.");
    res.json({ blog });
  } catch (err) {
    next(err);
  }
}

// Admin
export async function listAllBlogs(req, res, next) {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json({ blogs });
  } catch (err) {
    next(err);
  }
}

export async function createBlog(req, res, next) {
  try {
    const payload = { ...req.body, author: req.user._id };
    if (!payload.slug) payload.slug = slugify(payload.title);
    if (payload.isPublished && !payload.publishedAt) payload.publishedAt = new Date();

    const blog = await Blog.create(payload);
    res.status(201).json({ message: "Blog post created.", blog });
  } catch (err) {
    next(err);
  }
}

export async function updateBlog(req, res, next) {
  try {
    const payload = { ...req.body };
    if (payload.isPublished) {
      const existing = await Blog.findById(req.params.id);
      if (existing && !existing.publishedAt) payload.publishedAt = new Date();
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!blog) throw new ApiError(404, "Blog post not found.");
    res.json({ message: "Blog post updated.", blog });
  } catch (err) {
    next(err);
  }
}

export async function deleteBlog(req, res, next) {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) throw new ApiError(404, "Blog post not found.");
    res.json({ message: "Blog post deleted." });
  } catch (err) {
    next(err);
  }
}
