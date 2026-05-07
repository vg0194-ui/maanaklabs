const mongoose = require("mongoose");

const contactEnquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    mobile: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    source: { type: String, default: "website" },
    emailStatus: {
      type: String,
      enum: ["pending", "sent", "partial", "failed", "not_configured"],
      default: "pending",
    },
    emailError: { type: String, default: "" },
    emailResults: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactEnquiry", contactEnquirySchema);
