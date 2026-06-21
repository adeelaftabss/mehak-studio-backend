import Settings from "../models/Settings.js";

export async function getSettings(req, res, next) {
  try {
    const settings = await Settings.getSingleton();
    res.json({ settings });
  } catch (err) {
    next(err);
  }
}

// Admin: partial update of any section (business, homepage, about, seo).
// Uses a deep-merge style update so the admin panel can save one section
// at a time without overwriting the others.
export async function updateSettings(req, res, next) {
  try {
    const settings = await Settings.getSingleton();

    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === "object" && !Array.isArray(req.body[key]) && req.body[key] !== null) {
        settings[key] = { ...settings[key]?.toObject?.() ?? settings[key], ...req.body[key] };
      } else {
        settings[key] = req.body[key];
      }
    }

    await settings.save();
    res.json({ message: "Settings updated.", settings });
  } catch (err) {
    next(err);
  }
}
