import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SearchIcon from "@mui/icons-material/Search";
import { following } from "../../redux/userSlice";
import Avatar from "../Avatar/Avatar";

const RightSidebar = () => {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();


  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {

        const response = await axios.get("/users/all");
        const allUsers = response.data || [];
        
        
        const filtered = allUsers
          .filter(
            (user) =>
              user._id !== currentUser?._id &&
              !currentUser?.following?.includes(user._id)
          )
          .slice(0, 3); 
        
        setSuggestedUsers(filtered);
      } catch (err) {
        console.log("Error fetching suggested users:", err);
        setSuggestedUsers([]);
      }
    };

    if (currentUser) {
      fetchSuggestedUsers();
    }
  }, [currentUser]);

  const handleFollow = async (userId) => {
    if (!currentUser.following.includes(userId)) {
      try {
        await axios.put(`/users/follow/${userId}`, {
          id: currentUser._id,
        });
        dispatch(following(userId));
        // Remove from suggestions after following
        setSuggestedUsers(suggestedUsers.filter((user) => user._id !== userId));
      } catch (err) {
        console.log("Error following user:", err);
      }
    }
  };


  return (
    <div className="space-y-4 md:fixed">

      {/* Who to Follow */}
      {suggestedUsers.length > 0 && (
        <div className="bg-gray-50 rounded-2xl overflow-hidden">
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Who to follow</h2>
            <div className="space-y-4">
              {suggestedUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between hover:bg-gray-100 p-2 rounded-lg transition-colors"
                >
                  <div
                    className="flex items-center space-x-3 cursor-pointer"
                    onClick={() => navigate(`/profile/${user._id}`)}
                  >
                    <Avatar user={user} size="w-10 h-10" />
                    <div>
                      <p className="font-bold text-sm">{user.username}</p>
                      <p className="text-xs text-gray-500">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleFollow(user._id)}
                    className="px-4 py-1.5 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-colors"
                  >
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer Links */}
      <div className="text-xs text-gray-500 px-4">
        <div className="flex flex-wrap gap-2">
          <span className="hover:underline cursor-pointer">Terms of Service</span>
          <span className="hover:underline cursor-pointer">Privacy Policy</span>
          <span className="hover:underline cursor-pointer">Cookie Policy</span>
          <span className="hover:underline cursor-pointer">Accessibility</span>
        </div>
        <p className="mt-2">© 2026 Twitter Clone by Shajan!</p>
      </div>
    </div>
  );
};

export default RightSidebar;
