import mongoose from "mongoose";

const TweetSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      max: 280,
    },
    likes: {
      type: Array,
      defaultValue: [],
    },
    audioUrl: {
      type: String,
      default: null,
    },
    audioDuration: {
      type: Number,
      default: null,
    },
    comments: [
      {
        userId: {
          type: String,
          required: true,
        },
        text: {
          type: String,
          required: true,
          max: 280,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Tweet", TweetSchema);
