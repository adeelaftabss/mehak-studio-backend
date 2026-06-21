import mongoose from "mongoose";

// Settings is a singleton collection: there should only ever be one document.
// Use Settings.getSingleton() to fetch/create it safely.
const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "site_settings", unique: true },

    business: {
      legalName: String,
      displayName: String,
      tagline: String,
      shortDescription: String,
      email: String,
      phone: String,
      whatsappNumber: String,
      whatsappDefaultMessage: String,
      address: {
        line1: String,
        line2: String,
        city: String,
        country: String,
        lat: Number,
        lng: Number,
      },
      social: {
        facebook: String,
        instagram: String,
        linkedin: String,
      },
    },

    homepage: {
      heroHeadline: String,
      heroSubheadline: String,
    },

    about: {
      intro: [String],
      mission: String,
      vision: String,
      whyChooseUs: [String],
      commitment: [String],
    },

    seo: {
      metaTitle: String,
      metaDescription: String,
    },
  },
  { timestamps: true }
);

settingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne({ key: "site_settings" });
  if (!settings) {
    settings = await this.create({ key: "site_settings" });
  }
  return settings;
};

export default mongoose.model("Settings", settingsSchema);
