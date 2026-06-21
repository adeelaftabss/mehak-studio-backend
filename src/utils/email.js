import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  return transporter;
}

// Sends an email. Swallows errors (logs them) rather than throwing, so that
// a misconfigured/unavailable mail server never breaks the API request that
// triggered the notification.
export async function sendEmail({ to, subject, html, text }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn(`[email] SMTP not configured — skipping email to ${to} ("${subject}")`);
    return { skipped: true };
  }

  try {
    const info = await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, " "),
    });
    return { messageId: info.messageId };
  } catch (err) {
    console.error("[email] Failed to send:", err.message);
    return { error: err.message };
  }
}

const wrap = (title, bodyHtml) => `
  <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111827;">
    <div style="background:#0F172A; padding: 20px 24px; border-radius: 12px 12px 0 0;">
      <span style="color:#fff; font-weight:600; font-size:18px;">Mehak Studio</span>
    </div>
    <div style="border:1px solid #e5e7eb; border-top:none; padding: 24px; border-radius: 0 0 12px 12px;">
      <h2 style="margin-top:0; color:#0F172A;">${title}</h2>
      ${bodyHtml}
    </div>
    <p style="color:#9ca3af; font-size:12px; margin-top:16px;">Mehak Career & Creative Studio · B-Block, 13-O, F-7 Markaz, Islamabad</p>
  </div>
`;

export const emailTemplates = {
  contactFormAdmin: (data) =>
    wrap(
      "New Contact Form Submission",
      `<p><strong>Name:</strong> ${data.name}</p>
       <p><strong>Email:</strong> ${data.email}</p>
       <p><strong>Phone:</strong> ${data.phone || "—"}</p>
       <p><strong>Subject:</strong> ${data.subject}</p>
       <p><strong>Message:</strong><br/>${data.message}</p>`
    ),

  contactFormUser: (data) =>
    wrap(
      "We've received your message",
      `<p>Hi ${data.name},</p>
       <p>Thanks for reaching out to Mehak Studio. We've received your message and will get back to you shortly.</p>
       <p><strong>Your message:</strong><br/>${data.message}</p>`
    ),

  projectRequestAdmin: (data) =>
    wrap(
      "New Project Request",
      `<p><strong>Client:</strong> ${data.userName} (${data.userEmail})</p>
       <p><strong>Service:</strong> ${data.serviceType}</p>
       <p><strong>Deadline:</strong> ${data.deadline || "Not specified"}</p>
       <p><strong>Budget:</strong> ${data.budget || "Not specified"}</p>
       <p><strong>Details:</strong><br/>${data.details}</p>`
    ),

  projectRequestUser: (data) =>
    wrap(
      "Your project request has been received",
      `<p>Hi ${data.userName},</p>
       <p>We've received your request for <strong>${data.serviceType}</strong>. We'll review the details and get back to you with a quote and timeline.</p>`
    ),

  projectStatusUpdate: (data) =>
    wrap(
      "Your project status has been updated",
      `<p>Hi ${data.userName},</p>
       <p>Your project <strong>${data.serviceType}</strong> (${data.projectId}) is now: <strong>${data.status}</strong></p>
       ${data.adminNotes ? `<p><strong>Note from our team:</strong><br/>${data.adminNotes}</p>` : ""}`
    ),

  complaintAdmin: (data) =>
    wrap(
      "New Complaint Submitted",
      `<p><strong>From:</strong> ${data.name} (${data.email})</p>
       <p><strong>Subject:</strong> ${data.subject}</p>
       <p><strong>Message:</strong><br/>${data.message}</p>`
    ),

  feedbackAdmin: (data) =>
    wrap(
      `New ${data.type} Submitted`,
      `<p><strong>Message:</strong><br/>${data.message}</p>
       ${data.rating ? `<p><strong>Rating:</strong> ${data.rating} / 5</p>` : ""}`
    ),

  testimonialAdmin: (data) =>
    wrap(
      "New Testimonial Submitted for Review",
      `<p><strong>Name:</strong> ${data.name}</p>
       <p><strong>Rating:</strong> ${data.rating} / 5</p>
       <p><strong>Quote:</strong><br/>"${data.quote}"</p>`
    ),

  passwordReset: (data) =>
    wrap(
      "Reset your password",
      `<p>Hi ${data.name},</p>
       <p>We received a request to reset your password. Click the button below to choose a new one. This link expires in 1 hour.</p>
       <p style="margin: 24px 0;">
         <a href="${data.resetUrl}" style="background:#FF6B6B; color:#fff; padding:12px 20px; border-radius:999px; text-decoration:none; font-weight:600;">Reset Password</a>
       </p>
       <p>If you didn't request this, you can safely ignore this email.</p>`
    ),
};
