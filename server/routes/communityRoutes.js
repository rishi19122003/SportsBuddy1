import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createClub,
  getClubs,
  joinClub,
  createPost,
  getPosts,
  likePost,
  commentOnPost,
  deletePost,
} from '../controllers/communityController.js';

const router = express.Router();

// Club routes
router.route('/clubs').post(protect, createClub).get(protect, getClubs);
router.route('/clubs/:id/join').post(protect, joinClub);

// Post routes
router.route('/posts').post(protect, createPost).get(protect, getPosts);
router.route('/posts/:postId/like').post(protect, likePost);
router.route('/posts/:postId/comment').post(protect, commentOnPost);
router.route('/posts/:postId').delete(protect, deletePost);

export default router; 