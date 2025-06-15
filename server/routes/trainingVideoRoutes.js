import express from 'express';
import multer from 'multer';
import { storage } from '../config/cloudinary.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  createTrainingVideo,
  getTrainingVideos,
  getTrainingVideo,
  likeTrainingVideo,
  commentOnTrainingVideo,
  deleteTrainingVideo
} from '../controllers/trainingVideoController.js';

const router = express.Router();

// Configure multer with Cloudinary storage
const upload = multer({ 
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only video files
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  }
});

router.route('/')
  .post(protect, upload.single('video'), createTrainingVideo)
  .get(protect, getTrainingVideos);

router.route('/:id')
  .get(protect, getTrainingVideo)
  .delete(protect, deleteTrainingVideo);

router.route('/:id/like')
  .post(protect, likeTrainingVideo);

router.route('/:id/comment')
  .post(protect, commentOnTrainingVideo);

export default router; 