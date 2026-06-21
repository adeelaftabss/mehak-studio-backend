// 404 handler — placed after all routes
export function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Centralized error handler — placed last in the middleware chain
export function errorHandler(err, req, res, next) {
  console.error(err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(" "), errors: messages });
  }

  // Mongoose duplicate key error (e.g. unique email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({ message: `That ${field} is already in use.` });
  }

  // Mongoose invalid ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format." });
  }

  // Multer file upload errors
  if (err.name === "MulterError") {
    return res.status(400).json({ message: err.message });
  }

  const status = err.statusCode || 500;
  const message = status === 500 ? "Something went wrong on our end. Please try again." : err.message;

  res.status(status).json({ message });
}

// Helper to throw an error with an HTTP status attached
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}
