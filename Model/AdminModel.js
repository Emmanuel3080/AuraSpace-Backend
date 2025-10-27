const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  OrganizerName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  // companyAddress: {
  //   type: String,
  //   required: true,
  // },
  PhoneNumber: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "admin",
  },
  OTP: {
    type: String,
  },
  OtpExpTime: {
    type: String,
  },
  // cacCertificate: {
  //   type: String,
  // },
  AdminProfileImg: {
    type: String,
  },
  totalSales: {
    type: Number,
    default: 0,
  },
  isVerfied: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },
  accountNumber: {
    type: Number,
    required: true,
  },
  bankAccount: {
    type: String,
    require: true,
  },
});

const AdminModel = mongoose.model("AdminUsers", AdminSchema);
module.exports = AdminModel;
