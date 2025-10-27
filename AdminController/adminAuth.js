//Change Password
//Send Email
//Verify Otp
//Reset Password

// const
//Verify Token

const jwt = require("jsonwebtoken");
const AdminModel = require("../Model/AdminModel");
const generateOtp = require("../Utils/GenerateOtpValue");
const passwordReset = require("../Utils/PasswordReset");
const bycrypt = require("bcryptjs");
const resendOtp = require("../Utils/ResendOtp");

const handleAdminPassword = async (req, res, next) => {
  const { userEmail } = req.body;
  try {
    const user = await AdminModel.findOne({ email: userEmail });

    if (!user) {
      return res.status(401).json({
        Message: "Email Not Found",
        Status: "Error",
      });
    }

    const newOtp = generateOtp();
    const newOtpExpTime = Date.now() + 1800000;
    const send_Email_Otp = await passwordReset(
      user.OrganizerName,
      user.email,
      newOtp
    );

    await AdminModel.findByIdAndUpdate(user._id, {
      OTP: newOtp,
      OtpExpTime: newOtpExpTime,
    });

    return res.status(201).json({
      Message: `Kindly check your mail ${user.email}. A new OTP has been sent to your inbox to verify your Identity.`,
      Status: "Success",
      send_Email_Otp,
      user,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const verifyAdminOtp = async (req, res, next) => {
  const { email } = req.query;
  const { otp } = req.body;
  if (!otp) {
    return res.status(401).json({
      Status: "Error",
      Message: "No Otp Found, Kindly Enter a valid OTP",
    });
  }
  try {
    // const
    const user = await AdminModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        Message: "User Not Found",
        Status: "Error",
      });
    }
    if (otp !== user.OTP) {
      return res.status(401).json({
        Message: "Inavild OTP",
        Status: "Error",
      });
    }
    if (user.OtpExpTime < Date.now()) {
      await AdminModel.findByIdAndUpdate(user._id, {
        OTP: null,
        OtpExpTime: null,
      });

      return res.status(401).json({
        Message: "OTP Has Expired",
        Status: "Error",
      });
    }

    await AdminModel.findByIdAndUpdate(
      user._id,
      {
        OTP: null,
        OtpExpTime: null,
      },
      {
        new: true,
      }
    );

    return res.status(201).json({
      Message: "OTP has been Verified , Very Validd",
      Status: "Sucesss",
      user,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const changeAdminPassword = async (req, res, next) => {
  const { password } = req.body;
  const { email } = req.query;
  try {
    const salt = await bycrypt.genSalt(10);
    const hashedPassword = await bycrypt.hash(password, salt);

    const user = await AdminModel.findOne({ email: email });
    if (!user) {
      return res.status(401).json({
        Message: "Email Not Found",
        Status: "Error",
      });
    }

    const updatePassword = await AdminModel.findByIdAndUpdate(user._id, {
      password: hashedPassword,
    });
    if (!updatePassword) {
      return res.status(301).json({
        Message: "Email Not Foundd",
        Status: "Error",
      });
    }
    return res.status(201).json({
      Message: "Password Updated Sucessfully",
      Status: "Success",
      updatePassword,
      //   user
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const generateAdminNewOtp = async (req, res, next) => {
  const { email } = req.query;
  try {
    const user = await AdminModel.findOne({ email: email });
    if (!user) {     
      return res.status(401).json({
        Message: "User Not Found, Email not recognized",
        Status: "Error",
      });
    }
    const newOtp = generateOtp();
    const newOtpExpTime = Date.now() + 1800000;
    const resendNewOtp = await resendOtp(
      user.OrganizerName,     
      user.email,   
      newOtp                      
    );

    await AdminModel.findByIdAndUpdate(
      user._id,
      {
        OTP: newOtp,
        OtpExpTime: newOtpExpTime,
      },
      { new: true }
    );

    return res.status(201).json({
      Message: "A new Otp Has Been Sent to your mail",
      Status: "Success",
      user,
      resendNewOtp,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// const ve

const verifyToken = async (req, res, next) => {
  let token;

  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(400).json({
        Message: "Token Not Provided",
        Status: "Error",
      });
    }

    const { adminId } = await jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await AdminModel.findById(adminId);

    if (!user) {
      return res.status(401).json({
        Message: "User Not Found",
        Status: "Error",
      });
    }

    return res.status(201).json({
      Message: "Token Is Validd",
      Status: "Success",
      user,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const updateAdminDetails = async (req, res, next) => {
  const { adminId } = req.params;
  // const { OrganizerName, email, accountNumber, bankAccount } = req.body;

  // if(!req.body){
  //   return
  // }
  try {
    const admin = await AdminModel.findByIdAndUpdate(
      adminId,
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!admin) {
      return res.status(400).json({
        Message: "Invalid ID, Admin Not Found",
        Status: "Error",
      });
    }

    return res.status(201).json({
      Message: "Admin Updated Successfully",
      Status: "Success",
      admin,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = {
  handleAdminPassword,
  verifyToken,
  verifyAdminOtp,
  changeAdminPassword,
  generateAdminNewOtp,
  updateAdminDetails,
};
