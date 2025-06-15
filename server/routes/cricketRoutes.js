import express from 'express';
import { 
  createUpdateCricketProfile, 
  getCricketProfile, 
  findCricketPartners, 
  searchCricketPartners 
} from '../controllers/cricketController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  createMatch,
  getMatches,
  getMatch,
  joinMatch
} from '../controllers/cricketMatchController.js';

const router = express.Router();

// Cricket profile routes
router.route('/profile')
  .post(protect, createUpdateCricketProfile)
  .get(protect, getCricketProfile);

// Cricket partners routes
router.get('/partners', protect, findCricketPartners);
router.post('/partners/search', protect, searchCricketPartners);

// Cricket matches routes
router.post('/matches', protect, createMatch);
router.get('/matches', protect, getMatches);
router.get('/matches/:id', protect, getMatch);
router.post('/matches/:id/join', protect, joinMatch);

export default router; 