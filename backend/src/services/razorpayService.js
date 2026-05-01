const { hmacSha256, safeEqual } = require("../utils/security");

const RAZORPAY_API = "https://api.razorpay.com/v1";

function getRazorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay key configuration is missing");
  }

  return { keyId, keySecret, webhookSecret };
}

function getBasicAuthHeader() {
  const { keyId, keySecret } = getRazorpayConfig();
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

async function razorpayRequest(endpoint, options = {}) {
  const response = await fetch(`${RAZORPAY_API}${endpoint}`, {
    ...options,
    headers: {
      Authorization: getBasicAuthHeader(),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error?.description || data.error?.reason || "Razorpay request failed");
    error.statusCode = response.status;
    throw error;
  }

  return data;
}

function verifyCheckoutSignature({ orderId, paymentId, signature }) {
  const { keySecret } = getRazorpayConfig();
  const generated = hmacSha256(`${orderId}|${paymentId}`, keySecret);
  return safeEqual(generated, signature);
}

function verifyWebhookSignature(rawBody, signature) {
  const { webhookSecret } = getRazorpayConfig();
  if (!webhookSecret) {
    throw new Error("Razorpay webhook secret is missing");
  }

  const generated = hmacSha256(rawBody, webhookSecret);
  return safeEqual(generated, signature);
}

module.exports = {
  getRazorpayConfig,
  razorpayRequest,
  verifyCheckoutSignature,
  verifyWebhookSignature,
};
