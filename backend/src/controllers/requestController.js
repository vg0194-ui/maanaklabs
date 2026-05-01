const TestingRequest = require("../models/TestingRequest");
const Sample = require("../models/Sample");
const Payment = require("../models/Payment");
const Service = require("../models/Service");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { generateRequestNumber, generateSampleSeries } = require("../services/idService");
const { calculateRequestPricing } = require("../services/pricingService");

const createRequest = asyncHandler(async (req, res) => {
  const { samples = [], remarks, billingAddressText } = req.body;

  if (!samples.length) {
    throw new ApiError(400, "At least one sample is required");
  }

  if (samples.some((sample) => !sample.selectedTests?.length)) {
    throw new ApiError(400, "Each sample must include at least one selected test");
  }

  const requestNumber = await generateRequestNumber();
  const sampleSeries = await generateSampleSeries();
  const pricing = await calculateRequestPricing(samples);

  const request = await TestingRequest.create({
    user: req.user._id,
    requestNumber,
    companyName: req.user.companyName,
    contactName: req.user.name,
    contactEmail: req.user.email,
    contactMobile: req.user.mobile,
    gstNumber: req.user.gstNumber,
    billingAddressText,
    totalSamples: pricing.enrichedSamples.length,
    subtotalAmount: pricing.subtotalAmount,
    gstAmount: pricing.gstAmount,
    totalAmount: pricing.totalAmount,
    paymentStatus: "Pending",
    requestStatus: "Payment Pending",
    remarks,
  });

  const serviceMap = Object.fromEntries(
    (
      await Service.find({
        _id: { $in: pricing.enrichedSamples.flatMap((sample) => sample.selectedTests || []) },
      }).lean()
    ).map((service) => [String(service._id), service.name])
  );

  const sampleDocs = [];
  for (let index = 0; index < pricing.enrichedSamples.length; index += 1) {
    const sample = pricing.enrichedSamples[index];
    const sampleId = `${sampleSeries}-${String.fromCharCode(65 + index)}`;

    sampleDocs.push({
      request: request._id,
      sampleId,
      crop: sample.crop,
      variety: sample.variety,
      lotNumber: sample.lotNumber,
      lotQuantity: sample.lotQuantity,
      seedClass: sample.seedClass,
      stage: sample.stage,
      numberOfSamples: sample.numberOfSamples,
      selectedTests: sample.selectedTests,
      selectedTestNames: (sample.selectedTests || []).map((id) => serviceMap[String(id)] || "Custom Test"),
      remarks: sample.remarks,
      estimatedAmount: sample.estimatedAmount,
    });
  }

  await Sample.insertMany(sampleDocs);
  await Payment.create({
    request: request._id,
    user: req.user._id,
    amount: request.totalAmount,
    status: "Pending",
    gateway: "Razorpay",
  });

  const createdSamples = await Sample.find({ request: request._id }).lean();
  res.status(201).json({ success: true, request, samples: createdSamples });
});

const listMyRequests = asyncHandler(async (req, res) => {
  const requests = await TestingRequest.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, requests });
});

const getMyRequestById = asyncHandler(async (req, res) => {
  const request = await TestingRequest.findOne({ _id: req.params.id, user: req.user._id }).lean();
  if (!request) {
    throw new ApiError(404, "Testing request not found");
  }

  const [samples, payment] = await Promise.all([
    Sample.find({ request: request._id }).lean(),
    Payment.findOne({ request: request._id }).sort({ createdAt: -1 }).lean(),
  ]);

  res.json({ success: true, request, samples, payment });
});

module.exports = { createRequest, listMyRequests, getMyRequestById };
