const express = require("express");
const { uploadReport, uploadInvoice, downloadReport, downloadInvoice } = require("../controllers/reportController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { reportUpload } = require("../controllers/adminController");

const router = express.Router();

router.get("/:requestId/download", protect, downloadReport);
router.get("/:requestId/invoice-download", protect, downloadInvoice);
router.post("/:requestId/upload", protect, authorize("admin"), reportUpload.single("report"), uploadReport);
router.post("/:requestId/invoice-upload", protect, authorize("admin"), reportUpload.single("invoice"), uploadInvoice);

module.exports = router;
