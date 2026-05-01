const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");
const Admin = require("../models/Admin");

async function protect(req, _res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return next(new ApiError(401, "Authentication token missing"));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const Model = payload.role === "admin" ? Admin : User;
    const account = await Model.findById(payload.id).select("-passwordHash");

    if (!account || !account.isActive) {
      return next(new ApiError(401, "Account unavailable"));
    }

    req.user = {
      ...account.toObject(),
      role: payload.role,
    };

    next();
  } catch (_error) {
    next(new ApiError(401, "Invalid or expired token"));
  }
}

function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have access to this resource"));
    }
    next();
  };
}

module.exports = { protect, authorize };

