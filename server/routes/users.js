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

const router = express.Router();

// Update User
router.put("/:id", update);

// Get All Users
router.get("/all", getAllUsers);

// Get User
router.get("/find/:id", getUser);

// Delete User
router.delete("/:id", deleteUser);

// Follow
router.put("/follow/:id", follow);

// Unfollow
router.put("/unfollow/:id", unFollow);

// Upload Image
router.post("/upload-image", upload.single('image'), uploadImage);

export default router;
