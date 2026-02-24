import multer from "multer";
import path from "path";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { handleError } from "../error.js";
import { isOTPVerified } from "./otp.js";
import Tweet from "../models/Tweet.js";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/audio";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `audio-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Accept audio files
  const allowedMimes = [
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/ogg",
    "audio/webm",
    "audio/m4a",
    "audio/aac",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only audio files are allowed."), false);
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB
  },
  fileFilter: fileFilter,
});

// Get audio duration using ffmpeg
const getAudioDuration = (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          // If ffmpeg is not installed or file cannot be processed
          console.error("FFmpeg error:", err);
          reject(
            new Error(
              "Failed to process audio file. Please ensure ffmpeg is installed on the server."
            )
          );
        } else {
          const duration = metadata.format.duration; // in seconds
          if (!duration || isNaN(duration)) {
            reject(new Error("Could not determine audio duration"));
          } else {
            resolve(duration);
          }
        }
      });
    } catch (error) {
      reject(
        new Error(
          "FFmpeg is not available. Please install ffmpeg on the server to use audio tweet features."
        )
      );
    }
  });
};

export const uploadAudioTweet = async (req, res, next) => {
  try {
    const { userId, description } = req.body;

    if (!userId) {
      return next(handleError(400, "User ID is required"));
    }

    if (!description || description.trim() === "") {
      return next(handleError(400, "Description is required"));
    }

    // Check OTP verification
    if (!isOTPVerified(userId)) {
      return next(
        handleError(403, "OTP verification required. Please verify your OTP first.")
      );
    }

    if (!req.file) {
      return next(handleError(400, "Audio file is required"));
    }

    const filePath = req.file.path;
    const fileSize = req.file.size;

    // Check file size (100 MB)
    const maxSize = 100 * 1024 * 1024; // 100 MB
    if (fileSize > maxSize) {
      // Delete uploaded file
      fs.unlinkSync(filePath);
      return next(handleError(400, "Audio file size exceeds 100 MB limit"));
    }

    // Get audio duration
    let duration;
    try {
      duration = await getAudioDuration(filePath);
    } catch (err) {
      // Delete uploaded file if duration check fails
      fs.unlinkSync(filePath);
      return next(handleError(400, "Failed to process audio file"));
    }

    // Check duration (5 minutes = 300 seconds)
    const maxDuration = 5 * 60; // 5 minutes in seconds
    if (duration > maxDuration) {
      // Delete uploaded file
      fs.unlinkSync(filePath);
      return next(
        handleError(400, "Audio duration exceeds 5 minutes limit")
      );
    }

    // Create tweet with audio
    const audioUrl = `/uploads/audio/${req.file.filename}`;
    const newTweet = new Tweet({
      userId,
      description,
      audioUrl,
      audioDuration: Math.round(duration),
    });

    const savedTweet = await newTweet.save();
    res.status(200).json(savedTweet);
  } catch (err) {
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error("Error deleting file:", unlinkErr);
      }
    }
    next(err);
  }
};

