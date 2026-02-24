import React, { useState } from "react";
import TimelineTweet from "../TimelineTweet/TimelineTweet";
import AudioUpload from "../AudioUpload/AudioUpload";
import Avatar from "../Avatar/Avatar";

import { useSelector } from "react-redux";
import axios from "axios";

const MainTweet = () => {
  const [tweetText, setTweetText] = useState("");
  const [showAudioUpload, setShowAudioUpload] = useState(false);

  const { currentUser } = useSelector((state) => state.user);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitTweet = await axios.post("/tweets", {
        userId: currentUser._id,
        description: tweetText,
      });
      window.location.reload(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
      {currentUser && (
        <div className="flex items-center space-x-3 mb-4">
          <Avatar user={currentUser} size="w-10 h-10" />
          <p className="font-bold text-gray-900">{currentUser.username}</p>
        </div>
      )}

      {!showAudioUpload ? (
        <form className="space-y-4">
          <textarea
            onChange={(e) => setTweetText(e.target.value)}
            type="text"
            placeholder="What's happening?"
            maxLength={280}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            rows={3}
          />
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {tweetText.length}/280
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setShowAudioUpload(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-full transition-colors duration-200 flex items-center space-x-2"
              >
                <span>🎤</span>
                <span>Audio</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={!tweetText.trim()}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-6 rounded-full transition-colors duration-200 font-medium"
              >
                Tweet
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-gray-900">Create Audio Tweet</h3>
            <button
              onClick={() => setShowAudioUpload(false)}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>
          </div>
          <AudioUpload
            onUploadSuccess={() => {
              setShowAudioUpload(false);
            }}
          />
        </div>
      )}

      <TimelineTweet />
    </div>
  );
};

export default MainTweet;
