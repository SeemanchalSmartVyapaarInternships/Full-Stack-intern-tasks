// ============================================================
// Email Utility — Nodemailer SMTP Transport
// ============================================================

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an OTP email.
 * @param {string} to - Recipient email
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise}
 */
async function sendOtpEmail(to, otp) {
  const mailOptions = {
    from: `"Auth System" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Password Reset OTP — Auth System',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 16px; border: 1px solid #eee;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 40px;">🔐</span>
          <h2 style="margin: 12px 0 4px; color: #1a1a2e; font-size: 22px;">Password Reset Request</h2>
          <p style="color: #5a5a7a; font-size: 14px; margin: 0;">Use the code below to reset your password</p>
        </div>
        <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #fff5eb, #fff0e0); border-radius: 12px; margin: 20px 0;">
          <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #ff6b00;">${otp}</span>
        </div>
        <p style="color: #5a5a7a; font-size: 13px; text-align: center; margin-top: 16px;">
          This code expires in <strong>10 minutes</strong>. If you didn't request this, ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #8a8aaa; font-size: 11px; text-align: center;">Auth System — Secure Authentication</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendOtpEmail };
