import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['join', 'match', 'search', 'profile', 'partner'],
    required: true
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: String
  },
  relatedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  relatedMatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CricketMatch'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for faster querying of recent activities
activitySchema.index({ timestamp: -1 });

const Activity = mongoose.model('Activity', activitySchema);

export default Activity; 