const Payment = require("../models/Payment");
const TestingRequest = require("../models/TestingRequest");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { generateReceiptNumber } = require("../services/idService");
const {
  getRazorpayConfig,
  razorpayRequest,
  verifyCheckoutSignature,
  verifyWebhookSignature,
} = require("../services/razorpayService");

async function markPaymentCaptured({ payment, request, paymentId, signature, razorpayStatus, source }) {
  if (payment.status === "Paid") {
    return payment;
  }

  payment.razorpayPaymentId = paymentId || payment.razorpayPaymentId;
  payment.razorpaySignature = signature || payment.razorpaySignature;
  payment.razorpayStatus = razorpayStatus || payment.razorpayStatus || "captured";
  payment.status = "Paid";
  payment.paidAt = payment.paidAt || new Date();
  payment.receiptNumber = payment.receiptNumber || (await generateReceiptNumber());
  payment.verificationSource = source;
  await payment.save();

  request.paymentStatus = "Paid";
  request.requestStatus = "Sample Awaited";
  await request.save();

  return payment;
}

const createOrder = asyncHandler(async (req, res) => {
  const { requestId } = req.body;
  const { keyId } = getRazorpayConfig();
  const request = await TestingRequest.findOne({ _id: requestId, user: req.user._id });

  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  if (request.paymentStatus === "Paid") {
    throw new ApiError(409, "This request has already been paid");
  }

  const amountInPaise = Math.round(Number(request.totalAmount || 0) * 100);
  if (amountInPaise <= 0) {
    throw new ApiError(400, "Invalid payable amount for this request");
  }

  const razorpayOrder = await razorpayRequest("/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: "INR",
      receipt: request.requestNumber,
      notes: {
        requestId: String(request._id),
        requestNumber: request.requestNumber,
        userId: String(req.user._id),
      },
    }),
  });

  await Payment.findOneAndUpdate(
    { request: request._id, user: req.user._id },
    {
      request: request._id,
      user: req.user._id,
      amount: request.totalAmount,
      gateway: "Razorpay",
      status: "Pending",
      razorpayOrderId: razorpayOrder.id,
      razorpayStatus: razorpayOrder.status,
      verificationSource: "order",
    },
    { upsert: true, new: true }
  );

  res.json({
    success: true,
    order: {
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: keyId,
      requestNumber: request.requestNumber,
      name: "Maanak Labs",
      description: `Seed testing request ${request.requestNumber}`,
      prefill: {
        name: req.user.name,
        email: req.user.email,
        contact: req.user.mobile,
      },
      notes: razorpayOrder.notes,
      theme: {
        color: "#115c3d",
      },
    },
  });
});

const verifyPayment = asyncHandler(async (req, res) => {
  const {
    requestId,
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: razorpaySignature,
  } = req.body;

  const request = await TestingRequest.findOne({ _id: requestId, user: req.user._id });

  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new ApiError(400, "Razorpay order, payment, and signature fields are required");
  }

  const payment = await Payment.findOne({
    request: request._id,
    user: req.user._id,
    razorpayOrderId: razorpayOrderId,
  });

  if (!payment) {
    throw new ApiError(404, "Payment record not found");
  }

  if (
    !verifyCheckoutSignature({
      orderId: payment.razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    })
  ) {
    throw new ApiError(400, "Razorpay payment signature verification failed");
  }

  const razorpayPayment = await razorpayRequest(`/payments/${razorpayPaymentId}`, {
    method: "GET",
  });

  if (razorpayPayment.order_id !== payment.razorpayOrderId) {
    throw new ApiError(400, "Razorpay payment does not belong to the expected order");
  }

  payment.razorpayPaymentId = razorpayPaymentId;
  payment.razorpaySignature = razorpaySignature;
  payment.razorpayStatus = razorpayPayment.status;
  await payment.save();

  if (razorpayPayment.status !== "captured") {
    return res.status(202).json({
      success: true,
      message:
        "Payment signature is valid, but the payment is not yet captured. The request will unlock automatically after capture confirmation.",
      paymentStatus: razorpayPayment.status,
    });
  }

  await markPaymentCaptured({
    payment,
    request,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
    razorpayStatus: razorpayPayment.status,
    source: "checkout-signature",
  });

  return res.json({
    success: true,
    message: "Payment verified successfully.",
    payment,
  });
});

const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  if (!signature) {
    throw new ApiError(400, "Missing Razorpay webhook signature");
  }

  const rawBody = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : "";
  if (!verifyWebhookSignature(rawBody, signature)) {
    throw new ApiError(400, "Invalid Razorpay webhook signature");
  }

  const event = JSON.parse(rawBody);
  const paymentEntity =
    event.payload?.payment?.entity ||
    event.payload?.order?.entity?.payments?.items?.[0] ||
    null;
  const orderEntity = event.payload?.order?.entity || null;
  const orderId = paymentEntity?.order_id || orderEntity?.id;

  if (!orderId) {
    return res.status(202).json({ success: true, message: "Webhook received without an order reference" });
  }

  const payment = await Payment.findOne({ razorpayOrderId: orderId });
  if (!payment) {
    return res.status(202).json({ success: true, message: "Webhook received for an unknown order" });
  }

  const request = await TestingRequest.findById(payment.request);
  if (!request) {
    return res.status(202).json({ success: true, message: "Webhook received for a missing request" });
  }

  if (event.event === "payment.captured" || event.event === "order.paid") {
    await markPaymentCaptured({
      payment,
      request,
      paymentId: paymentEntity?.id,
      signature,
      razorpayStatus: paymentEntity?.status || "captured",
      source: `webhook:${event.event}`,
    });
  } else if (paymentEntity?.status) {
    payment.razorpayStatus = paymentEntity.status;
    await payment.save();
  }

  return res.json({ success: true });
});

module.exports = { createOrder, verifyPayment, handleWebhook };
