import mongoose from 'mongoose';

const clubSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    sport: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    admins: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    image: {
      type: String,
      default: '',
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    joinRequests: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Club', clubSchema); 