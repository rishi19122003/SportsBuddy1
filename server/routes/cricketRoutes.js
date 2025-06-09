import express from 'express';
import { 
  createUpdateCricketProfile, 
  getCricketProfile, 
  findCricketPartners, 
  searchCricketPartners 
} from '../controllers/cricketController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.route('/profile')
  .post(protect, createUpdateCricketProfile)
  .get(protect, getCricketProfile);

router.get('/partners', protect, findCricketPartners);

router.post('/partners/search', protect, searchCricketPartners);

// Placeholder route for cricket profiles
router.get('/profile', (req, res) => {
  res.status(404).json({ message: 'Cricket profile not found' });
});

// Placeholder route for cricket partners
router.get('/partners', (req, res) => {
  res.status(200).json({ 
    partners: [] 
  });
});

export default router; 