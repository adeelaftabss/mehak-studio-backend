import Testimonial from "../models/Testimonial.js";
import Notification from "../models/Notification.js";
import { sendEmail, emailTemplates } from "../utils/email.js";
import { toPublicUrl } from "../middleware/upload.js";
import { ApiError } from "../middleware/errorHandler.js";

export async function submitTestimonial(req, res, next) {
  try {
    const { name, role, rating, quote } = req.body;
    const imageUrl = req.file ? toPublicUrl("testimonials", req.file.filename) : undefined;

    const testimonial = await Testimonial.create({
      user: req.user?._id,
      name,
      role,
      rating,
      quote,
      imageUrl,
    });

    await Notification.create({
      title: "New Testimonial Submitted",
      message: `${name} left a ${rating}-star review, pending approval.`,
      type: "info",
    });

    await sendEmail({
      to: process.env.NOTIFY_EMAIL,
      subject: "New Testimonial Pending Review",
      html: emailTemplates.testimonialAdmin({ name, rating, quote }),
    });

    res.status(201).json({
      message: "Thanks for your review! It will appear on the site once approved.",
      testimonial,
    });
  } catch (err) {
    next(err);
  }
}

// Public: only approved testimonials
export async function listApprovedTestimonials(req, res, next) {
  try {
    const testimonials = await Testimonial.find({ status: "approved" }).sort({ createdAt: -1 });
    res.json({ testimonials });
  } catch (err) {
    next(err);
  }
}

// Admin: all testimonials, any status
export async function listAllTestimonials(req, res, next) {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const testimonials = await Testimonial.find(filter).sort({ createdAt: -1 });
    res.json({ testimonials });
  } catch (err) {
    next(err);
  }
}

export async function moderateTestimonial(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body; // "approved" | "rejected"

    const testimonial = await Testimonial.findByIdAndUpdate(id, { status }, { new: true });
    if (!testimonial) {
      throw new ApiError(404, "Testimonial not found.");
    }

    res.json({ message: `Testimonial ${status}.`, testimonial });
  } catch (err) {
    next(err);
  }
}
