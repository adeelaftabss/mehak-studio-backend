import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

import User from "./models/User.js";
import Settings from "./models/Settings.js";
import Service from "./models/Service.js";

const PORT = process.env.PORT || 5000;

// TEMPORARY one-time seed route — remove after first use
app.get("/api/_seed-once", async (req, res) => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase();
    const existingAdmin = await User.findOne({ email: adminEmail });
    let adminMsg = "Admin already exists.";
    if (!existingAdmin && adminEmail && process.env.ADMIN_PASSWORD) {
      await User.create({
        name: process.env.ADMIN_NAME || "Admin",
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD,
        role: "admin",
      });
      adminMsg = "Admin created: " + adminEmail;
    }

    const settings = await Settings.getSingleton();
    if (!settings.business?.legalName) {
      settings.business = {
        legalName: "Mehak Career & Creative Studio",
        displayName: "Mehak Studio",
        tagline: "Design. Print. Grow Your Brand.",
        shortDescription: "A creative agency, career services, and digital solutions studio in Islamabad.",
        email: "mailadeelaftab@gmail.com",
        phone: "+92 333 3022690",
        whatsappNumber: "923333022690",
        whatsappDefaultMessage: "Hi Mehak Studio! I'd like to know more about your services.",
        address: { line1: "Mehak Career & Creative Studio", line2: "B-Block, 13-O, F-7 Markaz", city: "Islamabad", country: "Pakistan", lat: 33.7194042, lng: 73.0535655 },
        social: { facebook: "", instagram: "", linkedin: "" },
      };
      await settings.save();
    }

    res.json({ message: "Seed complete.", adminMsg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Mehak Studio API running on port ${PORT} (${process.env.NODE_ENV || "development"})`);
  });
}

start();

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});
