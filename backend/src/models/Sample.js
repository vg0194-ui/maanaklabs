const mongoose = require("mongoose");

const sampleSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: "TestingRequest", required: true },
    sampleId: { type: String, required: true, unique: true },
    crop: { type: String, required: true, trim: true },
    variety: { type: String, required: true, trim: true },
    lotNumber: { type: String, required: true, trim: true },
    lotQuantity: { type: String, required: true, trim: true },
    seedClass: { type: String, required: true, trim: true },
    stage: { type: String, required: true, trim: true },
    numberOfSamples: { type: Number, required: true, min: 1 },
    selectedTests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
    selectedTestNames: [{ type: String }],
    remarks: String,
    estimatedAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sample", sampleSchema);

