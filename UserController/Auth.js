const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const generateOtp = require("../Utils/GenerateOtpValue");
const userModel = require("../Model/userModel");
const passwordReset = require("../Utils/PasswordReset");
const resendOtp = require("../Utils/ResendOtp");
const blackListedTokenModel = require("../Model/BlackListedToken");

const userSignUp = async (req, res, next) => {
  const { password, email } = req.body;

  const imageFile = req.file;
  if (!imageFile) {
    res.status(401).json({
      Status: "error",
      Message: "No Image File Found",
    });
  }

  try {
    //Hash the password

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const OTP = generateOtp();
    const OtpExpTime = Date.now() + 300000;

    const createUser = await userModel.create({
      ...req.body,
      password: hashedPassword,
      OTP,
      OtpExpTime,
      profileImage: imageFile.path,
    });

    const userInfo = {
      name: createUser.name,
      email: createUser.email,
      id: createUser._id,
      profileImage: createUser.profileImage,
    };
    if (!createUser) {
      return res.status(400).json({
        Message: "Unable To Create User",
        Status: "Error",
      });
    }

    return res.status(201).json({
      Message: "Sign Up Successful",
      Status: "Success",
      userInfo,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const handleSignIn = async (req, res, next) => {
  const { password, email } = req.body;
  try {
    //Verify the Password and email

    const verifyUser = await userModel
      .findOne({ email: email })
      .select("+password");
    if (!verifyUser) {
      return res.status(401).json({
        Message: "Email or password Incorrect",
        Status: "Error",
      });
    }

    const isMATCH = await bcrypt.compare(password, verifyUser.password);
    if (!isMATCH) {
      return res.status(401).json({
        Message: "Email or password Incorrect",
        Status: "Error",
      });
    }

    const generateToken = await jwt.sign(
      {
        userId: verifyUser._id,
        email: verifyUser.email,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: process.env.JWT_EXPIRY_TIME,
      }
    );

    return res.status(201).json({
      Message: "Sign In Successful",
      Status: "Success",
      verifyUser,
      accessToken: generateToken,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const handleLogOut = async (req, res, next) => {
  const { token } = req.body;
  if (!token) {
    return res.status(401).json({
      Message: "No Token Found",
      Status: "Error",
    });
  }
  try {
    // const jwt = await
    await blackListedTokenModel.create({ token });

    // const tokens = await jwt.sign({})
    return res.status(200).json({
      Message: "Token has been Blacklisted",
      Status: "Success",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const handlePasswordReset = async (req, res, next) => {
  const { userEmail } = req.body;
  try {
    const user = await userModel.findOne({ email: userEmail });
    if (!user) {
      return res.status(401).json({
        Message: "Email Not Found",
        Status: "Error",
      });
    }

    const newOtp = generateOtp();
    const newOtpExpTime = Date.now() + 1800000;
    const send_Email_Otp = await passwordReset(user.name, user.email, newOtp);

    await userModel.findByIdAndUpdate(
      user._id,
      {
        OTP: newOtp,
        OtpExpTime: newOtpExpTime,
      },
      { new: true }
    );

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

const verfyUserOtp = async (req, res, next) => {
  const { email } = req.query;
  const { otp } = req.body;

  if (!otp) {
    return res.status(401).json({
      Status: "Error",
      Message: "No Otp Found, Kindly Enter a valid OTP",
    });
  }
  try {
    const user = await userModel.findOne({ email });
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
      await userModel.findByIdAndUpdate(user._id, {
        OTP: null,
        OtpExpTime: null,
      });
      return res.status(401).json({
        Message: "OTP Has Expired",
        Status: "Error",
      });
    }
    await userModel.findByIdAndUpdate(
      user._id,
      {
        OTP: null,
        OtpExpTime: null,
      },
      { new: true }
    );

    return res.status(201).json({
      Message: "OTP has been Verified , Very Validd",
      Status: "Sucesss",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const generateNewOtp = async (req, res, next) => {
  const { email } = req.query;
  try {
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(401).json({
        Message: "User Not Found, Invalid Email",
        Status: "Error",
      });
    }

    const newOtp = generateOtp();
    const newOtpExpTime = Date.now() + 1800000;
    const resendNewOtp = await resendOtp(user.name, user.email, newOtp);

    await userModel.findByIdAndUpdate(
      user._id,
      {
        OTP: newOtp,
        OtpExpTime: newOtpExpTime,
      },
      {
        new: true,
      }
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

const changeUserPassword = async (req, res, next) => {
  const { password } = req.body;
  const { email } = req.query;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await userModel.find({ email });
    if (!user) {
      return res.status(401).json({
        Message: "User Not Found",
        Status: "Error",
      });
    }

    const updatePassword = await userModel.findOneAndUpdate(
      { id: user._id },
      { password: hashedPassword }
    );
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

const verifyUserToken = async (req, res, next) => {
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

    const { userId } = await jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await userModel.findById(userId);
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

module.exports = {
  userSignUp,
  handleSignIn,
  handlePasswordReset,
  verfyUserOtp,
  changeUserPassword,
  generateNewOtp,
  verifyUserToken,
  handleLogOut,
};
