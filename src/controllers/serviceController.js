import Service from "../models/Service.js";
import { ApiError } from "../middleware/errorHandler.js";

export async function listServices(req, res, next) {
  try {
    const { category } = req.query;
    const filter = { isActive: true, ...(category && category !== "All" && { category }) };
    const services = await Service.find(filter).sort({ sortOrder: 1, title: 1 });
    res.json({ services });
  } catch (err) {
    next(err);
  }
}

export async function getServiceBySlug(req, res, next) {
  try {
    const service = await Service.findOne({ slug: req.params.slug, isActive: true });
    if (!service) throw new ApiError(404, "Service not found.");
    res.json({ service });
  } catch (err) {
    next(err);
  }
}

// Admin
export async function createService(req, res, next) {
  try {
    const service = await Service.create(req.body);
    res.status(201).json({ message: "Service created.", service });
  } catch (err) {
    next(err);
  }
}

export async function updateService(req, res, next) {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!service) throw new ApiError(404, "Service not found.");
    res.json({ message: "Service updated.", service });
  } catch (err) {
    next(err);
  }
}

export async function deleteService(req, res, next) {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) throw new ApiError(404, "Service not found.");
    res.json({ message: "Service deleted." });
  } catch (err) {
    next(err);
  }
}
