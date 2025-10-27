const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const cloudinary = require("../CloudinaryConfig/Cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Event Image",
    allowedFormat: ["jpg", "png", "gif", "jpeg"],
    transformation: [{ width: 500, height: 500 }],
  },
});

const uploadEventImage = multer({ storage });
module.exports = uploadEventImage;
