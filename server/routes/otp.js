import express from "express";
import { sendOTP, verifyOTP } from "../controllers/otp.js";
import { verifyToken } from "../verifyToken.js";

const router = express.Router();

// Send OTP to user's email
router.post("/send", verifyToken, sendOTP);

// Verify OTP
router.post("/verify", verifyToken, verifyOTP);

export default router;

