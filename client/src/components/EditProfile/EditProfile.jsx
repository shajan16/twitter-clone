import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";

import { changeProfile, logout, updateNotifications } from "../../redux/userSlice";
import { useNavigate } from "react-router-dom";
import { requestNotificationPermission } from "../../utils/notifications";

const EditProfile = ({ setOpen }) => {
  const { currentUser } = useSelector((state) => state.user);

  const [img, setImg] = useState(null);
  const [imgUploadProgress, setImgUploadProgress] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const uploadImg = async (file) => {
    try {
      setImgUploadProgress(0);
      
      const formData = new FormData();
      formData.append('image', file);

      // Upload to Cloudinary via server
      const uploadResponse = await axios.post('/users/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setImgUploadProgress(progress);
        },
      });

      const downloadURL = uploadResponse.data.url;

      // Update user profile with the image URL
      const updateProfile = await axios.put(`/users/${currentUser._id}`, {
        profilePicture: downloadURL,
      });

      console.log(updateProfile);
      console.log("Uploaded to Cloudinary: " + downloadURL);
      dispatch(changeProfile(downloadURL));
      setImgUploadProgress(0);
    } catch (error) {
      console.error('Upload error:', error);
      setImgUploadProgress(0);
      const errorMessage =  'Failed to upload image. Please try again.';
      alert(errorMessage);
    }
  };

  const handleDelete = async () => {
    const deleteProfile = await axios.delete(`/users/${currentUser._id}`);
    dispatch(logout());
    navigate("/signin");
  };

  const handleNotificationToggle = async (e) => {
    const enabled = e.target.checked;
    
    // If enabling, request browser permission first
    if (enabled) {
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        alert("Please enable notifications in your browser settings to receive tweet alerts.");
        return;
      }
    }

    try {
      const updateUser = await axios.put(`/users/${currentUser._id}`, {
        notificationsEnabled: enabled,
      });
      dispatch(updateNotifications(enabled));
    } catch (error) {
      console.log("Error updating notification preference:", error);
      alert("Failed to update notification preference. Please try again.");
    }
  };

  useEffect(() => {
    img && uploadImg(img);
  }, [img]);

  return (
    <div className="absolute w-full h-full top-0 left-0 bg-transparent flex items-center justify-center">
      <div className="w-[600px] h-[600px] bg-slate-200 rounded-lg p-8 flex flex-col gap-4 relative">
        <button
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 cursor-pointer"
        >
          X
        </button>
        <h2 className="font-bold text-xl">Edit Profile</h2>
        <p>Choose a new profile picture</p>
        {imgUploadProgress > 0 ? (
          "Uploading " + imgUploadProgress + "%"
        ) : (
          <input
            type="file"
            className="bg-transparent border border-slate-500 rounded p-2"
            accept="image/*"
            onChange={(e) => setImg(e.target.files[0])}
          />
        )}

        <div className="mt-4">
          <h3 className="font-semibold mb-2">Notifications</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={currentUser?.notificationsEnabled || false}
              onChange={handleNotificationToggle}
              className="w-5 h-5 cursor-pointer"
            />
            <span>Enable notifications for tweets containing "cricket" or "science"</span>
          </label>
        </div>

        <p className="mt-4">Delete Account</p>
        <button
          className="bg-red-500 text-white py-2 rounded-full"
          onClick={handleDelete}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default EditProfile;
