const { rateLimit } = require("express-rate-limit");
const ApiError = require("../utils/ApiError");

const attemptStore = new Map();

const POLICIES = {
  user: { maxFailures: 8, lockMs: 15 * 60 * 1000 },
  admin: { maxFailures: 5, lockMs: 30 * 60 * 1000 },
};

function getIdentifier(role, req) {
  if (role === "admin") {
    return (req.body?.email || "").toLowerCase().trim();
  }

  return (req.body?.identifier || "").toLowerCase().trim();
}

function getClientIp(req) {
  return req.ip || req.headers["x-forwarded-for"] || "unknown";
}

function getAttemptKey(role, identifier, ip) {
  return `${role}:${identifier}:${ip}`;
}

function createAuthLimiter(max, windowMs, message) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
  });
}

const userAuthRateLimiter = createAuthLimiter(
  20,
  15 * 60 * 1000,
  "Too many login attempts. Please try again shortly."
);

const adminAuthRateLimiter = createAuthLimiter(
  5,
  30 * 60 * 1000,
  "Too many admin login attempts. Please wait before trying again."
);

function ensureNotLocked(role) {
  return (req, _res, next) => {
    const identifier = getIdentifier(role, req);
    if (!identifier) {
      return next();
    }

    const attemptKey = getAttemptKey(role, identifier, getClientIp(req));
    const record = attemptStore.get(attemptKey);
    if (record?.lockUntil && record.lockUntil > Date.now()) {
      return next(
        new ApiError(
          429,
          role === "admin"
            ? "Admin login is temporarily locked after repeated failed attempts."
            : "Login is temporarily locked after repeated failed attempts."
        )
      );
    }

    return next();
  };
}

function registerFailedAttempt(role, identifier, ip) {
  if (!identifier) {
    return;
  }

  const policy = POLICIES[role];
  const attemptKey = getAttemptKey(role, identifier.toLowerCase().trim(), ip);
  const current = attemptStore.get(attemptKey) || { failures: 0, lockUntil: null };

  current.failures += 1;
  if (current.failures >= policy.maxFailures) {
    current.lockUntil = Date.now() + policy.lockMs;
    current.failures = 0;
  }

  attemptStore.set(attemptKey, current);
}

function clearFailedAttempts(role, identifier, ip) {
  if (!identifier) {
    return;
  }

  attemptStore.delete(getAttemptKey(role, identifier.toLowerCase().trim(), ip));
}

module.exports = {
  userAuthRateLimiter,
  adminAuthRateLimiter,
  ensureUserLoginNotLocked: ensureNotLocked("user"),
  ensureAdminLoginNotLocked: ensureNotLocked("admin"),
  registerFailedAttempt,
  clearFailedAttempts,
  getClientIp,
};

