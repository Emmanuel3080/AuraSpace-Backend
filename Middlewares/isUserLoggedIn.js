const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const userModel = require("../Model/userModel");
const blackListedTokenModel = require("../Model/BlackListedToken");
dotenv.config();

const isLoggedIn = async (req, res, next) => {
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
        Message: "Token Not Provided, Kindly Login first",
        Status: "Error",
      });
    }

    const blackListedToken = await blackListedTokenModel.findOne({
      token: token,
    });

    if (blackListedToken) {
      return res.status(401).json({
        Message: "Token has been Blacklisted",
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

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = isLoggedIn;
