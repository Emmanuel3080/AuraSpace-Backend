const express = require("express");
const {
  userSignUp,
  handleSignIn,
  handlePasswordReset,
  verfyUserOtp,
  changeUserPassword,
  generateNewOtp,
  verifyUserToken,
  handleLogOut,
} = require("../UserController/Auth");
const uploadProfilePicture = require("../ImagesMiddleware/UploadProfilePicture");
const {
  singleEvent,
  getEvents,
  bookTicket,
  getSingleBooking,
  searchFilterEvents,
} = require("../UserController/userEvents");
const isLoggedIn = require("../Middlewares/isUserLoggedIn");
const userRouter = express.Router();

userRouter.post(
  "/auth/signup",
  uploadProfilePicture.single("profileImage"),
  userSignUp
);
userRouter.post("/auth/logout", handleLogOut);
userRouter.post("/auth/signin", handleSignIn);
userRouter.post("/auth/forgot/password", handlePasswordReset);
userRouter.post("/auth/verify/otp", verfyUserOtp);
userRouter.post("/auth/change/password", changeUserPassword);
userRouter.post("/auth/generate/otp", generateNewOtp);
userRouter.post("/auth/verify/token", verifyUserToken);

//Events
userRouter.get("/event/all", isLoggedIn, getEvents);
userRouter.get("/event/search", isLoggedIn, searchFilterEvents);
userRouter.get("/event/:eventId", isLoggedIn, singleEvent);

//Bookings
userRouter.post("/book/ticket", isLoggedIn, bookTicket);

//Get Single Booking
userRouter.get("/booking/:bookingId", isLoggedIn, getSingleBooking);

module.exports = userRouter;
