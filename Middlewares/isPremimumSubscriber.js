const blackListedTokenModel = require("../Model/BlackListedToken");
const dotenv = require("dotenv");
dotenv.config();

const jwt = require("jsonwebtoken");
const userModel = require("../Model/userModel");

const isPremium = async (req, res, next) => {
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
        Message: "No Token Provided",
        Status: "Error",
      });
    }

    //Check if the token has been blacklisted

    const checkToken = await blackListedTokenModel.findOne({ token: token });

    if (checkToken) {
      return res.status(301).json({
        Message: "Token has been Blacklised",
      });
    }

    //Verify the token

    const { userId } = await jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(401).json({
        Message: "No User Found",
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

module.exports = isPremium;
