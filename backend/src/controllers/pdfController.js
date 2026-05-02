const TestingRequest = require("../models/TestingRequest");
const User = require("../models/User");
const Sample = require("../models/Sample");
const Payment = require("../models/Payment");
const WebsiteSettings = require("../models/WebsiteSettings");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const {
  generateCombinedRequestPdf,
  generateRequestLetterPdf,
  generateSampleSlipsPdf,
  generateAddressLabelPdf,
} = require("../services/pdfService");

async function loadRequestPdfContext(req) {
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
    Sample.find({ request: request._id }).sort({ sampleId: 1 }).lean(),
    Payment.findOne({ request: request._id, status: "Paid" }).sort({ paidAt: -1 }).lean(),
    WebsiteSettings.findOne().lean(),
  ]);

  return { request, user, samples, payment, settings };
}

function sendPdf(res, buffer, fileName) {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.send(buffer);
}

const downloadCombinedPdf = asyncHandler(async (req, res) => {
  const context = await loadRequestPdfContext(req);
  const pdfBuffer = await generateCombinedRequestPdf(context);
  sendPdf(res, pdfBuffer, `${context.request.requestNumber}.pdf`);
});

const downloadRequestLetterPdf = asyncHandler(async (req, res) => {
  const context = await loadRequestPdfContext(req);
  const pdfBuffer = await generateRequestLetterPdf(context);
  sendPdf(res, pdfBuffer, `${context.request.requestNumber}-request-letter.pdf`);
});

const downloadSampleSlipsPdf = asyncHandler(async (req, res) => {
  const context = await loadRequestPdfContext(req);
  const pdfBuffer = await generateSampleSlipsPdf(context);
  sendPdf(res, pdfBuffer, `${context.request.requestNumber}-sample-slips.pdf`);
});

const downloadAddressLabelPdf = asyncHandler(async (req, res) => {
  const context = await loadRequestPdfContext(req);
  const pdfBuffer = await generateAddressLabelPdf(context);
  sendPdf(res, pdfBuffer, `${context.request.requestNumber}-address-label.pdf`);
});

module.exports = {
  downloadCombinedPdf,
  downloadRequestLetterPdf,
  downloadSampleSlipsPdf,
  downloadAddressLabelPdf,
};
