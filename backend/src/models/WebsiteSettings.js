const mongoose = require("mongoose");

const websiteSettingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: "Maanak Labs" },
    siteTagline: { type: String, default: "A Unit of Entorno Greens Seeds Private Limited" },
    homeIntro: String,
    aboutContent: String,
    contactDetails: {
      address: String,
      mobile: String,
      email: String,
      mapUrl: String,
    },
    termsAndConditions: String,
    compliance: {
      scientificProceduresNote: String,
      accreditationStatus: { type: String, default: "Accreditation in process / to be updated." },
      nablNote: String,
      iso17025Note: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WebsiteSettings", websiteSettingsSchema);

