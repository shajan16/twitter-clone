import express from "express";
import {
  createTweet,
  deleteTweet,
  likeOrDislike,
  getAllTweets,
  getUserTweets,
  getExploreTweets,
  addComment,
  deleteComment,
} from "../controllers/tweet.js";
import { uploadAudioTweet, upload } from "../controllers/audio.js";

const router = express.Router();

// Create a Tweet
router.post("/", createTweet);

// Create an Audio Tweet
router.post("/audio", upload.single("audio"), uploadAudioTweet);

// Delete a Tweet
router.delete("/:id", deleteTweet);

// Like or Dislike a Tweet
router.put("/:id/like", likeOrDislike);

// Add a comment
router.post("/:id/comment", addComment);

// Delete a comment
router.delete("/:tweetId/comment/:commentId", verifyToken, deleteComment);

// get all timeline tweets
router.get("/timeline/:id", getAllTweets);

// get user Tweets only
router.get("/user/all/:id", getUserTweets);

//explore
router.get("/explore", getExploreTweets);
export default router;
