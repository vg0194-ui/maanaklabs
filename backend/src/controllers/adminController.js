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

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, "..", "..", "uploads", "reports")),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`),
});

const reportUpload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new ApiError(400, "Only PDF files are allowed"));
    }
    return cb(null, true);
  },
});

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

  let requests = await TestingRequest.find(query).populate("user").sort({ createdAt: -1 }).lean();

  if (user) {
    const lowered = user.toLowerCase();
    requests = requests.filter((entry) =>
      [entry.contactName, entry.contactEmail, entry.contactMobile, entry.companyName]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(lowered))
    );
  }

  if (crop || variety) {
    const samples = await Sample.find({
      ...(crop ? { crop: new RegExp(crop, "i") } : {}),
      ...(variety ? { variety: new RegExp(variety, "i") } : {}),
    }).lean();
    const allowedIds = new Set(samples.map((sample) => String(sample.request)));
    requests = requests.filter((entry) => allowedIds.has(String(entry._id)));
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
  res.json({ success: true, services });
});

const createService = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    slug: slugify(req.body.slug || req.body.name),
  };
  const service = await Service.create(payload);
  res.status(201).json({ success: true, service });
});

const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      ...(req.body.name ? { slug: slugify(req.body.slug || req.body.name) } : {}),
    },
    { new: true, runValidators: true }
  );
  if (!service) {
    throw new ApiError(404, "Service not found");
  }
  res.json({ success: true, service });
});

const listRates = asyncHandler(async (_req, res) => {
  const rates = await Rate.find().populate("service").sort({ effectiveDate: -1 }).lean();
  res.json({ success: true, rates });
});

const createRate = asyncHandler(async (req, res) => {
  const rate = await Rate.create(req.body);
  res.status(201).json({ success: true, rate });
});

const updateRate = asyncHandler(async (req, res) => {
  const rate = await Rate.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!rate) {
    throw new ApiError(404, "Rate not found");
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
  res.json({ success: true, settings });
});

const updateSettings = asyncHandler(async (req, res) => {
  const existing = await WebsiteSettings.findOne();
  const { _id, createdAt, updatedAt, __v, ...payload } = req.body;
  const settings = await WebsiteSettings.findByIdAndUpdate(existing._id, payload, { new: true, runValidators: true });
  res.json({ success: true, settings });
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
