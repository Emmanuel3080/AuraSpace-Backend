const sendMail = require("../Utils/ResendSetup");
const dotenv = require("dotenv");
dotenv.config();

const confirmEvent = async (name, email, eventDetails) => {
  const companyName = process.env.COMPANY_NAME || "My App";
  const supportEmail =
    process.env.SUPPORT_EMAIL || "support@auraspacegmail.com";
  const year = new Date().getFullYear();
  const { eventName, eventDate, startTime, location, endTime, bookingId } =
    eventDetails;

  const formattedDate = new Date(eventDate).toLocaleDateString([], {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const formatTime = (time) => {
    if (!time) return "Invalid Time";
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formattedTime = formatTime(startTime);
  const formattedEndTime = formatTime(endTime);

  const htmlContent = `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6fa; padding: 40px;">
    <div style=" background-color: #ffffff; border-radius: 12px; box-shadow: 0 6px 18px rgba(0,0,0,0.08); overflow: hidden; border: 1px solid #e6ecf3;">

      

      <!-- Body -->
      <div style="padding: 30px;">
        <h2 style="color: #222; font-weight: 600; margin-bottom: 12px;">Hi ${name},</h2>
        <p style="font-size: 15px; color: #555; line-height: 1.7; margin: 0 0 20px;">
          Thank you for choosing <strong>AuraSpace</strong>! <br/>
          Your booking has been <span style="color: #3b82f6; font-weight: 600;">successfully confirmed</span>.
        </p>

        <h3 style="color: #3b82f6; font-size: 17px; margin: 25px 0 10px;">Event Details</h3>

        <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
          <tr style="background-color: #f9fbff;">
            <td style="padding: 12px 10px; font-weight: 600; color: #333;">Event Name</td>
            <td style="padding: 12px 10px; color: #555;">${eventName}</td>
          </tr>
          <tr>
            <td style="padding: 12px 10px; font-weight: 600; color: #333;">Date</td>
            <td style="padding: 12px 10px; color: #555;">${formattedDate}</td>
          </tr>
          <tr style="background-color: #f9fbff;">
            <td style="padding: 12px 10px; font-weight: 600; color: #333;">Start Time</td>
            <td style="padding: 12px 10px; color: #555;">${formattedTime}</td>
          </tr>
          <tr>
            <td style="padding: 12px 10px; font-weight: 600; color: #333;">End Time</td>
            <td style="padding: 12px 10px; color: #555;">${formattedEndTime}</td>
          </tr>
          <tr style="background-color: #f9fbff;">
            <td style="padding: 12px 10px; font-weight: 600; color: #333;">Location</td>
            <td style="padding: 12px 10px; color: #555;">${location}</td>
          </tr>
          <tr>
            <td style="padding: 12px 10px; font-weight: 600; color: #333;">Booking ID</td>
            <td style="padding: 12px 10px; color: #555;">${bookingId}</td>
          </tr>
        </table>

        <div style="margin-top: 25px; background-color: #eaf2ff; padding: 16px; border-left: 4px solid #3b82f6; border-radius: 6px;">
          <p style="margin: 0; color: #444; font-size: 14.5px;">
            Please bring your <strong>Booking ID</strong> or attached <strong>QR Code</strong> to gain entry at the event venue.
          </p>
        </div>

        <p style="margin-top: 25px; color: #555; font-size: 15px;">
          We can’t wait to welcome you to <strong>${eventName}</strong>! 🌟
        </p>

        <div style="text-align: center; margin-top: 35px;">
          <a href="https://aura-space-frontend.vercel.app/tickets/${bookingId}" style="display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 12px 26px; border-radius: 6px; font-weight: 600; font-size: 15px; letter-spacing: 0.3px;">
            View My Ticket
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #f8f9fb; text-align: center; padding: 18px; color: #999; font-size: 13px; border-top: 1px solid #eee;">
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} AuraSpace Events. All Rights Reserved.</p>
      </div>
    </div>
  </div>
`;

  try {
    const response = await sendMail({
      from: "onboarding@resend.dev",
      to: email,
      subject: `Booking Confirmation ${eventName}`,
      html: htmlContent,
    });

    if (response.success) {
      console.log(`✅ Booking confirmation email sent to: ${email}`);
    } else {
      console.error(
        `❌ Failed to send booking email to: ${email}`,
        response.error
      );
    }

    return response;
  } catch (error) {
    console.error("Error sending booking confirmation:", error);
    return { success: false, error };
  }
};

module.exports = confirmEvent;
