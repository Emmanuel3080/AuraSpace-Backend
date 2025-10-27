const crypto = require("crypto");

const generateOtp = () => {
  const number = crypto.randomInt(0, 1_000_0);
  return number.toString().padStart(6, "0");
};

module.exports = generateOtp;
