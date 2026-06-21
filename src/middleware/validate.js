import { validationResult } from "express-validator";

// Run after express-validator check(...) chains to return a clean 400
// response if any validation failed.
export function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return res.status(400).json({ message: messages[0], errors: messages });
  }
  next();
}
