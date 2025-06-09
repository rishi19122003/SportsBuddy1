import User from '../models/User.js';
import Message from '../models/Message.js';
import FriendRequest from '../models/FriendRequest.js';
import mongoose from 'mongoose';

// Message Controllers
export const sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    
    if (!recipientId || !content) {
      return res.status(400).json({ message: 'Please provide recipient and message content' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    const message = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      content
    });

    await message.populate('sender', 'name email profilePicture');
    await message.populate('recipient', 'name email profilePicture');

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: userId },
        { sender: userId, recipient: req.user._id }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'name email profilePicture')
    .populate('recipient', 'name email profilePicture');

    res.json(messages);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ message: 'Error getting messages' });
  }
};

export const getConversations = async (req, res) => {
  try {
    // Find all messages where user is either sender or recipient
    const messages = await Message.find({
      $or: [
        { sender: req.user._id },
        { recipient: req.user._id }
      ]
    }).sort({ createdAt: -1 });

    // Get unique users from conversations
    const conversationUsers = new Set();
    messages.forEach(msg => {
      const otherUserId = msg.sender.toString() === req.user._id.toString() 
        ? msg.recipient.toString() 
        : msg.sender.toString();
      conversationUsers.add(otherUserId);
    });

    // Get user details for each conversation
    const conversations = await User.find({
      _id: { $in: Array.from(conversationUsers) }
    }).select('name email profilePicture');

    res.json(conversations);
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ message: 'Error getting conversations' });
  }
};

// Friend Request Controllers
export const sendFriendRequest = async (req, res) => {
  try {
    const { recipientId } = req.body;
    console.log('Attempting to send friend request:', {
      sender: req.user._id,
      recipient: recipientId,
      body: req.body
    });

    if (!recipientId) {
      console.log('No recipient ID provided');
      return res.status(400).json({ message: 'Please provide recipient ID' });
    }

    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      console.log('Invalid recipient ID format');
      return res.status(400).json({ message: 'Invalid recipient ID format' });
    }

    // Check if sender and recipient are the same
    if (req.user._id.toString() === recipientId) {
      console.log('Cannot send friend request to yourself');
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      console.log('Recipient not found:', recipientId);
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Check if users are already friends
    const sender = await User.findById(req.user._id);
    if (sender.friends.some(friendId => friendId.toString() === recipientId)) {
      console.log('Users are already friends');
      return res.status(400).json({ message: 'Users are already friends' });
    }

    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: req.user._id, recipient: recipientId, status: 'pending' },
        { sender: recipientId, recipient: req.user._id, status: 'pending' }
      ]
    });

    if (existingRequest) {
      console.log('Friend request already exists:', existingRequest);
      return res.status(400).json({ message: 'Friend request already exists' });
    }

    // Create new friend request
    const request = new FriendRequest({
      sender: req.user._id,
      recipient: recipientId,
      status: 'pending'
    });

    console.log('Creating new friend request:', request);
    
    try {
      await request.save();
      console.log('Friend request saved successfully');
    } catch (saveError) {
      console.error('Error saving friend request:', saveError);
      return res.status(500).json({ 
        message: 'Error saving friend request', 
        error: saveError.message 
      });
    }
    
    // Populate sender and recipient details
    try {
      await request.populate('sender', 'name email profilePicture');
      await request.populate('recipient', 'name email profilePicture');
    } catch (populateError) {
      console.error('Error populating request details:', populateError);
      // Don't return here, we can still send the unpopulated request
    }

    console.log('Friend request created successfully:', request);
    res.status(201).json(request);
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ 
      message: 'Error sending friend request', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const respondToFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body;
    console.log('Responding to friend request:', { requestId, action });

    if (!['accept', 'reject'].includes(action)) {
      console.log('Invalid action:', action);
      return res.status(400).json({ message: 'Invalid action' });
    }

    const request = await FriendRequest.findOne({
      _id: requestId,
      recipient: req.user._id,
      status: 'pending'
    });

    if (!request) {
      console.log('Friend request not found:', requestId);
      return res.status(404).json({ message: 'Friend request not found' });
    }

    request.status = action === 'accept' ? 'accepted' : 'rejected';
    console.log('Updating request status to:', request.status);
    await request.save();

    if (action === 'accept') {
      console.log('Accepting friend request, updating friends lists');
      // Add each user to the other's friends list
      await User.findByIdAndUpdate(request.sender, {
        $addToSet: { friends: request.recipient }
      });
      await User.findByIdAndUpdate(request.recipient, {
        $addToSet: { friends: request.sender }
      });
    }

    // Populate the response
    await request.populate('sender', 'name email profilePicture');
    await request.populate('recipient', 'name email profilePicture');

    console.log('Friend request response processed successfully');
    res.json(request);
  } catch (error) {
    console.error('Error responding to friend request:', error);
    res.status(500).json({ message: 'Error responding to friend request', error: error.message });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    console.log('Getting friend requests for user:', req.user._id);
    const requests = await FriendRequest.find({
      recipient: req.user._id,
      status: 'pending'
    })
    .populate('sender', 'name email profilePicture')
    .populate('recipient', 'name email profilePicture')
    .sort({ createdAt: -1 });

    console.log('Found friend requests:', requests);
    res.json(requests);
  } catch (error) {
    console.error('Error getting friend requests:', error);
    res.status(500).json({ message: 'Error getting friend requests', error: error.message });
  }
};

export const getSentFriendRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      sender: req.user._id
    })
    .populate('sender', 'name email profilePicture')
    .populate('recipient', 'name email profilePicture')
    .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Error getting sent friend requests:', error);
    res.status(500).json({ message: 'Error getting sent friend requests' });
  }
};

export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'name email profilePicture');
    
    res.json(user.friends);
  } catch (error) {
    console.error('Error getting friends:', error);
    res.status(500).json({ message: 'Error getting friends' });
  }
};

export const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;

    // Remove friend from both users' friend lists
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { friends: friendId }
    });
    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: req.user._id }
    });

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ message: 'Error removing friend' });
  }
}; 