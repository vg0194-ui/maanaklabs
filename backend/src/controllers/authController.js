const Admin = require("../models/Admin");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { signToken } = require("../services/tokenService");
const {
  registerFailedAttempt,
  clearFailedAttempts,
  getClientIp,
} = require("../middleware/authSecurityMiddleware");

const register = asyncHandler(async (req, res) => {
  const { name, companyName, mobile, email, gstNumber, billingAddress, password } = req.body;

  if (!name || !mobile || !email || !password) {
    throw new ApiError(400, "Name, mobile, email, and password are required");
  }

  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { mobile }],
  });

  if (existingUser) {
    throw new ApiError(409, "A user with this email or mobile already exists");
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({
    name,
    companyName,
    mobile,
    email: email.toLowerCase(),
    gstNumber,
    billingAddress,
    passwordHash,
  });

  const token = signToken(user, "user");
  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      companyName: user.companyName,
      mobile: user.mobile,
      email: user.email,
      gstNumber: user.gstNumber,
      billingAddress: user.billingAddress,
      role: "user",
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  const clientIp = getClientIp(req);
  const normalizedIdentifier = (identifier || "").toLowerCase().trim();

  if (!identifier || !password) {
    throw new ApiError(400, "Identifier and password are required");
  }

  const lookup = normalizedIdentifier;
  const user = await User.findOne({
    $or: [{ email: lookup }, { mobile: identifier }],
  });

  if (!user || !(await user.comparePassword(password))) {
    registerFailedAttempt("user", normalizedIdentifier, clientIp);
    throw new ApiError(401, "Invalid credentials");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account is inactive");
  }

  clearFailedAttempts("user", normalizedIdentifier, clientIp);
  const token = signToken(user, "user");
  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      companyName: user.companyName,
      mobile: user.mobile,
      email: user.email,
      gstNumber: user.gstNumber,
      billingAddress: user.billingAddress,
      role: "user",
    },
  });
});

const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const clientIp = getClientIp(req);
  const normalizedEmail = (email || "").toLowerCase().trim();

  const admin = await Admin.findOne({ email: normalizedEmail });
  if (!admin || !(await admin.comparePassword(password))) {
    registerFailedAttempt("admin", normalizedEmail, clientIp);
    throw new ApiError(401, "Invalid admin credentials");
  }

  if (!admin.isActive) {
    throw new ApiError(403, "Admin account is inactive");
  }

  clearFailedAttempts("admin", normalizedEmail, clientIp);
  admin.lastLoginAt = new Date();
  await admin.save();

  const token = signToken(admin, "admin");
  res.json({
    success: true,
    token,
    user: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      mobile: admin.mobile,
      role: "admin",
    },
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = { register, login, adminLogin, me };
