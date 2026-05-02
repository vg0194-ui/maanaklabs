const mongoose = require("mongoose");

const requestAddressSchema = new mongoose.Schema(
  {
    line1: String,
    line2: String,
    city: String,
    state: String,
    postalCode: String,
    country: { type: String, default: "India" },
  },
  { _id: false }
);

const requestAttachmentSchema = new mongoose.Schema(
  {
    fileName: String,
    filePath: String,
    uploadedAt: Date,
    uploadedByAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { _id: false }
);

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
    billingAddress: requestAddressSchema,
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
    latestInvoice: { type: mongoose.Schema.Types.ObjectId, ref: "Report" },
    reportAttachment: requestAttachmentSchema,
    invoiceAttachment: requestAttachmentSchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model("TestingRequest", testingRequestSchema);
