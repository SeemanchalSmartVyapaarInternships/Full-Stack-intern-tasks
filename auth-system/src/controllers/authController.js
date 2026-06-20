const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const Otp = require("../models/Otp");
const nodemailer = require("nodemailer");
const googleClient = new OAuth2Client();

const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and password are required.",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long.",
    });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "employee",
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: err.errors[0].message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again.",
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        accessToken: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again.",
    });
  }
};

const googleAuth = async (req, res) => {
  const { access_token } = req.body;

  if (!access_token) {
    return res.status(400).json({ success: false, message: "Google access token is required." });
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
    );
    const googleUser = await response.json();

    if (!googleUser.email) {
      return res.status(401).json({ success: false, message: "Failed to get user info from Google." });
    }

    let user = await User.findOne({ where: { email: googleUser.email } });

    if (!user) {
      const randomPassword = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 12);
      user = await User.create({
        name: googleUser.name || googleUser.email.split("@")[0],
        email: googleUser.email,
        password: randomPassword,
        role: "employee",
      });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      success: true,
      message: "Google login successful.",
      data: {
        accessToken: token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Google authentication failed." });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email is required." });

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Clear any existing OTPs for this email
    await Otp.destroy({ where: { email } });

    await Otp.create({ email, otp: otpCode, expiresAt });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP - SmartVyapar",
      text: `Your password reset OTP is ${otpCode}. It expires in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, message: "OTP sent to email." });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ success: false, message: "Failed to send OTP email." });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, message: "Email and OTP are required." });

  try {
    const otpRecord = await Otp.findOne({ where: { email, otp } });
    if (!otpRecord) return res.status(400).json({ success: false, message: "Invalid or expired OTP." });

    if (new Date() > otpRecord.expiresAt) {
      await Otp.destroy({ where: { id: otpRecord.id } });
      return res.status(400).json({ success: false, message: "OTP has expired." });
    }

    // Generate a temporary reset token (valid for 15 mins)
    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "15m" });

    return res.status(200).json({ success: true, message: "OTP verified successfully.", data: { resetToken } });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to verify OTP." });
  }
};

const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;
  if (!resetToken || !newPassword) return res.status(400).json({ success: false, message: "Token and new password required." });
  if (newPassword.length < 6) return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });

  try {
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    const user = await User.findOne({ where: { email: decoded.email } });
    
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    await Otp.destroy({ where: { email: decoded.email } }); // clean up OTPs

    return res.status(200).json({ success: true, message: "Password reset successfully. You can now login." });
  } catch (err) {
    return res.status(400).json({ success: false, message: "Invalid or expired reset token." });
  }
};

module.exports = { register, login, googleAuth, forgotPassword, verifyOtp, resetPassword };
