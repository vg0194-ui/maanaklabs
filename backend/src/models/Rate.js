const mongoose = require("mongoose");

const rateSchema = new mongoose.Schema(
  {
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    crop: { type: String, trim: true, default: "" },
    amount: { type: Number, required: true, min: 0 },
    gstPercentage: { type: Number, default: 0, min: 0 },
    effectiveDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rate", rateSchema);

