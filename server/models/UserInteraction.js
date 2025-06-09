import mongoose from 'mongoose';

const userInteractionSchema = new mongoose.Schema({
  // The user who performed the action
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // The user who received the action
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Type of interaction
  interactionType: {
    type: String,
    enum: ['view_profile', 'send_friend_request', 'accept_friend_request', 
           'send_message', 'view_again', 'rate_match', 'play_together'],
    required: true
  },
  // Rating value (if applicable)
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  // Number of interactions of this type between these users
  count: {
    type: Number,
    default: 1
  },
  // When the interaction first occurred
  firstInteractedAt: {
    type: Date,
    default: Date.now
  },
  // When the interaction last occurred
  lastInteractedAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index on user and targetUser for faster lookups
userInteractionSchema.index({ user: 1, targetUser: 1, interactionType: 1 }, { unique: true });

const UserInteraction = mongoose.model('UserInteraction', userInteractionSchema);

export default UserInteraction; 