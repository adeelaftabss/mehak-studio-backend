import Inquiry from "../models/Inquiry.js";
import Notification from "../models/Notification.js";
import { sendEmail, emailTemplates } from "../utils/email.js";

export async function submitInquiry(req, res, next) {
  try {
    const { name, email, phone, subject, message } = req.body;

    const inquiry = await Inquiry.create({ name, email, phone, subject, message });

    // Notify admin in-app
    await Notification.create({
      title: "New Contact Form Submission",
      message: `${name} sent a message: "${subject}"`,
      type: "info",
    });

    // Email admin + confirmation to the user (best-effort; errors are logged, not thrown)
    await Promise.all([
      sendEmail({
        to: process.env.NOTIFY_EMAIL,
        subject: `New Contact Form: ${subject}`,
        html: emailTemplates.contactFormAdmin({ name, email, phone, subject, message }),
      }),
      sendEmail({
        to: email,
        subject: "We've received your message — Mehak Studio",
        html: emailTemplates.contactFormUser({ name, message }),
      }),
    ]);

    res.status(201).json({ message: "Thanks for reaching out — we'll get back to you shortly.", inquiry });
  } catch (err) {
    next(err);
  }
}

export async function listInquiries(req, res, next) {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const inquiries = await Inquiry.find(filter).sort({ createdAt: -1 });
    res.json({ inquiries });
  } catch (err) {
    next(err);
  }
}

export async function replyInquiry(req, res, next) {
  try {
    const { id } = req.params;
    const { adminReply } = req.body;

    const inquiry = await Inquiry.findByIdAndUpdate(
      id,
      { adminReply, status: "replied" },
      { new: true }
    );

    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found." });
    }

    await sendEmail({
      to: inquiry.email,
      subject: `Re: ${inquiry.subject}`,
      html: `<p>Hi ${inquiry.name},</p><p>${adminReply}</p>`,
    });

    res.json({ message: "Reply sent.", inquiry });
  } catch (err) {
    next(err);
  }
}
