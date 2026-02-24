import axios from "axios";
import React, { useState } from "react";
import formatDistance from "date-fns/formatDistance";

import { useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import CommentsModal from "../CommentsModal/CommentsModal";
import Avatar from "../Avatar/Avatar";

const Tweet = ({ tweet, setData }) => {
  const { currentUser } = useSelector((state) => state.user);

  const [userData, setUserData] = useState();
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  const dateStr = formatDistance(new Date(tweet.createdAt), new Date());
  const location = useLocation().pathname;
  const { id } = useParams();

  console.log(location);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const findUser = await axios.get(`/users/find/${tweet.userId}`);

        setUserData(findUser.data);
      } catch (err) {
        console.log("error", err);
      }
    };

    fetchData();
  }, [tweet.userId, tweet.likes]);

  const handleLike = async (e) => {
    e.preventDefault();

    try {
      const like = await axios.put(`/tweets/${tweet._id}/like`, {
        id: currentUser._id,
      });

      if (location.includes("profile")) {
        const newData = await axios.get(`/tweets/user/all/${id}`);
        setData(newData.data);
      } else if (location.includes("explore")) {
        const newData = await axios.get(`/tweets/explore`);
        setData(newData.data);
      } else {
        const newData = await axios.get(`/tweets/timeline/${currentUser._id}`);
        setData(newData.data);
      }
    } catch (err) {
      console.log("error", err);
    }
  };

  return (
    <div>
      {userData && (
        <>
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* User Info Header */}
            <div className="flex items-start space-x-3 mb-3">
              <Link to={`/profile/${userData._id}`}>
                <Avatar user={userData} size="w-10 h-10" className="hover:opacity-80 transition-opacity" />
              </Link>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1 mb-1">
                  <Link to={`/profile/${userData._id}`}>
                    <h3 className="font-bold text-gray-900 hover:underline truncate">
                      {userData.username}
                    </h3>
                  </Link>
                  <span className="text-gray-500 text-sm truncate">
                    @{userData.username}
                  </span>
                  <span className="text-gray-500 text-sm">·</span>
                  <span className="text-gray-500 text-sm">{dateStr}</span>
                </div>
              </div>
            </div>

            {/* Tweet Content */}
            <div className="mb-4">
              <p className="text-gray-900 text-base leading-relaxed whitespace-pre-wrap break-words">
                {tweet.description}
              </p>
            </div>
            
            {/* Audio Content */}
            {tweet.audioUrl && (
              <div className="my-4 bg-gray-50 rounded-lg p-3 border border-gray-200">
                <audio
                  controls
                  src={`http://localhost:8000${tweet.audioUrl}`}
                  className="w-full h-10 rounded"
                >
                  Your browser does not support the audio element.
                </audio>
                {tweet.audioDuration && (
                  <p className="text-xs text-gray-500 mt-2 flex items-center">
                    <span className="mr-1">🎵</span>
                    Duration: {Math.floor(tweet.audioDuration / 60)}:
                    {String(Math.floor(tweet.audioDuration % 60)).padStart(2, "0")}
                  </p>
                )}
              </div>
            )}

            {/* Interaction Buttons */}
            <div className="flex items-center justify-between max-w-md pt-3 border-t border-gray-100">
              {/* Comments Button */}
              <button
                onClick={() => setShowCommentsModal(true)}
                className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors duration-200 group rounded-full p-2 hover:bg-blue-50"
              >
                {tweet.comments && tweet.comments.length > 0 ? (
                  <>
                    <ChatBubbleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">{tweet.comments.length}</span>
                  </>
                ) : (
                  <>
                    <ChatBubbleOutlineIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">0</span>
                  </>
                )}
              </button>

              {/* Likes Button */}
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 transition-colors duration-200 group rounded-full p-2 ${
                  tweet.likes.includes(currentUser._id)
                    ? 'text-red-500 hover:bg-red-50'
                    : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                {tweet.likes.includes(currentUser._id) ? (
                  <>
                    <FavoriteIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">{tweet.likes.length}</span>
                  </>
                ) : (
                  <>
                    <FavoriteBorderIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">{tweet.likes.length}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Comments Modal */}
          {showCommentsModal && (
            <CommentsModal
              tweet={tweet}
              onClose={() => setShowCommentsModal(false)}
              setData={setData}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Tweet;
