const transporter = require("../NodemailerConfig/nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const sendMail = require("../Utils/ResendSetup");
const { response } = require("express");

const AdminEventsBooking = async (
  name,
  email,
  buyerEmail,
  eventTitle,
  eventLocation
) => {
  const htmlContent = `
          <div style="font-family: 'Segoe UI', sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
            <div style="background: #4F46E5; color: #fff; padding: 20px 25px;">
              <h2 style="margin: 0;">New Ticket Purchase Alert</h2>
            </div>
    
            <div style="padding: 25px;">
              <p>Hello Admin,</p>
              <p>A new ticket has just been purchased for your event <strong>${eventTitle}</strong>.</p>
    
              <h3 style="margin-top: 25px;">Event Details</h3>
              <ul style="line-height: 1.6; list-style: none; padding-left: 0;">
                <li><strong>Event Title:</strong> ${eventTitle}</li>
                <li><strong>Location:</strong> ${eventLocation}</li>
              </ul>
    
              <h3 style="margin-top: 25px;">Buyer Information</h3>
              <ul style="line-height: 1.6; list-style: none; padding-left: 0;">
                <li><strong>Name:</strong> ${name}</li>
                <li><strong>Name:</strong> ${buyerEmail}</li>
              </ul>
    
              <p style="margin-top: 20px;">Please log in to your 
                <a href="http://localhost:5173/dashboard" style="color: #4F46E5; text-decoration: none; font-weight: 600;">
                  admin dashboard
                </a> 
                for more details.
              </p>
    
              <p style="margin-top: 30px;">Thank you for using <strong>AuraSpace Events</strong>.</p>
            </div>
    
            <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 13px; color: #666;">
              <p>© ${new Date().getFullYear()} AuraSpace. All rights reserved.</p>
            </div>
          </div>
        `;

  try {
    const eventInfo = await sendMail({
      to: email,
      subject: `🎟️ New Ticket Purchase – ${eventTitle}`,
      html: htmlContent,
    });

    if (eventInfo.success) {
      console.log(
        `✅ Admin notified: ${name} purchased ticket for "${eventTitle}" at ${eventLocation}`
      );
    } else {
      console.error(
        `❌ Failed to send booking email to: ${email}`,
        eventInfo.success
      );
    }

    return response;
  } catch (error) {
    console.error("❌ Error sending admin notification email:", error);
  }
};

module.exports = AdminEventsBooking;
