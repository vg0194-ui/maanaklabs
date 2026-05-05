const path = require("path");
const multer = require("multer");
const Service = require("../models/Service");
const Rate = require("../models/Rate");
const User = require("../models/User");
const Blog = require("../models/Blog");
const WebsiteSettings = require("../models/WebsiteSettings");
const TestingRequest = require("../models/TestingRequest");
const Sample = require("../models/Sample");
const Payment = require("../models/Payment");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const slugify = require("../utils/slugify");
const { sanitizeBlogContent, sanitizePlainText } = require("../utils/blogSanitizer");
const { buildIdentifierConfig, getNextSeriesValue, setNextSeriesValue } = require("../services/idService");

const uploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, "..", "..", "uploads", "reports")),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`),
});

const reportUpload = multer({
  storage: uploadStorage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new ApiError(400, "Only PDF files are allowed"));
    }
    return cb(null, true);
  },
});

async function attachCurrentRates(services) {
  const currentRates = await Promise.all(
    services.map(async (service) => {
      const rate = await Rate.findOne({
        service: service._id,
        crop: "",
        isActive: true,
        effectiveDate: { $lte: new Date() },
      })
        .sort({ effectiveDate: -1 })
        .lean();

      return [String(service._id), rate || null];
    })
  );

  const rateMap = new Map(currentRates);
  return services.map((service) => ({
    ...service,
    currentRate: rateMap.get(String(service._id))?.amount ?? service.rate ?? 0,
    currentGstPercentage: rateMap.get(String(service._id))?.gstPercentage ?? 0,
    currentRateEffectiveDate: rateMap.get(String(service._id))?.effectiveDate ?? null,
  }));
}

async function syncBaseRate(service, { amount, gstPercentage }) {
  const parsedAmount = Number(amount);
  if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
    return;
  }

  const parsedGst = Number(gstPercentage || 0);
  const existingGenericRate = await Rate.findOne({ service: service._id, crop: "" }).sort({ effectiveDate: -1 });

  if (existingGenericRate) {
    existingGenericRate.amount = parsedAmount;
    existingGenericRate.gstPercentage = Number.isNaN(parsedGst) ? 0 : parsedGst;
    existingGenericRate.isActive = service.isActive;
    existingGenericRate.effectiveDate = existingGenericRate.effectiveDate || new Date();
    await existingGenericRate.save();
  } else {
    await Rate.create({
      service: service._id,
      crop: "",
      amount: parsedAmount,
      gstPercentage: Number.isNaN(parsedGst) ? 0 : parsedGst,
      effectiveDate: new Date(),
      isActive: service.isActive,
    });
  }

  service.rate = parsedAmount;
  await service.save();
}

async function buildRequestRows(baseQuery = {}) {
  const requests = await TestingRequest.find(baseQuery).populate("user").sort({ createdAt: -1 }).lean();
  const requestIds = requests.map((request) => request._id);

  const [sampleCounts, samples] = await Promise.all([
    Sample.aggregate([
      { $match: { request: { $in: requestIds } } },
      { $group: { _id: "$request", count: { $sum: 1 } } },
    ]),
    Sample.find({ request: { $in: requestIds } }).lean(),
  ]);

  const countMap = new Map(sampleCounts.map((entry) => [String(entry._id), entry.count]));
  const groupedSamples = samples.reduce((map, sample) => {
    const key = String(sample.request);
    const current = map.get(key) || [];
    current.push(sample);
    map.set(key, current);
    return map;
  }, new Map());

  return requests.map((request) => ({
    ...request,
    sampleCount: countMap.get(String(request._id)) || 0,
    samples: groupedSamples.get(String(request._id)) || [],
    hasReport: Boolean(request.latestReport || request.reportAttachment?.filePath),
    hasInvoice: Boolean(request.latestInvoice || request.invoiceAttachment?.filePath),
  }));
}

const getDashboard = asyncHandler(async (_req, res) => {
  const [allRequests, pendingPayments, paidRequests, samplesAwaited, samplesReceived, underTesting, reportsPending, completedReports, payments] =
    await Promise.all([
      TestingRequest.countDocuments(),
      TestingRequest.countDocuments({ paymentStatus: "Pending" }),
      TestingRequest.countDocuments({ paymentStatus: "Paid" }),
      TestingRequest.countDocuments({ requestStatus: "Sample Awaited" }),
      TestingRequest.countDocuments({ requestStatus: "Sample Received" }),
      TestingRequest.countDocuments({ requestStatus: "Under Testing" }),
      TestingRequest.countDocuments({ requestStatus: { $in: ["Sample Received", "Under Testing"] } }),
      TestingRequest.countDocuments({ requestStatus: "Completed" }),
      Payment.find({ status: "Paid" }).lean(),
    ]);

  const revenue = payments.reduce((total, payment) => total + Number(payment.amount || 0), 0);
  res.json({
    success: true,
    metrics: {
      totalRequests: allRequests,
      pendingPayments,
      paidRequests,
      samplesAwaited,
      samplesReceived,
      underTesting,
      reportsPending,
      completedReports,
      revenueSummary: Number(revenue.toFixed(2)),
    },
  });
});

const getRequests = asyncHandler(async (req, res) => {
  const { date, user, crop, variety, paymentStatus, testingStatus } = req.query;
  const query = {};

  if (paymentStatus) {
    query.paymentStatus = paymentStatus;
  }

  if (testingStatus) {
    query.requestStatus = testingStatus;
  }

  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    query.createdAt = { $gte: start, $lt: end };
  }

  let requests = await buildRequestRows(query);

  if (user) {
    const lowered = user.toLowerCase();
    requests = requests.filter((entry) =>
      [entry.contactName, entry.contactEmail, entry.contactMobile, entry.companyName]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(lowered))
    );
  }

  if (crop || variety) {
    requests = requests.filter((entry) =>
      entry.samples.some((sample) => {
        const cropMatch = crop ? new RegExp(crop, "i").test(sample.crop) : true;
        const varietyMatch = variety ? new RegExp(variety, "i").test(sample.variety) : true;
        return cropMatch && varietyMatch;
      })
    );
  }

  res.json({ success: true, requests });
});

const updateRequestStatus = asyncHandler(async (req, res) => {
  const request = await TestingRequest.findById(req.params.id);
  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  request.requestStatus = req.body.requestStatus || request.requestStatus;
  await request.save();

  res.json({ success: true, request });
});

const listServices = asyncHandler(async (_req, res) => {
  const services = await Service.find().sort({ createdAt: -1 }).lean();
  const enrichedServices = await attachCurrentRates(services);
  res.json({ success: true, services: enrichedServices });
});

const createService = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    slug: slugify(req.body.slug || req.body.name),
    rate: Number(req.body.rate || 0),
    isActive: req.body.isActive !== false,
  };

  const service = await Service.create(payload);
  await syncBaseRate(service, { amount: req.body.rate || 0, gstPercentage: req.body.gstPercentage || 0 });

  res.status(201).json({ success: true, service });
});

const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  Object.assign(service, {
    ...req.body,
    ...(req.body.name ? { slug: slugify(req.body.slug || req.body.name) } : {}),
  });
  await service.save();

  if (req.body.rate !== undefined || req.body.gstPercentage !== undefined || req.body.isActive !== undefined) {
    await syncBaseRate(service, {
      amount: req.body.rate !== undefined ? req.body.rate : service.rate,
      gstPercentage: req.body.gstPercentage,
    });

    if (req.body.isActive === false) {
      await Rate.updateMany({ service: service._id }, { isActive: false });
    } else if (req.body.isActive === true) {
      await Rate.updateMany({ service: service._id }, { isActive: true });
    }
  }

  res.json({ success: true, service });
});

const listRates = asyncHandler(async (_req, res) => {
  const rates = await Rate.find().populate("service").sort({ effectiveDate: -1, createdAt: -1 }).lean();
  const filteredRates = rates.filter((rate) => rate.service);
  res.json({ success: true, rates: filteredRates });
});

const createRate = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.body.service);
  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  const rate = await Rate.create({
    service: req.body.service,
    crop: (req.body.crop || "").trim(),
    amount: Number(req.body.amount || 0),
    gstPercentage: Number(req.body.gstPercentage || 0),
    effectiveDate: req.body.effectiveDate || new Date(),
    isActive: req.body.isActive !== false && service.isActive !== false,
  });

  if (!rate.crop) {
    service.rate = rate.amount;
    await service.save();
  }

  res.status(201).json({ success: true, rate });
});

const updateRate = asyncHandler(async (req, res) => {
  const rate = await Rate.findById(req.params.id);
  if (!rate) {
    throw new ApiError(404, "Rate not found");
  }

  Object.assign(rate, {
    ...req.body,
    amount: req.body.amount !== undefined ? Number(req.body.amount) : rate.amount,
    gstPercentage: req.body.gstPercentage !== undefined ? Number(req.body.gstPercentage) : rate.gstPercentage,
  });
  await rate.save();

  if (!rate.crop) {
    await Service.findByIdAndUpdate(rate.service, { rate: rate.amount });
  }

  res.json({ success: true, rate });
});

const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).lean();
  res.json({ success: true, users });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: req.body.isActive },
    { new: true, runValidators: true }
  ).lean();
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  res.json({ success: true, user });
});

const getSettings = asyncHandler(async (_req, res) => {
  const settings = await WebsiteSettings.findOne().lean();
  const identifierConfig = buildIdentifierConfig(settings);
  const [requestNextSeries, sampleNextSeries] = await Promise.all([
    getNextSeriesValue("request"),
    getNextSeriesValue("sample"),
  ]);

  res.json({
    success: true,
    settings: {
      ...settings,
      identifierConfig: {
        request: {
          ...identifierConfig.request,
          nextSeries: requestNextSeries,
        },
        sample: {
          ...identifierConfig.sample,
          nextSeries: sampleNextSeries,
        },
      },
    },
  });
});

const updateSettings = asyncHandler(async (req, res) => {
  const existing = await WebsiteSettings.findOne();
  const { _id, createdAt, updatedAt, __v, identifierConfig, ...payload } = req.body;
  const normalizedIdentifierConfig = buildIdentifierConfig({ identifierConfig });

  const settings = await WebsiteSettings.findByIdAndUpdate(
    existing._id,
    {
      ...payload,
      identifierConfig: {
        request: {
          prefix: normalizedIdentifierConfig.request.prefix,
          suffix: normalizedIdentifierConfig.request.suffix,
        },
        sample: {
          prefix: normalizedIdentifierConfig.sample.prefix,
          suffix: normalizedIdentifierConfig.sample.suffix,
        },
      },
    },
    { new: true, runValidators: true }
  );

  if (identifierConfig?.request?.nextSeries !== undefined) {
    await setNextSeriesValue("request", identifierConfig.request.nextSeries);
  }

  if (identifierConfig?.sample?.nextSeries !== undefined) {
    await setNextSeriesValue("sample", identifierConfig.sample.nextSeries);
  }

  const [requestNextSeries, sampleNextSeries] = await Promise.all([
    getNextSeriesValue("request"),
    getNextSeriesValue("sample"),
  ]);

  res.json({
    success: true,
    settings: {
      ...settings.toObject(),
      identifierConfig: {
        request: {
          ...normalizedIdentifierConfig.request,
          nextSeries: requestNextSeries,
        },
        sample: {
          ...normalizedIdentifierConfig.sample,
          nextSeries: sampleNextSeries,
        },
      },
    },
  });
});

const listBlogs = asyncHandler(async (_req, res) => {
  const blogs = await Blog.find().sort({ publishedAt: -1 }).lean();
  res.json({ success: true, blogs });
});

const createBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.create({
    ...req.body,
    title: sanitizePlainText(req.body.title),
    excerpt: sanitizePlainText(req.body.excerpt),
    content: sanitizeBlogContent(req.body.content),
    slug: slugify(req.body.slug || req.body.title),
  });
  res.status(201).json({ success: true, blog });
});

const updateBlog = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    ...(req.body.title ? { title: sanitizePlainText(req.body.title) } : {}),
    ...(req.body.excerpt ? { excerpt: sanitizePlainText(req.body.excerpt) } : {}),
    ...(req.body.content ? { content: sanitizeBlogContent(req.body.content) } : {}),
  };

  const blog = await Blog.findByIdAndUpdate(
    req.params.id,
    {
      ...payload,
      ...(req.body.title ? { slug: slugify(req.body.slug || req.body.title) } : {}),
    },
    { new: true, runValidators: true }
  );
  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }
  res.json({ success: true, blog });
});

const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findByIdAndDelete(req.params.id);
  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }
  res.json({ success: true, message: "Blog deleted" });
});

module.exports = {
  reportUpload,
  getDashboard,
  getRequests,
  updateRequestStatus,
  listServices,
  createService,
  updateService,
  listRates,
  createRate,
  updateRate,
  listUsers,
  updateUserStatus,
  getSettings,
  updateSettings,
  listBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
};
