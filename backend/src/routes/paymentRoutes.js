const express = require("express");
const { createOrder, verifyPayment } = require("../controllers/paymentController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, authorize("user"));
router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);

module.exports = router;

