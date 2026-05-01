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
  if (adminEmail) {
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const passwordHash = await Admin.hashPassword(process.env.DEFAULT_ADMIN_PASSWORD || "ChangeMe123!");
      await Admin.create({
        name: process.env.DEFAULT_ADMIN_NAME || "Maanak Labs Admin",
        email: adminEmail,
        mobile: process.env.DEFAULT_ADMIN_MOBILE || "9999999999",
        passwordHash,
      });
    }
  }

  for (const serviceData of defaultServices) {
    const service = await Service.findOneAndUpdate({ slug: serviceData.slug }, serviceData, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });

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
    await Blog.findOneAndUpdate({ slug: blogData.slug }, blogData, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }
}

module.exports = bootstrapDefaults;

