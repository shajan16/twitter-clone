import express from "express";
import { sendOTP, verifyOTP } from "../controllers/otp.js";

const router = express.Router();

// Send OTP to user's email
router.post("/send", sendOTP);

// Verify OTP
router.post("/verify", verifyOTP);

export default router;

