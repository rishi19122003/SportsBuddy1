import mongoose from 'mongoose';

const cricketMatchSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  format: {
    type: String,
    required: true,
    enum: ['T20', 'ODI', 'Test', 'Custom']
  },
  playersNeeded: {
    type: Number,
    required: true,
    min: 1,
    max: 22
  },
  skill_level: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Professional']
  },
  description: {
    type: String,
    trim: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['open', 'full', 'cancelled', 'completed'],
    default: 'open'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('CricketMatch', cricketMatchSchema); 