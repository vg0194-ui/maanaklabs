const jwt = require("jsonwebtoken");

function signToken(account, role) {
  return jwt.sign({ id: account._id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

module.exports = { signToken };

