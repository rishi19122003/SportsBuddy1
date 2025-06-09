import mongoose from 'mongoose';

const friendRequestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true,
  collection: 'friendrequests' // Explicitly set collection name
});

// Add index to improve query performance
friendRequestSchema.index({ sender: 1, recipient: 1 }, { unique: true });
friendRequestSchema.index({ status: 1 });

const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);

// Ensure indexes are created
FriendRequest.createIndexes().catch(console.error);

export default FriendRequest; 