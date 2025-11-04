const nodemailer = require("nodemailer");

const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    pass: process.env.GOOGLE_PASS,
    user: process.env.GOOGLE_EMAIL,
  },
});    
     
transporter.verify((err, success) => {
  if (!success) {
    console.log(err);
  } else {
    console.log("Email Ready to be sent");
  }    
});     

module.exports = transporter;
                                   