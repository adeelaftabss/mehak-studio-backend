import Complaint from "../models/Complaint.js";
import Notification from "../models/Notification.js";
import { sendEmail, emailTemplates } from "../utils/email.js";
import { ApiError } from "../middleware/errorHandler.js";

export async function submitComplaint(req, res, next) {
  try {
    const { name, email, subject, message, relatedProject } = req.body;

    const complaint = await Complaint.create({
      user: req.user?._id,
      name,
      email,
      subject,
      message,
      relatedProject: relatedProject || undefined,
    });

    await Notification.create({
      title: "New Complaint Submitted",
      message: `${name}: "${subject}"`,
      type: "warning",
    });

    await sendEmail({
      to: process.env.NOTIFY_EMAIL,
      subject: `New Complaint: ${subject}`,
      html: emailTemplates.complaintAdmin({ name, email, subject, message }),
    });

    res.status(201).json({
      message: "Your complaint has been received and will be reviewed shortly.",
      complaint,
    });
  } catch (err) {
    next(err);
  }
}

export async function listComplaints(req, res, next) {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const complaints = await Complaint.find(filter)
      .populate("user", "name email")
      .populate("relatedProject", "serviceType")
      .sort({ createdAt: -1 });
    res.json({ complaints });
  } catch (err) {
    next(err);
  }
}

export async function updateComplaintStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { ...(status && { status }), ...(resolutionNotes !== undefined && { resolutionNotes }) },
      { new: true }
    );

    if (!complaint) {
      throw new ApiError(404, "Complaint not found.");
    }

    res.json({ message: "Complaint updated.", complaint });
  } catch (err) {
    next(err);
  }
}
