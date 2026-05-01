const mongoose = require("mongoose");

const testingRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    requestNumber: { type: String, required: true, unique: true },
    companyName: String,
    contactName: String,
    contactEmail: String,
    contactMobile: String,
    gstNumber: String,
    billingAddressText: String,
    totalSamples: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    subtotalAmount: { type: Number, default: 0 },
    paymentStatus: { type: String, default: "Pending" },
    requestStatus: { type: String, default: "Payment Pending" },
    remarks: String,
    declarationAccepted: { type: Boolean, default: true },
    generatedPdfPath: String,
    latestReport: { type: mongoose.Schema.Types.ObjectId, ref: "Report" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TestingRequest", testingRequestSchema);

