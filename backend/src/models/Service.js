const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    sampleQuantity: { type: String, required: true },
    estimatedTestingTime: { type: String, required: true },
    rate: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
    termsAndConditions: { type: String, required: true },
    icon: { type: String, default: "flask" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);

