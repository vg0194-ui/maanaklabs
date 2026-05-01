const express = require("express");
const { downloadCombinedPdf } = require("../controllers/pdfController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/requests/:requestId/combined", protect, downloadCombinedPdf);

module.exports = router;

