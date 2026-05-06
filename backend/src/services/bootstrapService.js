const Admin = require("../models/Admin");
const Service = require("../models/Service");
const Rate = require("../models/Rate");
const WebsiteSettings = require("../models/WebsiteSettings");
const Blog = require("../models/Blog");
const defaultServices = require("../data/defaultServices");
const defaultBlogs = require("../data/defaultBlogs");
const defaultSettings = require("../data/defaultSettings");

async function bootstrapDefaults() {
  const adminEmail = (process.env.DEFAULT_ADMIN_EMAIL || "").toLowerCase();
  const adminMobile = (process.env.DEFAULT_ADMIN_MOBILE || "9999999999").trim();
  if (adminEmail) {
    const existingAdmin = await Admin.findOne({
      $or: [{ email: adminEmail }, { mobile: adminMobile }],
    });

    if (!existingAdmin) {
      const passwordHash = await Admin.hashPassword(process.env.DEFAULT_ADMIN_PASSWORD || "ChangeMe123!");
      await Admin.create({
        name: process.env.DEFAULT_ADMIN_NAME || "Maanak Labs Admin",
        email: adminEmail,
        mobile: adminMobile,
        passwordHash,
      });
    } else if (existingAdmin.email === adminEmail || existingAdmin.mobile === adminMobile) {
      const updates = {};

      if (process.env.DEFAULT_ADMIN_NAME && existingAdmin.name !== process.env.DEFAULT_ADMIN_NAME) {
        updates.name = process.env.DEFAULT_ADMIN_NAME;
      }

      if (existingAdmin.email !== adminEmail && adminEmail) {
        const emailOwner = await Admin.findOne({ email: adminEmail, _id: { $ne: existingAdmin._id } });
        if (!emailOwner) {
          updates.email = adminEmail;
        }
      }

      if (existingAdmin.mobile !== adminMobile && adminMobile) {
        const mobileOwner = await Admin.findOne({ mobile: adminMobile, _id: { $ne: existingAdmin._id } });
        if (!mobileOwner) {
          updates.mobile = adminMobile;
        }
      }

      if (Object.keys(updates).length) {
        await Admin.findByIdAndUpdate(existingAdmin._id, updates, { new: true });
      }
    }
  }

  for (const serviceData of defaultServices) {
    let service = await Service.findOne({ slug: serviceData.slug });
    if (!service) {
      service = await Service.create(serviceData);
    }

    const existingDefaultRate = await Rate.findOne({ service: service._id, crop: "", effectiveDate: { $lte: new Date() } });
    if (!existingDefaultRate) {
      await Rate.create({
        service: service._id,
        crop: "",
        amount: service.rate,
        gstPercentage: 0,
        effectiveDate: new Date(),
        isActive: true,
      });
    }
  }

  const settingsCount = await WebsiteSettings.countDocuments();
  if (!settingsCount) {
    await WebsiteSettings.create(defaultSettings);
  }

  for (const blogData of defaultBlogs) {
    const existingBlog = await Blog.findOne({ slug: blogData.slug });
    if (!existingBlog) {
      await Blog.create(blogData);
    }
  }
}

module.exports = bootstrapDefaults;
