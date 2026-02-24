import express from "express";
import {
  getUser,
  getAllUsers,
  update,
  deleteUser,
  follow,
  unFollow,
} from "../controllers/user.js";
import { uploadImage } from "../controllers/image.js";
import { upload } from "../cloudinary.js";
import { verifyToken } from "../verifyToken.js";

const router = express.Router();

// Update User
router.put("/:id", verifyToken, update);

// Get All Users
router.get("/all", getAllUsers);

// Get User
router.get("/find/:id", getUser);

// Delete User
router.delete("/:id", verifyToken, deleteUser);

// Follow
router.put("/follow/:id", verifyToken, follow);

// Unfollow
router.put("/unfollow/:id", verifyToken, unFollow);

// Upload Image
router.post("/upload-image", verifyToken, upload.single('image'), uploadImage);

export default router;
