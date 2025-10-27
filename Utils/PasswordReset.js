const transporter = require("../NodemailerConfig/nodemailer");
const dotenv = require("dotenv");
dotenv.config();
const passwordReset = async (name, email, OTP) => {
  const companyName = process.env.COMPANY_NAME || "My App";
  const supportEmail =
    process.env.SUPPORT_EMAIL || "support@auraspacegmail.com";
  const year = new Date().getFullYear();
  let html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:20px;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:600px;margin:auto;background:#fff;padding:25px;border-radius:10px;box-shadow:0 6px 16px rgba(0,0,0,0.08);">
        <h2 style="color:#c0392b;margin-bottom:10px; text-align:"center;">Password Reset Request</h2>
        <p style="font-size:14px;color:#444;margin-bottom:20px;">
          Hi <strong>${name}</strong>,<br><br>
          We received a request to reset your account password.<br>
          Use the OTP below to continue. This code will expire in <strong>30 Minutes</strong>.
        </p>
        <div style="text-align:center;margin:20px 0;">
          <span style="display:inline-block;background:#fdecea;border:1px dashed #e74c3c;padding:15px 30px;border-radius:8px;font-size:26px;letter-spacing:4px;font-weight:bold;color:#c0392b;">
            ${OTP}
          </span>
        </div>
        <p style="font-size:14px;color:#444;margin-bottom:20px;">
          If you didn’t request a password reset, please ignore this email or contact our support team immediately.
        </p>
          <div style="padding:18px;text-align:center;font-size:13px;color:#9ca3af;background:#fbfdff;">
        <div>If you need help, contact us at <a href="mailto:${supportEmail}">${supportEmail}</a></div>
        <div style="margin-top:6px;">&copy; ${year} ${companyName}. All rights reserved.</div>
      </div>
      </div>
    </body>
    </html>
  `;
  try {
    const messageInfo = await transporter.sendMail({   
      to: email,
      from: `${companyName} <${supportEmail}>`,
      subject: `${companyName} - Your Verification Code `,
      html,
    });

    if (messageInfo) {
      console.log("OTP Sent , Check your gmail");
      return messageInfo;
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = passwordReset;
       