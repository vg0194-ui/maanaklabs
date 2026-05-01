const express = require("express");
const { uploadReport, downloadReport } = require("../controllers/reportController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { reportUpload } = require("../controllers/adminController");

const router = express.Router();

router.get("/:requestId/download", protect, downloadReport);
router.post("/:requestId/upload", protect, authorize("admin"), reportUpload.single("report"), uploadReport);

module.exports = router;

