const TestingRequest = require("../models/TestingRequest");
const Sample = require("../models/Sample");
const Payment = require("../models/Payment");
const Service = require("../models/Service");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { generateRequestNumber, generateSampleId } = require("../services/idService");
const { calculateRequestPricing } = require("../services/pricingService");
const { sendRequestCreatedEmails } = require("../services/mailService");

function normalizeAddress(address = {}) {
  return {
    line1: (address.line1 || "").trim(),
    line2: (address.line2 || "").trim(),
    city: (address.city || "").trim(),
    state: (address.state || "").trim(),
    postalCode: (address.postalCode || "").trim(),
    country: (address.country || "India").trim() || "India",
  };
}

function toAddressText(address = {}) {
  return [address.line1, address.line2, address.city, address.state, address.postalCode, address.country]
    .filter(Boolean)
    .join(", ");
}

function validateRequestBasics({ contactName, companyName, contactEmail, contactMobile, billingAddress }) {
  if (!contactName || !contactEmail || !contactMobile || !billingAddress?.line1 || !billingAddress?.city || !billingAddress?.state || !billingAddress?.postalCode) {
    throw new ApiError(400, "Name, email, mobile, address, city, state, and pincode are required");
  }

  if (!companyName) {
    throw new ApiError(400, "Company name is required");
  }
}

function validateSamples(samples = []) {
  if (!samples.length) {
    throw new ApiError(400, "At least one sample is required");
  }

  if (samples.some((sample) => !sample.selectedTests?.length)) {
    throw new ApiError(400, "Each sample must include at least one selected test");
  }

  const missingFields = samples.some(
    (sample) =>
      !sample.crop ||
      !sample.variety ||
      !sample.lotNumber ||
      !sample.lotQuantity ||
      !sample.seedClass ||
      !sample.stage
  );

  if (missingFields) {
    throw new ApiError(400, "Each sample must include crop, variety, lot number, lot quantity, seed type, and selected tests");
  }
}

async function enrichRequestSummary(requests) {
  const requestIds = requests.map((request) => request._id);
  const sampleCounts = await Sample.aggregate([
    { $match: { request: { $in: requestIds } } },
    { $group: { _id: "$request", count: { $sum: 1 } } },
  ]);

  const sampleCountMap = new Map(sampleCounts.map((entry) => [String(entry._id), entry.count]));

  return requests.map((request) => ({
    ...request,
    sampleCount: sampleCountMap.get(String(request._id)) || request.totalSamples || 0,
    hasReport: Boolean(request.latestReport || request.reportAttachment?.filePath),
    hasInvoice: Boolean(request.latestInvoice || request.invoiceAttachment?.filePath),
  }));
}

const createRequest = asyncHandler(async (req, res) => {
  const {
    samples = [],
    remarks,
    companyName,
    contactName,
    contactEmail,
    contactMobile,
    gstNumber,
    billingAddress = {},
  } = req.body;

  validateSamples(samples);

  const normalizedAddress = normalizeAddress(billingAddress);
  validateRequestBasics({
    contactName: (contactName || "").trim(),
    companyName: (companyName || "").trim(),
    contactEmail: (contactEmail || "").trim(),
    contactMobile: (contactMobile || "").trim(),
    billingAddress: normalizedAddress,
  });

  const requestNumber = await generateRequestNumber();
  const pricing = await calculateRequestPricing(samples);

  if (pricing.enrichedSamples.some((sample) => Number(sample.estimatedAmount || 0) <= 0)) {
    throw new ApiError(400, "One or more selected tests are inactive or missing a current rate");
  }

  const request = await TestingRequest.create({
    user: req.user._id,
    requestNumber,
    companyName: companyName.trim(),
    contactName: contactName.trim(),
    contactEmail: contactEmail.toLowerCase().trim(),
    contactMobile: contactMobile.trim(),
    gstNumber: (gstNumber || "").trim(),
    billingAddress: normalizedAddress,
    billingAddressText: toAddressText(normalizedAddress),
    totalSamples: pricing.enrichedSamples.length,
    subtotalAmount: pricing.subtotalAmount,
    gstAmount: pricing.gstAmount,
    totalAmount: pricing.totalAmount,
    paymentStatus: "Pending",
    requestStatus: "Payment Pending",
    remarks: (remarks || "").trim(),
  });

  await User.findByIdAndUpdate(req.user._id, {
    companyName: companyName.trim(),
    mobile: contactMobile.trim(),
    email: contactEmail.toLowerCase().trim(),
    gstNumber: (gstNumber || "").trim(),
    billingAddress: normalizedAddress,
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
    const sampleId = await generateSampleId();

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
  const payment = await Payment.findOneAndUpdate(
    { request: request._id, user: req.user._id },
    {
      request: request._id,
      user: req.user._id,
      amount: request.totalAmount,
      status: "Pending",
      gateway: "Razorpay",
    },
    { upsert: true, new: true }
  );

  const createdSamples = await Sample.find({ request: request._id }).lean();

  try {
    const mailResult = await sendRequestCreatedEmails({
      request,
      samples: createdSamples,
      payment,
    });

    if (mailResult?.failedCount) {
      console.error("Request created email partially failed:", mailResult.results);
    }
  } catch (mailError) {
    console.error("Request created email failed:", mailError);
  }

  res.status(201).json({ success: true, request, samples: createdSamples });
});

const listMyRequests = asyncHandler(async (req, res) => {
  const requests = await TestingRequest.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
  const enriched = await enrichRequestSummary(requests);
  res.json({ success: true, requests: enriched });
});

const getMyRequestById = asyncHandler(async (req, res) => {
  const request = await TestingRequest.findOne({ _id: req.params.id, user: req.user._id }).lean();
  if (!request) {
    throw new ApiError(404, "Testing request not found");
  }

  const [samples, payment] = await Promise.all([
    Sample.find({ request: request._id }).sort({ sampleId: 1 }).lean(),
    Payment.findOne({ request: request._id }).sort({ createdAt: -1 }).lean(),
  ]);

  res.json({
    success: true,
    request: {
      ...request,
      sampleCount: samples.length,
      hasReport: Boolean(request.latestReport || request.reportAttachment?.filePath),
      hasInvoice: Boolean(request.latestInvoice || request.invoiceAttachment?.filePath),
    },
    samples,
    payment,
  });
});

module.exports = { createRequest, listMyRequests, getMyRequestById };
