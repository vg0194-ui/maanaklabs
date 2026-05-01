const fs = require("fs");
const path = require("path");
const Report = require("../models/Report");
const TestingRequest = require("../models/TestingRequest");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const uploadReport = asyncHandler(async (req, res) => {
  const request = await TestingRequest.findById(req.params.requestId);

  if (!request) {
    throw new ApiError(404, "Testing request not found");
  }

  if (!req.file) {
    throw new ApiError(400, "Report PDF file is required");
  }

  const verificationCode = `${request.requestNumber}-VRF`;
  const report = await Report.create({
    request: request._id,
    uploadedByAdmin: req.user._id,
    fileName: req.file.originalname,
    filePath: req.file.path,
    verificationCode,
  });

  request.latestReport = report._id;
  request.requestStatus = "Report Generated";
  await request.save();

  res.status(201).json({ success: true, report });
});

const downloadReport = asyncHandler(async (req, res) => {
  const request = await TestingRequest.findById(req.params.requestId);
  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  const isUserOwner = req.user.role === "user" && String(request.user) === String(req.user._id);
  if (req.user.role === "user" && !isUserOwner) {
    throw new ApiError(403, "You cannot access this report");
  }

  if (!request.latestReport) {
    throw new ApiError(404, "Final report is not available yet");
  }

  const report = await Report.findById(request.latestReport);
  if (!report || !fs.existsSync(report.filePath)) {
    throw new ApiError(404, "Report file missing");
  }

  res.download(path.resolve(report.filePath), report.fileName);
});

module.exports = { uploadReport, downloadReport };
