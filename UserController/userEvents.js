// const

const AdminModel = require("../Model/AdminModel");
const BookingModel = require("../Model/BokkingModel");
const eventModel = require("../Model/eventModel");
const userModel = require("../Model/userModel");
const AdminEventsBooking = require("../Utils/BookingsConfirmEmail");
const confirmEvent = require("../Utils/EventConfirm");

const bookTicket = async (req, res, next) => {
  const user_ID = req?.user?._id;

  const { name, email } = req.user;
  // console.log(name, email);

  const { quantity, eventId } = req.body;

  if (!quantity || !eventId) {
    return res.status(400).json({
      Message: "Event Id Not Found",
      Status: "Error",
    });
  }
  try {
    const event = await eventModel.findById(eventId).populate("createdBy");
    if (!event) {
      return res.status(400).json({
        Message: "Event Not Found",
        Status: "Error",
      });
    }
    // return res.status(201).json({
    //   event,
    // });

    //Check Availablity of Ticket
    if (event.TicketsSold + quantity > event.TicketsAvailable) {
      return res.status(400).json({
        Message: "Not enough tickets available",
        Status: "Error",
      });
    }
    if (new Date(event.eventDate).getTime() < Date.now()) {
      return res.status(400).json({
        Message: "Event Has Closed",
        Status: "Error",
      });
    }

    const totalPrice = event.price * quantity;

    const bookEvent = await BookingModel.create({
      userId: user_ID,
      quantity,
      totalPrice,
      eventId,
      // status: "Confirmed",
      paymentStatus: "paid",
    });

    const eventInfo = {
      eventName: event.title,
      location: event.location,
      startTime: event.startTime,
      bookingId: bookEvent._id,
      eventDate: event.eventDate,
      endTime: event.endTime,
    };

    //Update The Number Ticket Sold
    event.TicketsSold += quantity;

    // Decrease the number of tickets available
    event.TicketsAvailable -= quantity;

    //Update the number of attendes
    event.Attendees += quantity;

    //Update the price incurred(profit for admin)
    event.TotalAmount += totalPrice;
    await event.save();

    await AdminModel.findByIdAndUpdate(
      event.createdBy,
      {
        $inc: { totalSales: totalPrice },
      },
      {
        new: true,
      }
    );
    const adminEmail = event.createdBy.email;

    // const adminTotalPrice = await
    // await AdminModel.findByIdAndUpdate()

    const bookingConfirmation = await confirmEvent(name, email, eventInfo);

    const sendEmailAdmin = await AdminEventsBooking(
      name,
      adminEmail,
      email,
      event.title,
      event.location
    );

    return res.status(201).json({
      Message: "Booking successful",
      success: true,
      bookEvent,
      eventInfo,
      bookingConfirmation,
      sendEmailAdmin,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getSingleBooking = async (req, res, next) => {
  const { bookingId } = req.params;
  try {
    const booking = await BookingModel.findById(bookingId)
      .populate(
        "eventId",
        "title description coverImage eventDate endTime startTime location"
      )
      .populate("userId", "name email profileImage");
    if (!booking) {
      return res.status(401).json({
        Message: "Booking Not Found",
        Status: "Error",
      });
    }

    return res.status(201).json({
      Status: "Success",
      Message: "Booking, Details",
      booking,
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

const getEvents = async (req, res, next) => {
  try {
    const events = await eventModel
      .find()
      .populate(
        "createdBy",
        "OrganizerName email AdminProfileImg totalSales  PhoneNumber +_id"
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

const getAllBookings = async (req, res, next) => {
  const { eventBook } = req.params;
  try {
    const bookings = await BookingModel.find({ eventBook })
      .populate("userId", "name email")
      .populate("eventId", "title createdBy.name");

    if (!bookings || bookings.length === 0) {
      return res.status(301).json({
        Message: "No bookings found for this event",
        Status: "Error",
      });
    }

    const totalBookings = bookings.length;
    const uniqueUserBook = new Set(
      bookings.map((eve) => eve.userId._id.toString())
    );
    const totalUniqueUsers = uniqueUserBook.size;

    return res.status(201).json({
      Message: "Booking Fetched Successfully",
      Status: "Success",
      No_of_Bookings: bookings.length,
      totalBookings,
      uniqueUserBook,
      totalUniqueUsers,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const searchFilterEvents = async (req, res, next) => {
  try {
    const {
      querys,
      title,
      location,
      category,
      eventDateFrom,
      eventDateTo,
      minPrice,
      maxPrice,
      price,
      eventDate,
    } = req.query;
    const query = {};
    if (querys) {
      query.$or = [
        {
          title: new RegExp(querys, "i"),
        },
        {
          location: new RegExp(querys, "i"),
        },
        // {
        //   minPrice: new RegExp(querys, "i"),
        // },
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

    if (price) {
      query.price = Number(price);
    }

    // if (price) {
    //   price.$or = [
    //     {
    //       minPrice: new RegExp(minPrice, "i"),
    //     },
    //     {
    //       maxPrice: new RegExp(maxPrice, "i"),
    //     },
    //   ];
    // }
    if (minPrice || maxPrice) {
      query.price = {};

      if (minPrice) {
        query.price.$gte = Number(minPrice); // minimum price
      }

      if (maxPrice) {
        query.price.$lte = Number(maxPrice); // maximum price
      }
    }

    // if (eventDateFrom && eventDateTo) {
    //   query.eventDate = {
    //     $gte: new Date(eventDateFrom),
    //     $lte: new Date(eventDateTo),
    //   };
    // } else if (eventDateFrom) {
    //   query.eventDate = { $gte: new Date(eventDateFrom) };
    // } else if (eventDateTo) {
    //   query.eventDate = { $lte: new Date(eventDateTo) };
    // }

    const events = await eventModel
      .find(query)
      .sort({ eventDate: 1 })
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
  bookTicket,
  singleEvent,
  getEvents,
  getSingleBooking,
  searchFilterEvents,
  getAllBookings,
};
