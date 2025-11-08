// const

const mongoose = require("mongoose");
// const { validate } = require("./userModel");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      required: true,
    },

    eventDate: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,                                  
    },
    eventDuration: {
      type: String,
      required: true,
      default: 0,
    },
    location: {
      type: String,
      required: true,
    },

    // meetingLink: {
    //   type: String,
    //   validate: {
    //     validator: function (value) {
    //       if (this.eventMode == "online") {
    //         return !!value;
    //       }
    //       return !value;
    //     },
    //     message:
    //       "Meeting link is required only for online events and must be empty for physical events",
    //   },
    // },
    // eventMode: {
    //   type: String,
    //   required: true,
    //   enum: ["online", "physical"],
    // },
    Attendees: {
      type: Number,
      default: 0,
      // required: true,
    },

    status: {
      type: String,
      enum: ["cancelled", "completed", "published", "almostFull"],
      default: "published",
    },
    //   priceCategory: {
    //   type: String,
    //   enum: ["paid", "free"],
    //   default: "free",
    // },
    TotalAmount: {  
      type: Number,
      default: 0,
    },
    price: {  
      type: Number,
      // validate: {
      //   validator: function (value) {
      //     if (this.priceCategory === "paid") return value > 0;
      //     return value === 0;
      //   },
      //   message: function () {
      //     if (this.priceCategory === "paid") {
      //       return "Price is required and must be greater than 0 for paid events.";
      //     }
      //     return "Price must be 0 for free events.";
      //   },
      // },
      default: 0,
    },

    TicketsAvailable: {
      type: Number,
      required: true,
    },
    TicketsSold: {
      type: Number,
      default: 0,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUsers",
    },
  },
  { timestamps: true }
);

const eventModel = mongoose.model("event", eventSchema);
module.exports = eventModel;

// eventId (PK)

// title
// description
// category
// venue / address / city
// startDate / endDate / timeZone
// isVirtual, meetingLink
// coverImage, gallery
// capacity
// status (draft | published | cancelled | completed)
// createdBy (FK → Users.userId)
// createdAt, updatedAt
