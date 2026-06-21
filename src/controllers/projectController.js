import Project from "../models/Project.js";
import Notification from "../models/Notification.js";
import { sendEmail, emailTemplates } from "../utils/email.js";
import { toPublicUrl } from "../middleware/upload.js";
import { ApiError } from "../middleware/errorHandler.js";

export async function submitProject(req, res, next) {
  try {
    const { serviceType, details, deadline, budget } = req.body;

    const files = (req.files || []).map((f) => ({
      url: toPublicUrl("projects", f.filename),
      originalName: f.originalname,
      mimeType: f.mimetype,
      size: f.size,
    }));

    const project = await Project.create({
      user: req.user._id,
      serviceType,
      details,
      deadline: deadline || undefined,
      budget,
      files,
    });

    await Notification.create({
      title: "New Project Request",
      message: `${req.user.name} submitted a request for ${serviceType}`,
      type: "info",
      relatedProject: project._id,
    });

    await Promise.all([
      sendEmail({
        to: process.env.NOTIFY_EMAIL,
        subject: `New Project Request: ${serviceType}`,
        html: emailTemplates.projectRequestAdmin({
          userName: req.user.name,
          userEmail: req.user.email,
          serviceType,
          deadline,
          budget,
          details,
        }),
      }),
      sendEmail({
        to: req.user.email,
        subject: "Your project request has been received",
        html: emailTemplates.projectRequestUser({ userName: req.user.name, serviceType }),
      }),
    ]);

    res.status(201).json({ message: "Project request submitted.", project });
  } catch (err) {
    next(err);
  }
}

// Logged-in user: their own requests
export async function listMyProjects(req, res, next) {
  try {
    const projects = await Project.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ projects });
  } catch (err) {
    next(err);
  }
}

// Admin: all requests, optionally filtered by status
export async function listAllProjects(req, res, next) {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const projects = await Project.find(filter)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
    res.json({ projects });
  } catch (err) {
    next(err);
  }
}

export async function updateProjectStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const project = await Project.findByIdAndUpdate(
      id,
      { ...(status && { status }), ...(adminNotes !== undefined && { adminNotes }) },
      { new: true }
    ).populate("user", "name email");

    if (!project) {
      throw new ApiError(404, "Project not found.");
    }

    await Notification.create({
      user: project.user._id,
      title: "Project status updated",
      message: `Your project "${project.serviceType}" is now: ${project.status}`,
      type: "project_update",
      relatedProject: project._id,
    });

    await sendEmail({
      to: project.user.email,
      subject: `Update on your project: ${project.serviceType}`,
      html: emailTemplates.projectStatusUpdate({
        userName: project.user.name,
        serviceType: project.serviceType,
        projectId: project._id,
        status: project.status,
        adminNotes: project.adminNotes,
      }),
    });

    res.json({ message: "Project updated.", project });
  } catch (err) {
    next(err);
  }
}
