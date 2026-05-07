const Service = require("../models/Service");
const Rate = require("../models/Rate");
const WebsiteSettings = require("../models/WebsiteSettings");
const Blog = require("../models/Blog");
const Report = require("../models/Report");
const TestingRequest = require("../models/TestingRequest");
const ContactEnquiry = require("../models/ContactEnquiry");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { generatePackingGuidePdf, generateSampleSizeGuidePdf } = require("../services/pdfService");
const { sanitizeBlogContent } = require("../utils/blogSanitizer");
const { isMailConfigured, sendContactEnquiryEmails } = require("../services/mailService");

async function getCurrentRateMap(activeServices) {
  const serviceIds = activeServices.map((service) => service._id);
  const rates = await Rate.find({
    service: { $in: serviceIds },
    isActive: true,
    effectiveDate: { $lte: new Date() },
  })
    .populate("service")
    .sort({ effectiveDate: -1, createdAt: -1 })
    .lean();

  const latestPerKey = new Map();
  for (const rate of rates) {
    if (!rate.service?.isActive) {
      continue;
    }

    const key = `${String(rate.service._id)}::${rate.crop || ""}`;
    if (!latestPerKey.has(key)) {
      latestPerKey.set(key, rate);
    }
  }

  return latestPerKey;
}

const getPublicContent = asyncHandler(async (_req, res) => {
  const [services, settings, blogs] = await Promise.all([
    Service.find({ isActive: true }).sort({ name: 1 }).lean(),
    WebsiteSettings.findOne().lean(),
    Blog.find({ isPublished: true }).sort({ publishedAt: -1 }).lean(),
  ]);

  const rateMap = await getCurrentRateMap(services);

  const serviceRows = services.map((service) => {
    const genericRate = rateMap.get(`${String(service._id)}::`);
    return {
      ...service,
      rate: genericRate?.amount ?? service.rate ?? 0,
      gstPercentage: genericRate?.gstPercentage ?? 0,
      currentRateEffectiveDate: genericRate?.effectiveDate ?? null,
    };
  });

  const rates = [...rateMap.values()].filter((rate) => rate.isActive && rate.service?.isActive);

  res.json({
    success: true,
    services: serviceRows.filter((service) => service.isActive),
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
  const service = await Service.findOne({ slug: req.params.slug, isActive: true }).lean();
  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  const rate = await Rate.findOne({
    service: service._id,
    crop: "",
    isActive: true,
    effectiveDate: { $lte: new Date() },
  })
    .sort({ effectiveDate: -1 })
    .lean();

  res.json({
    success: true,
    service: {
      ...service,
      rate: rate?.amount ?? service.rate ?? 0,
      gstPercentage: rate?.gstPercentage ?? 0,
      currentRateEffectiveDate: rate?.effectiveDate ?? null,
    },
  });
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
  const report = await Report.findOne({ verificationCode: req.params.code, reportType: "report" }).populate("request").lean();
  if (!report) {
    throw new ApiError(404, "Verification code not found");
  }

  const request = await TestingRequest.findById(report.request._id).lean();
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

const getSampleSizeGuidePdf = asyncHandler(async (_req, res) => {
  const settings = await WebsiteSettings.findOne().lean();
  const pdfBuffer = await generateSampleSizeGuidePdf({ settings });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'inline; filename="maanak-labs-sample-size-guide.pdf"');
  res.send(pdfBuffer);
});

const submitContactEnquiry = asyncHandler(async (req, res) => {
  const name = (req.body?.name || "").trim();
  const email = (req.body?.email || "").toLowerCase().trim();
  const mobile = (req.body?.mobile || "").trim();
  const message = (req.body?.message || "").trim();
  const website = (req.body?.website || "").trim();

  if (website) {
    throw new ApiError(400, "Spam check failed");
  }

  if (!name || !email || !mobile || !message) {
    throw new ApiError(400, "Name, email, mobile, and message are required");
  }

  const enquiry = await ContactEnquiry.create({
    name,
    email,
    mobile,
    message,
    emailStatus: isMailConfigured() ? "pending" : "not_configured",
  });

  try {
    const mailResult = await sendContactEnquiryEmails({
      name,
      email,
      mobile,
      message,
    });

    const emailStatus = mailResult?.failedCount ? "partial" : "sent";
    await ContactEnquiry.findByIdAndUpdate(enquiry._id, {
      emailStatus,
      emailError: "",
      emailResults: mailResult?.results || [],
    });

    if (mailResult?.failedCount) {
      console.warn("Contact enquiry acknowledgement partially failed:", mailResult.results);
    }
  } catch (mailError) {
    console.error("Contact enquiry email failed:", mailError?.details || mailError);
    await ContactEnquiry.findByIdAndUpdate(enquiry._id, {
      emailStatus: "failed",
      emailError: mailError?.message || "Unable to send enquiry email",
      emailResults: Array.isArray(mailError?.details) ? mailError.details : [],
    });
  }

  res.status(201).json({
    success: true,
    message: "Your enquiry has been submitted successfully. Our team will review it shortly.",
  });
});

module.exports = {
  getPublicContent,
  getServiceBySlug,
  getBlogBySlug,
  verifyReport,
  getPackingGuidePdf,
  getSampleSizeGuidePdf,
  submitContactEnquiry,
};
