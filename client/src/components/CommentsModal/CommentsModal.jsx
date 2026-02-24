import React, { useState, useEffect } from "react";
import axios from "axios";
import formatDistance from "date-fns/formatDistance";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";

const CommentsModal = ({ tweet, onClose, setData }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(tweet.comments || []);
  const [loading, setLoading] = useState(false);
  const [userCache, setUserCache] = useState({});

  // Fetch user data for comments
  useEffect(() => {
    const fetchUsersData = async () => {
      const uniqueUserIds = [...new Set(comments.map((c) => c.userId))];
      const newCache = { ...userCache };

      for (const userId of uniqueUserIds) {
        if (!newCache[userId]) {
          try {
            const userData = await axios.get(`/users/find/${userId}`);
            newCache[userId] = userData.data;
          } catch (err) {
            console.log("Error fetching user:", err);
          }
        }
      }

      setUserCache(newCache);
    };

    if (comments.length > 0) {
      fetchUsersData();
    }
  }, [comments]);

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) return;

    setLoading(true);

    try {
      const response = await axios.post(`/tweets/${tweet._id}/comment`, {
        userId: currentUser._id,
        text: commentText,
      });

      setComments(response.data.comments);
      setCommentText("");

      // Update parent data if needed
      if (setData) {
        // Refresh the tweets list in parent component
        try {
          const newData = await axios.get(`/tweets/timeline/${currentUser._id}`);
          setData(newData.data);
        } catch (err) {
          console.log("Error refreshing tweets:", err);
        }
      }
    } catch (err) {
      console.log("Error adding comment:", err);
      alert("Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      const response = await axios.delete(
        `/tweets/${tweet._id}/comment/${commentId}`,
        {
          data: { userId: currentUser._id },
        }
      );

      setComments(response.data.comments);

      // Update parent data
      if (setData) {
        try {
          const newData = await axios.get(`/tweets/timeline/${currentUser._id}`);
          setData(newData.data);
        } catch (err) {
          console.log("Error refreshing tweets:", err);
        }
      }
    } catch (err) {
      console.log("Error deleting comment:", err);
      alert("Failed to delete comment");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-xl font-bold">Comments</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Comments List */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {comments.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-gray-500 text-center">
                No comments yet. Be the first to comment!
              </p>
            </div>
          ) : (
            comments.map((comment, index) => (
              <div
                key={index}
                className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {userCache[comment.userId] ? (
                      <>
                        <div className="flex items-center space-x-2">
                          <Link to={`/profile/${userCache[comment.userId]._id}`}>
                            <h4 className="font-bold hover:underline">
                              {userCache[comment.userId].username}
                            </h4>
                          </Link>
                          <span className="text-sm text-gray-500">
                            @{userCache[comment.userId].username}
                          </span>
                          <span className="text-sm text-gray-500">
                            · {formatDistance(new Date(comment.createdAt), new Date())}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    )}
                    <p className="mt-2 text-gray-700">{comment.text}</p>
                  </div>

                  {/* Delete button for comment owner */}
                  {comment.userId === currentUser._id && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded transition"
                      title="Delete comment"
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-2xl sticky bottom-0">
          <form onSubmit={handleAddComment} className="space-y-3">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="What do you think?"
              maxLength={280}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="3"
            ></textarea>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {commentText.length}/280
              </span>
              <button
                type="submit"
                disabled={!commentText.trim() || loading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-full flex items-center space-x-2 transition"
              >
                <SendIcon fontSize="small" />
                <span>{loading ? "Posting..." : "Comment"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;
