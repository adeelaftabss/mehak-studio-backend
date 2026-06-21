// Run with: npm run seed
// Creates the first admin user (from .env), default site settings, and
// populates the Service collection with the 21 services from the spec.
// Safe to re-run — it skips anything that already exists.

import "dotenv/config";
import { connectDB } from "../config/db.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import Settings from "../models/Settings.js";
import Service from "../models/Service.js";

const services = [
  { slug: "graphic-design", title: "Graphic Design", category: "Creative & Design", short: "Eye-catching visuals tailored to your brand.", description: "From social posts to print-ready artwork, we design visuals that look professional and stay true to your brand identity.", highlights: ["Social media graphics & posters", "Marketing collateral artwork", "Print-ready and digital file formats"], icon: "PenTool" },
  { slug: "printing-solutions", title: "Printing Solutions", category: "Printing Solutions", short: "High-quality printing for every business need.", description: "Business cards, banners, brochures and more — printed to spec and ready for distribution or installation.", highlights: ["Business cards, letterheads & flyers", "Marketing materials & banners", "Corporate printing solutions", "Custom print designs to your specs"], icon: "Printer" },
  { slug: "ats-cv-resume", title: "ATS Optimized CV / Resume", category: "Career & Professional", short: "Resumes built to pass screening software and impress recruiters.", description: "Keyword-optimized, professionally formatted CVs and resumes designed to clear ATS filters and stand out to hiring managers.", highlights: ["Resume redesign & enhancement", "Tailored cover letters", "Professional profile development", "Keyword-optimized for ATS systems"], icon: "FileText" },
  { slug: "social-media-content", title: "Social Media Content Creation", category: "Digital Marketing", short: "Scroll-stopping content calendars and posts.", description: "Consistent, on-brand content for Instagram, Facebook and LinkedIn — planned, designed and ready to publish.", highlights: ["Monthly content calendars", "Branded post & story templates", "Captions, hashtags & scheduling guidance"], icon: "AtSign" },
  { slug: "business-media-kits", title: "Business Media Kits", category: "Creative & Design", short: "Logos, letterheads, business cards & company profiles.", description: "A complete professional identity package — logo, letterhead, business cards and a company profile document.", highlights: ["Logo design", "Letterheads & business cards", "Company profile documents"], icon: "Briefcase" },
  { slug: "brand-identity", title: "Brand Identity", category: "Creative & Design", short: "Cohesive visual identity systems.", description: "Colour palettes, typography, logo systems and brand guidelines that keep every touchpoint consistent.", highlights: ["Logo design & variations", "Colour palette & typography systems", "Brand guideline documents"], icon: "Sparkles" },
  { slug: "google-ads", title: "Google Ads", category: "Digital Marketing", short: "Search & display campaigns that drive results.", description: "Campaign setup, keyword research, ad copy and ongoing optimisation for Google Search and Display.", highlights: ["Keyword research & targeting", "Search & display campaign setup", "Ongoing optimisation & reporting"], icon: "Search" },
  { slug: "meta-ads", title: "Meta Ads", category: "Digital Marketing", short: "Facebook & Instagram ad campaigns.", description: "Targeted ad creative and campaign management across Facebook and Instagram to reach the right audience.", highlights: ["Audience research & targeting", "Ad creative design", "Campaign management & reporting"], icon: "Megaphone" },
  { slug: "online-admissions", title: "Online Admissions", category: "Online Assistance", short: "Guided support for university & college applications.", description: "Help with online admission forms, document preparation and submission for academic institutions.", highlights: ["University & college application forms", "Document preparation & uploads", "Submission support and tracking"], icon: "GraduationCap" },
  { slug: "online-job-applications", title: "Online Job Applications", category: "Online Assistance", short: "End-to-end help applying for jobs online.", description: "From profile setup to tailored applications, we help you apply for jobs across major portals efficiently.", highlights: ["Job portal profile setup", "Tailored applications per role", "Digital documentation support"], icon: "Send" },
  { slug: "data-recovery", title: "Data Recovery", category: "Technology Solutions", short: "Recover lost files from drives & devices.", description: "Professional recovery of lost or deleted files from hard drives, USBs, memory cards and more.", highlights: ["Hard drive & SSD recovery", "USB & memory card recovery", "Photo, document & media file recovery"], icon: "HardDrive" },
  { slug: "letter-writing", title: "Letter Writing", category: "Documentation & Composing", short: "Formal letters for any purpose.", description: "Professionally drafted formal letters — applications, requests, complaints, official correspondence and more.", highlights: ["Formal letters for any purpose", "Professional document formatting", "Available in English or Urdu"], icon: "Mail" },
  { slug: "application-writing", title: "Application Writing", category: "Documentation & Composing", short: "Clear, persuasive applications.", description: "Well-structured applications for jobs, admissions, government offices and more — in English or Urdu.", highlights: ["Job, admission & government applications", "Clear, persuasive structure", "Available in English or Urdu"], icon: "FileSignature" },
  { slug: "urdu-composing", title: "Urdu Composing", category: "Documentation & Composing", short: "Professional Urdu typing & composition.", description: "Accurate Urdu typing, formatting and composition for legal, official and personal documents.", highlights: ["Accurate Urdu typing & formatting", "Legal & official document composition", "Print-ready layouts"], icon: "Languages" },
  { slug: "english-composing", title: "English Composing", category: "Documentation & Composing", short: "Professional English typing & composition.", description: "Clean, well-formatted English documents — typed, edited and proofread to a professional standard.", highlights: ["Professional typing & formatting", "Editing & proofreading", "Print-ready layouts"], icon: "Type" },
  { slug: "custom-graphics", title: "Custom Graphics", category: "Creative & Design", short: "Bespoke graphics for any project.", description: "Need something specific? We design custom graphics tailored exactly to your brief — illustrations, icons, banners and more.", highlights: ["Bespoke illustrations & icons", "Custom banners & visuals", "Designed to your exact brief"], icon: "Shapes" },
  { slug: "photo-editing", title: "Photo Editing", category: "Photo & Media", short: "Polished, professional photo edits.", description: "Colour correction, cropping, background work and general enhancement to get your photos looking their best.", highlights: ["Colour correction & enhancement", "Cropping & background work", "Batch editing for multiple photos"], icon: "Image" },
  { slug: "photo-manipulation", title: "Photo Manipulation", category: "Photo & Media", short: "Creative composites & advanced edits.", description: "Advanced compositing and creative manipulation to turn your ideas into striking visuals.", highlights: ["Creative compositing", "Concept-driven visuals", "Advanced layer-based editing"], icon: "Wand2" },
  { slug: "photo-retouching", title: "Photo Retouching", category: "Photo & Media", short: "Skin, detail & blemish retouching.", description: "Subtle, natural-looking retouching for portraits and product photography.", highlights: ["Portrait retouching", "Product photo retouching", "Natural, professional finish"], icon: "Sparkle" },
  { slug: "photo-restoration", title: "Photo Restoration", category: "Photo & Media", short: "Bring old & damaged photos back to life.", description: "Repair scratches, fading and damage in old family photographs and restore them digitally.", highlights: ["Scratch & damage repair", "Fading correction", "Digitised, restored copies of originals"], icon: "History" },
  { slug: "ai-content-creation", title: "AI Content Creation", category: "Technology Solutions", short: "AI-assisted content, fast.", description: "AI-assisted copywriting, imagery and content ideas — refined by our team for quality and brand fit.", highlights: ["AI-assisted copywriting", "AI-generated imagery & concepts", "Refined and reviewed by our team"], icon: "Bot" },
];

