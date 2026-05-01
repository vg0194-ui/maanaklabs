const TestingRequest = require("../models/TestingRequest");
const User = require("../models/User");
const Sample = require("../models/Sample");
const Payment = require("../models/Payment");
const WebsiteSettings = require("../models/WebsiteSettings");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { generateCombinedRequestPdf } = require("../services/pdfService");

const downloadCombinedPdf = asyncHandler(async (req, res) => {
  const request = await TestingRequest.findById(req.params.requestId).lean();
  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  const isOwner = req.user.role === "user" && String(request.user) === String(req.user._id);
  if (req.user.role === "user" && !isOwner) {
    throw new ApiError(403, "You cannot access this PDF");
  }

  if (request.paymentStatus !== "Paid") {
    throw new ApiError(403, "Payment must be completed before downloading the PDF");
  }

  const [user, samples, payment, settings] = await Promise.all([
    User.findById(request.user).lean(),
    Sample.find({ request: request._id }).lean(),
    Payment.findOne({ request: request._id, status: "Paid" }).sort({ paidAt: -1 }).lean(),
    WebsiteSettings.findOne().lean(),
  ]);

  const pdfBuffer = await generateCombinedRequestPdf({ request, user, payment, samples, settings });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${request.requestNumber}.pdf"`);
  res.send(pdfBuffer);
});

module.exports = { downloadCombinedPdf };

