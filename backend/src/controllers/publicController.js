const Service = require("../models/Service");
const Rate = require("../models/Rate");
const WebsiteSettings = require("../models/WebsiteSettings");
const Blog = require("../models/Blog");
const Report = require("../models/Report");
const TestingRequest = require("../models/TestingRequest");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { generatePackingGuidePdf } = require("../services/pdfService");
const { sanitizeBlogContent } = require("../utils/blogSanitizer");

const getPublicContent = asyncHandler(async (_req, res) => {
  const [services, rates, settings, blogs] = await Promise.all([
    Service.find({ isActive: true }).sort({ name: 1 }).lean(),
    Rate.find({ isActive: true }).populate("service").sort({ effectiveDate: -1 }).lean(),
    WebsiteSettings.findOne().lean(),
    Blog.find({ isPublished: true }).sort({ publishedAt: -1 }).lean(),
  ]);

  res.json({
    success: true,
    services,
    rates,
    settings,
    blogs: blogs.map((blog) => ({
      _id: blog._id,
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      coverImage: blog.coverImage,
      tags: blog.tags,
      publishedAt: blog.publishedAt,
    })),
  });
});

const getServiceBySlug = asyncHandler(async (req, res) => {
  const service = await Service.findOne({ slug: req.params.slug }).lean();
  if (!service) {
    throw new ApiError(404, "Service not found");
  }
  res.json({ success: true, service });
});

const getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true }).lean();
  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }
  res.json({
    success: true,
    blog: {
      ...blog,
      content: sanitizeBlogContent(blog.content),
    },
  });
});

const verifyReport = asyncHandler(async (req, res) => {
  const report = await Report.findOne({ verificationCode: req.params.code })
    .populate("request")
    .lean();

  if (!report) {
    throw new ApiError(404, "Verification code not found");
  }

  const request = await TestingRequest.findById(report.request._id).populate("user").lean();
  res.json({
    success: true,
    report: {
      fileName: report.fileName,
      verificationCode: report.verificationCode,
      uploadedAt: report.createdAt,
      requestNumber: request.requestNumber,
      status: request.requestStatus,
    },
  });
});

const getPackingGuidePdf = asyncHandler(async (_req, res) => {
  const settings = await WebsiteSettings.findOne().lean();
  const pdfBuffer = await generatePackingGuidePdf({ settings });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'inline; filename="maanak-labs-sample-packing-guide.pdf"');
  res.send(pdfBuffer);
});

module.exports = {
  getPublicContent,
  getServiceBySlug,
  getBlogBySlug,
  verifyReport,
  getPackingGuidePdf,
};
