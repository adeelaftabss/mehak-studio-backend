import Feedback from "../models/Feedback.js";
import Notification from "../models/Notification.js";
import { sendEmail, emailTemplates } from "../utils/email.js";
import { toPublicUrl } from "../middleware/upload.js";
import { ApiError } from "../middleware/errorHandler.js";

export async function submitFeedback(req, res, next) {
  try {
    const { type, message, rating } = req.body;
    const images = (req.files || []).map((f) => toPublicUrl("feedback", f.filename));

    const feedback = await Feedback.create({
      user: req.user?._id,
      type,
      message,
      rating: rating || undefined,
      images,
    });

    await Notification.create({
      title: `New ${type}`,
      message: message.slice(0, 100),
      type: "info",
    });

    await sendEmail({
      to: process.env.NOTIFY_EMAIL,
      subject: `New ${type} Submitted`,
      html: emailTemplates.feedbackAdmin({ type, message, rating }),
    });

    res.status(201).json({ message: "Thanks for your feedback.", feedback });
  } catch (err) {
    next(err);
  }
}

export async function listFeedback(req, res, next) {
  try {
    const { type, status } = req.query;
    const filter = { ...(type && { type }), ...(status && { status }) };
    const feedback = await Feedback.find(filter).populate("user", "name email").sort({ createdAt: -1 });
    res.json({ feedback });
  } catch (err) {
    next(err);
  }
}

export async function replyFeedback(req, res, next) {
  try {
    const { id } = req.params;
    const { adminReply } = req.body;

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { adminReply, status: "replied" },
      { new: true }
    ).populate("user", "name email");

    if (!feedback) {
      throw new ApiError(404, "Feedback not found.");
    }

    if (feedback.user?.email) {
      await sendEmail({
        to: feedback.user.email,
        subject: "Response to your feedback — Mehak Studio",
        html: `<p>Hi ${feedback.user.name},</p><p>${adminReply}</p>`,
      });
    }

    res.json({ message: "Reply sent.", feedback });
  } catch (err) {
    next(err);
  }
}
