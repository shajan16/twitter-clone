import User from "../models/User.js";
import { handleError } from "../error.js";
import nodemailer from "nodemailer";


const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create email transporter
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error(
      "EMAIL_USER and EMAIL_PASS must be set in environment variables"
    );
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendOTP = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return next(handleError(400, "User ID is required"));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(handleError(404, "User not found"));
    }

    if (!user.email) {
      return next(handleError(400, "User email not found"));
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP with expiration (5 minutes)
    otpStore.set(userId, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    });

    // Send OTP via email
    try {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Audio Tweet OTP Verification",
        html: `
          <h2>Your OTP for Audio Tweet Upload</h2>
          <p>Your OTP is: <strong>${otp}</strong></p>
          <p>This OTP will expire in 5 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      });

      res.status(200).json({ message: "OTP sent to your email" });
    } catch (emailError) {
      console.error("Email error:", emailError);
      return next(handleError(500, "Failed to send OTP email"));
    }
  } catch (err) {
    next(err);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return next(handleError(400, "User ID and OTP are required"));
    }

    const storedData = otpStore.get(userId);

    if (!storedData) {
      return next(handleError(400, "OTP not found. Please request a new OTP"));
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(userId);
      return next(handleError(400, "OTP has expired. Please request a new OTP"));
    }

    if (storedData.otp !== otp) {
      return next(handleError(400, "Invalid OTP"));
    }

    // OTP verified successfully - store verification token (valid for 10 minutes)
    otpStore.set(userId, {
      ...storedData,
      verified: true,
      verifiedAt: Date.now(),
      verificationExpiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    next(err);
  }
};

// Check if OTP is verified for a user
export const isOTPVerified = (userId) => {
  const storedData = otpStore.get(userId);
  if (!storedData || !storedData.verified) {
    return false;
  }
  if (Date.now() > storedData.verificationExpiresAt) {
    otpStore.delete(userId);
    return false;
  }
  return true;
};

// Clean up expired OTPs (call this periodically)
export const cleanupExpiredOTPs = () => {
  const now = Date.now();
  for (const [userId, data] of otpStore.entries()) {
    const expiryTime = data.verificationExpiresAt || data.expiresAt;
    if (now > expiryTime) {
      otpStore.delete(userId);
    }
  }
};

// Run cleanup every 5 minutes
setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);

