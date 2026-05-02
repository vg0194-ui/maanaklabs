const express = require("express");
const {
  downloadCombinedPdf,
  downloadRequestLetterPdf,
  downloadSampleSlipsPdf,
  downloadAddressLabelPdf,
} = require("../controllers/pdfController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/requests/:requestId/combined", protect, downloadCombinedPdf);
router.get("/requests/:requestId/request-letter", protect, downloadRequestLetterPdf);
router.get("/requests/:requestId/sample-slips", protect, downloadSampleSlipsPdf);
router.get("/requests/:requestId/address-label", protect, downloadAddressLabelPdf);

module.exports = router;
