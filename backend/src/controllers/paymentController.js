const Payment = require("../models/Payment");
const TestingRequest = require("../models/TestingRequest");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { generateReceiptNumber } = require("../services/idService");

const createOrder = asyncHandler(async (req, res) => {
  const { requestId } = req.body;
  const request = await TestingRequest.findOne({ _id: requestId, user: req.user._id });

  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  const payment = await Payment.findOneAndUpdate(
    { request: request._id, user: req.user._id },
    {
      request: request._id,
      user: req.user._id,
      amount: request.totalAmount,
      gateway: "Razorpay",
      status: "Pending",
      razorpayOrderId: `order_${Date.now()}`,
    },
    { upsert: true, new: true }
  );

  res.json({
    success: true,
    order: {
      id: payment.razorpayOrderId,
      amount: payment.amount,
      currency: payment.currency,
      key: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
      note: "Placeholder Razorpay integration. Replace with official order creation in production.",
    },
  });
});

const verifyPayment = asyncHandler(async (req, res) => {
  const { requestId, razorpayPaymentId, razorpaySignature } = req.body;
  const request = await TestingRequest.findOne({ _id: requestId, user: req.user._id });

  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  const payment = await Payment.findOne({ request: request._id, user: req.user._id });
  if (!payment) {
    throw new ApiError(404, "Payment record not found");
  }

  payment.razorpayPaymentId = razorpayPaymentId || `pay_${Date.now()}`;
  payment.razorpaySignature = razorpaySignature || "placeholder_signature";
  payment.status = "Paid";
  payment.paidAt = new Date();
  payment.receiptNumber = await generateReceiptNumber();
  await payment.save();

  request.paymentStatus = "Paid";
  request.requestStatus = "Sample Awaited";
  await request.save();

  res.json({
    success: true,
    message: "Payment marked as successful. Replace this flow with official Razorpay signature verification in production.",
    payment,
  });
});

module.exports = { createOrder, verifyPayment };

