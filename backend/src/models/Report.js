const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: "TestingRequest", required: true },
    uploadedByAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    verificationCode: { type: String, required: true, unique: true },
    reportType: { type: String, enum: ["report", "invoice"], default: "report" },
    status: { type: String, default: "Active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
