import { uploadToCloudinary } from '../cloudinary.js';
import { handleError } from '../error.js';

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary configuration missing');
      return res.status(500).json({ message: 'Image upload service not configured' });
    }

    const result = await uploadToCloudinary(req.file.buffer, 'twitter-clone', req.file.mimetype);
    
    res.status(200).json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (err) {
    console.error('Image upload error:', err);
    const errorMessage = err.message || 'Failed to upload image';
    return res.status(500).json({ message: errorMessage });
  }
};

