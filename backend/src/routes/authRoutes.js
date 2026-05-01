const express = require("express");
const { register, login, adminLogin, me } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const {
  userAuthRateLimiter,
  adminAuthRateLimiter,
  ensureUserLoginNotLocked,
  ensureAdminLoginNotLocked,
} = require("../middleware/authSecurityMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", userAuthRateLimiter, ensureUserLoginNotLocked, login);
router.post("/admin/login", adminAuthRateLimiter, ensureAdminLoginNotLocked, adminLogin);
router.get("/me", protect, me);

module.exports = router;
