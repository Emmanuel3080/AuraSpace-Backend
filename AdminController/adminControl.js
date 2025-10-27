const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const AdminModel = require("../Model/AdminModel");
const eventModel = require("../Model/eventModel");
const blackListedTokenModel = require("../Model/BlackListedToken");
dotenv.config();

const createAdminUser = async (req, res, next) => {
  const { password } = req.body;

  // const cacCertificateImg = req.file;
  // if (!cacCertificateImg) {
  //   return res.status(401).json({
  //     Message: "No Image File Found",
  //     Status: "Errror",
  //   });
  // }

  const AdminProfileImageFile = req.file;
  if (!AdminProfileImageFile) {
    return res.status(401).json({
      Message: "No Image File Found",
      Status: "Errror",
    });
  }

  try {
    //Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const adminUser = await AdminModel.create({
      ...req.body,
      password: hashedPassword,
      // cacCertificate: cacCertificateImg.path,
      AdminProfileImg: AdminProfileImageFile.path,
    });
    if (!adminUser) {
      return res.status(401).json({
        Message: "Sign Up Failed",
        Status: "Error",
      });
    }
    const userInfo = {
      id: adminUser._id,
      OrganizerName: adminUser.OrganizerName,
      email: adminUser.email,
      PhoneNumber: adminUser.PhoneNumber,
      AdminProfileImg: adminUser.AdminProfileImg,
      role: adminUser.role,
      isVerfied: adminUser.isVerfied,
      totalPrice: adminUser.totalSales,
      accountNumber: adminUser.accountNumber,
      bankAccount: adminUser.bankAccount,
    };

    return res.status(201).json({
      Message: "Sign Up Sucessful",
      Status: "Success",
      user: userInfo,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const adminSignIn = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await AdminModel.findOne({ email: email }).select("+password");
    if (!user) {
      return res.status(401).json({
        Message: "Email or Password Incorrect",
        Status: "Error",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        Message: "Email or Password Incorrect",
        Status: "Error",
      });
    }
    const accesToken = await jwt.sign(
      {
        adminId: user._id,
        adminEmail: user.email,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: process.env.JWT_EXPIRY_TIME,
      }
    );

    return res.status(201).json({
      Message: "Sign In Successful",
      Status: "Success",
      user,
      accesToken,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const adminLogout = async (req, res, next) => {
  const { token } = req.body;
  if (!token) {
    return res.status(401).json({
      Message: "No Token Found",
      Status: "Error",
    });
  }
  try {
    await blackListedTokenModel.create({ token });

    return res.status(200).json({
      Message: "Token has been Blacklisted",
      Status: "Success",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const createEvent = async (req, res, next) => {
  // const {} = req.body;
  const adminId = req.user._id;
  // console.log(req.user);

  const eventImage = req.file;
  if (!eventImage) {
    return res.status(401).json({
      Message: "No Image File Found",
      Status: "Error",
    });
  }

  try {
    // console.log("kk");

    const addEvent = await eventModel.create({
      ...req.body,
      createdBy: adminId,
      coverImage: eventImage.path,
    });

    if (!addEvent) {
      return res.status(401).json({
        Message: "Unable to add event",
        Status: "Error",
      });
    }

    return res.status(201).json({
      Message: "Event Added Successfully",
      Status: "Success",
      event: addEvent,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getEvents = async (req, res, next) => {
  try {
    const events = await eventModel
      .find()
      .populate(
        "createdBy",
        "OrganizerName email AdminProfileImg  PhoneNumber +_id"
      );
    if (!events) {
      return res.status(401).json({
        Message: "Unable To Fetch Events",
        Status: "Error",
      });
    }
    return res.status(201).json({
      Message: "All Events Fetched",    
      Status: "Success",
      No_Of_Events: events.length,
      events,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getAdminEvents = async (req, res, next) => {
  const { managerId } = req.params;
  try {
    const events = await eventModel
      .find({ createdBy: managerId })
      .populate("createdBy", "totalSales");
    if (!events || events.length == 0) {
      return res.status(401).json({
        Message: "Error Fetching Events",
        Status: "Error",  
      });
    }

    return res.status(201).json({
      Message: "Events Fetched Successfuly",
      Status: "Success",
      No_Of_Events: events.length,
      events,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const deleteEvents = async (req, res, next) => {
  try {
    await eventModel.deleteMany({});
    return res.status(201).json({
      Message: "All Events Deleted",
      Status: "Success",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const deleteSingleEvent = async (req, res, next) => {
  const { eventId } = req.params;
  try {
    const event = await eventModel.findByIdAndDelete(eventId);
    if (!event) {
      return res.status(404).json({
        Message: "Event Not Found",
        Status: "Success",
      });
    }
    // await eventModel.findByIdAndDelete(event.id)
    return res.status(201).json({
      Message: "Event Deleted Successfully",
      Status: "Success",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const singleEvent = async (req, res, next) => {
  const { eventId } = req.params;
  try {
    const event = await eventModel
      .findById(eventId)
      .populate(
        "createdBy",
        " OrganizerName PhoneNumber AdminProfileImg  +_id"
      );
    if (!event) {
      return res.status(401).json({
        Message: "Invalid  ID",
        Status: "Error",
      });
    }

    return res.status(201).json({
      Message: "Event Fetched",
      Status: "Success",
      event,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const updateEvent = async (req, res, next) => {
  const { eventId } = req.params;
  try {
    const event = await eventModel
      .findByIdAndUpdate(
        eventId,
        { ...req.body },
        { new: true, runValidators: true }
      )
      .populate("createdBy", "OrganizerName PhoneNumber +_id");
    if (!event) {
      return res.status(404).json({
        Message: "Event Not Found",
        Status: "Error",
      });
    }
    return res.status(200).json({
      Message: "Event Updated Successfully",
      Status: "Success",
      event,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const searchFilterEvents = async (req, res, next) => {
  try {
    const { search, title, location, category } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        {
          title: new RegExp(`^${search}$`, "i"),
        },
      ];
    }
    if (title) {
      query.title = new RegExp(title, "i");
    }
    if (location) {
      query.location = new RegExp(location, "i");
    }
    if (category) {
      query.category = new RegExp(`^${category}$`, "i");
    }
    const events = await eventModel
      .find(query)
      .populate("createdBy", " OrganizerName PhoneNumber -_id");
    if (events.length === 0) {
      return res.status(404).json({
        Message: "No Events Found",
        Status: "Error",
      });
    }
    return res.status(201).json({
      Message: "Events Fetched",
      Status: "Success",
      No_Of_Events: events.length,
      events,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
module.exports = {
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
  adminLogout
};
