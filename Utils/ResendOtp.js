const transporter = require("../NodemailerConfig/nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const sendMail = require("../Utils/ResendSetup");
const resendOtp = async (name, email, OTP) => {
  const companyName = process.env.COMPANY_NAME || "My App";
  const supportEmail =
    process.env.SUPPORT_EMAIL || "support@auraspacegmail.com";
  const year = new Date().getFullYear();
  const htmlContent = `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Your OTP</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;color:#111827;">
    <div style="max-width:600px;margin:24px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 6px 18px rgba(17,24,39,0.08);">
      <div style="padding:20px;text-align:center;background:linear-gradient(90deg,#0ea5e9,#7c3aed);color:#fff;">
        <h2 style="margin:0;font-size:20px;font-weight:600;">Your one-time verification code</h2>
      </div>
      <div style="padding:28px;font-size:16px;line-height:1.5;color:#374151;">
        <p>Hello <strong>${name}</strong>,</p>
         You requested to resend your one-time password (OTP).  
          Please use the code below to continue. It will expire in <strong>30 minutes</strong>.
        <div style="margin:18px 0;text-align:center;">
          <div style="display:inline-block;font-size:28px;letter-spacing:6px;font-weight:700;padding:18px 28px;border-radius:8px;background:#f3f4f6;color:#111827;">
            ${OTP}
          </div>
          <div style="font-size:13px;color:#6b7280;margin-top:8px;">If you didn't request this, please ignore this email.</div>
        </div>
        <p style="margin-top:14px;">Thanks,<br />The ${companyName} team</p>
      </div>
      <div style="padding:18px;text-align:center;font-size:13px;color:#9ca3af;background:#fbfdff;">
        <div>If you need help, contact us at <a href="mailto:${supportEmail}">${supportEmail}</a></div>
        <div style="margin-top:6px;">&copy; ${year} ${companyName}. All rights reserved.</div>
      </div>
    </div>
  </body>
  </html>
  `;

  try {
    const messageInfo = await sendMail({
      to: email,
      subject: `${companyName} - Your Verification Code `,
      html: htmlContent,
    });

    if (messageInfo.success) {
      console.log("OTP has Been Resent, Check Your Gmail");
      return messageInfo;
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = resendOtp;
