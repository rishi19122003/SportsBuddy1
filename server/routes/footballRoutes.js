import express from 'express';
import { 
  createUpdateFootballProfile, 
  getFootballProfile, 
  findFootballPartners 
} from '../controllers/footballController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.route('/profile')
  .post(protect, createUpdateFootballProfile)
  .get(protect, getFootballProfile);

router.get('/partners', protect, findFootballPartners);

export default router; 