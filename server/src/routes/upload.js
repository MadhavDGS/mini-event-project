import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import upload from '../middleware/upload.js';
import auth from '../middleware/auth.js';

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    // config cloudinary again to make sure env loaded
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    
    if (!req.file) {
      return res.status(400).json({ message: 'no file uploaded' });
    }
    
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'events' },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(req.file.buffer);
    });
    
    res.json({ imageUrl: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: 'upload failed', error: error.message });
  }
});

export default router;
