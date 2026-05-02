const fs = require("fs");
const path = require("path");
const Report = require("../models/Report");
const TestingRequest = require("../models/TestingRequest");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { generateVerificationToken } = require("../utils/security");

async function uploadDocument({ req, reportType }) {
  const request = await TestingRequest.findById(req.params.requestId);
  if (!request) {
    throw new ApiError(404, "Testing request not found");
  }

  if (!req.file) {
    throw new ApiError(400, "PDF file is required");
  }

  const report = await Report.create({
    request: request._id,
    uploadedByAdmin: req.user._id,
    fileName: req.file.originalname,
    filePath: req.file.path,
    verificationCode: generateVerificationToken(16),
    reportType,
  });

  const attachment = {
    fileName: req.file.originalname,
    filePath: req.file.path,
    uploadedAt: new Date(),
    uploadedByAdmin: req.user._id,
  };

  if (reportType === "report") {
    request.latestReport = report._id;
    request.reportAttachment = attachment;
    request.requestStatus = "Report Generated";
  } else {
    request.latestInvoice = report._id;
    request.invoiceAttachment = attachment;
  }

  await request.save();
  return report;
}

async function downloadDocument({ req, reportType }) {
  const request = await TestingRequest.findById(req.params.requestId);
  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  const isUserOwner = req.user.role === "user" && String(request.user) === String(req.user._id);
  if (req.user.role === "user" && !isUserOwner) {
    throw new ApiError(403, "You cannot access this document");
  }

  const attachment = reportType === "report" ? request.reportAttachment : request.invoiceAttachment;
  const linkedReportId = reportType === "report" ? request.latestReport : request.latestInvoice;
  if (!linkedReportId || !attachment?.filePath) {
    throw new ApiError(404, `${reportType === "report" ? "Final report" : "Invoice"} is not available yet`);
  }

  const report = await Report.findById(linkedReportId);
  if (!report || !fs.existsSync(report.filePath)) {
    throw new ApiError(404, "File missing");
  }

  return {
    filePath: path.resolve(report.filePath),
    fileName: report.fileName,
  };
}

const uploadReport = asyncHandler(async (req, res) => {
  const report = await uploadDocument({ req, reportType: "report" });
  res.status(201).json({ success: true, report });
});

const uploadInvoice = asyncHandler(async (req, res) => {
  const invoice = await uploadDocument({ req, reportType: "invoice" });
  res.status(201).json({ success: true, invoice });
});

const downloadReport = asyncHandler(async (req, res) => {
  const { filePath, fileName } = await downloadDocument({ req, reportType: "report" });
  res.download(filePath, fileName);
});

const downloadInvoice = asyncHandler(async (req, res) => {
  const { filePath, fileName } = await downloadDocument({ req, reportType: "invoice" });
  res.download(filePath, fileName);
});

module.exports = { uploadReport, uploadInvoice, downloadReport, downloadInvoice };
