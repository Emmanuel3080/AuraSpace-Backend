const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    select: false,
  },
  OTP: {
    type: String,
  },
  OtpExpTime: {
    type: String,
  },
  profileImage: {
    type: String,
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin"],     
  },
});
   
const userModel = mongoose.model("users", userSchema);
module.exports = userModel;
