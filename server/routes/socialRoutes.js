import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  sendMessage,
  getMessages,
  getConversations,
  sendFriendRequest,
  getFriendRequests,
  getSentFriendRequests,
  respondToFriendRequest,
  getFriends,
  removeFriend
} from '../controllers/socialController.js';
import FriendRequest from '../models/FriendRequest.js';

const router = express.Router();

// Message routes
router.get('/messages/conversations', protect, getConversations);
router.get('/messages/:userId', protect, getMessages);
router.post('/messages', protect, sendMessage);

// Friend request routes
router.post('/friends/request', protect, sendFriendRequest);
router.get('/friends/requests', protect, getFriendRequests);
router.get('/friends/requests/sent', protect, getSentFriendRequests);
router.put('/friends/request/:requestId', protect, respondToFriendRequest);
router.get('/friends', protect, getFriends);
router.delete('/friends/:friendId', protect, removeFriend);
router.delete('/friends/request/:requestId', protect, async (req, res) => {
  try {
    const request = await FriendRequest.findOneAndDelete({
      _id: req.params.requestId,
      sender: req.user._id,
      status: 'pending'
    });

    if (!request) {
      return res.status(404).json({ message: 'Friend request not found or already processed' });
    }

    res.json({ message: 'Friend request cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling friend request:', error);
    res.status(500).json({ message: 'Error cancelling friend request' });
  }
});

// Basic route for testing
router.get('/test', protect, (req, res) => {
    res.json({ message: 'Social routes are working' });
});

// Add your social routes here
// Example:
// router.post('/post', protect, createPost);
// router.get('/posts', protect, getPosts);
// router.put('/post/:id', protect, updatePost);
// router.delete('/post/:id', protect, deletePost);

export default router; 