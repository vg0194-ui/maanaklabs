const express = require("express");
const {
  getPublicContent,
  getServiceBySlug,
  getBlogBySlug,
  verifyReport,
  getPackingGuidePdf,
} = require("../controllers/publicController");

const router = express.Router();

router.get("/content", getPublicContent);
router.get("/services/:slug", getServiceBySlug);
router.get("/blogs/:slug", getBlogBySlug);
router.get("/report-verification/:code", verifyReport);
router.get("/sample-packing-guide.pdf", getPackingGuidePdf);

module.exports = router;