async function seed() {
  await connectDB();

  // 1. Admin user
  const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase();
  if (!adminEmail || !process.env.ADMIN_PASSWORD) {
    console.warn("ADMIN_EMAIL / ADMIN_PASSWORD not set in .env — skipping admin creation.");
  } else {
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log(`Admin already exists: ${adminEmail}`);
    } else {
      await User.create({
        name: process.env.ADMIN_NAME || "Admin",
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD,
        role: "admin",
      });
      console.log(`Admin created: ${adminEmail}`);
    }
  }

  // 2. Default settings singleton
  const settings = await Settings.getSingleton();
  if (!settings.business?.legalName) {
    settings.business = {
      legalName: "Mehak Career & Creative Studio",
      displayName: "Mehak Studio",
      tagline: "Design. Print. Grow Your Brand.",
      shortDescription:
        "A creative agency, career services, and digital solutions studio in Islamabad — helping individuals and businesses look sharp, get hired, and grow online.",
      email: "mailadeelaftab@gmail.com",
      phone: "+92 333 3022690",
      whatsappNumber: "923333022690",
      whatsappDefaultMessage: "Hi Mehak Studio! I'd like to know more about your services.",
      address: {
        line1: "Mehak Career & Creative Studio",
        line2: "B-Block, 13-O, F-7 Markaz",
        city: "Islamabad",
        country: "Pakistan",
        lat: 33.7194042,
        lng: 73.0535655,
      },
      social: { facebook: "", instagram: "", linkedin: "" },
    };
    await settings.save();
    console.log("Default settings saved.");
  } else {
    console.log("Settings already populated — skipping.");
  }

  // 3. Services
  let createdCount = 0;
  for (const svc of services) {
    const exists = await Service.findOne({ slug: svc.slug });
    if (!exists) {
      await Service.create(svc);
      createdCount += 1;
    }
  }
  console.log(`Services seeded: ${createdCount} created, ${services.length - createdCount} already existed.`);

  console.log("Seeding complete.");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
