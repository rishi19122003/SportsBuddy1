import express from 'express';
import {
  recordInteraction,
  getUserInteractions,
  getUserInteractionMatrix
} from '../controllers/interactionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Record a new interaction
router.post('/', protect, recordInteraction);

// Get user's interactions
router.get('/', protect, getUserInteractions);

// Get user interaction matrix (admin only)
router.get('/matrix', protect, getUserInteractionMatrix);

// Placeholder route for interactions
router.post('/', (req, res) => {
  res.status(200).json({ message: 'Interaction recorded successfully' });
});

export default router; 