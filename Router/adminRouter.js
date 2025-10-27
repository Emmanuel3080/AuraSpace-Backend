const express = require("express");
const {
  createAdminUser,
  createEvent,
  getEvents,
  deleteEvents,
  singleEvent,
  adminSignIn,
  deleteSingleEvent,
  updateEvent,
  searchFilterEvents,
  getAdminEvents,
  adminLogout,
} = require("../AdminController/adminControl");
const isAdminLoggedIn = require("../Middlewares/isAdminLoggedIn");

const isAdmin = require("../Middlewares/isAdmin");
const uploadCACCertificate = require("../ImagesMiddleware/UploadCAC_Cert");
const uploadEventImage = require("../ImagesMiddleware/UploadEventImage");
const AdminProfileImage = require("../ImagesMiddleware/UploadAdminProfilepic");
const {
  verifyToken,
  handlePasswordReset,
  handleAdminPassword,
  verifyAdminOtp,
  changeAdminPassword,
  generateAdminNewOtp,
  updateAdminDetails,
} = require("../AdminController/adminAuth");
const { getAllBookings } = require("../UserController/userEvents");

const adminRouter = express.Router();

// AdminAuth
adminRouter.post(
  "/signup",
  AdminProfileImage.single("AdminProfileImg"),
  createAdminUser
);

adminRouter.post("/verify/token", verifyToken);
adminRouter.post("/signin", adminSignIn);
adminRouter.post("/logout", adminLogout);
adminRouter.post("/send/otp", handleAdminPassword);
adminRouter.post("/verify/otp", verifyAdminOtp);
adminRouter.post("/change/password", changeAdminPassword);
adminRouter.post("/generate/new/otp", generateAdminNewOtp);

// End of Admin Auth

adminRouter.post(
  "/add/event",
  isAdminLoggedIn,
  isAdmin,
  uploadEventImage.single("coverImage"),
  createEvent
);
adminRouter.get(
  "/event/all",
  // Middleware(for the user)
  getEvents
);
adminRouter.get(
  "/event/:eventId",
  //Middleware(user)
  singleEvent
);

adminRouter.get("/events/manager/:managerId", getAdminEvents);
adminRouter.get(
  "/search/event",
  //Middleware(user)
  searchFilterEvents
);

adminRouter.patch(
  "/update/admin/:adminId",
  isAdminLoggedIn,
  isAdmin,
  updateAdminDetails
);
adminRouter.patch(
  "/event/update/:eventId",
  isAdminLoggedIn,
  isAdmin,
  uploadEventImage.single("coverImage"),
  updateEvent
);
adminRouter.delete("/delete/events", isAdminLoggedIn, isAdmin, deleteEvents);
adminRouter.delete(
  "/delete/event/:eventId",
  isAdminLoggedIn,
  isAdmin,
  deleteSingleEvent
);

adminRouter.get("/bookings", isAdminLoggedIn,isAdmin, getAllBookings);

module.exports = adminRouter;
