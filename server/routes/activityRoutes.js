import express from 'express';
import { getRecentActivities, getUserActivities } from '../controllers/activityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get recent activities
router.get('/recent', protect, getRecentActivities);

// Get user's activities
router.get('/user', protect, getUserActivities);

export default router; 