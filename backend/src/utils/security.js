const crypto = require("crypto");

function hmacSha256(message, secret) {
  return crypto.createHmac("sha256", secret).update(message).digest("hex");
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left || "", "utf8");
  const rightBuffer = Buffer.from(right || "", "utf8");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function generateVerificationToken(size = 24) {
  return crypto.randomBytes(size).toString("hex");
}

module.exports = {
  hmacSha256,
  safeEqual,
  generateVerificationToken,
};

