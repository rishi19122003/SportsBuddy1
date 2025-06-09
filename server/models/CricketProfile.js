import mongoose from 'mongoose';

const cricketProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  battingSkill: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  bowlingSkill: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  fieldingSkill: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  battingStyle: {
    type: String,
    required: true,
    enum: ['Right-handed', 'Left-handed']
  },
  bowlingStyle: {
    type: String,
    required: true,
    enum: ['Fast', 'Medium', 'Spin']
  },
  preferredPosition: {
    type: String,
    enum: ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  availability: {
    weekdays: {
      type: Boolean,
      default: false
    },
    weekends: {
      type: Boolean,
      default: true
    },
    preferred_time: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Evening'],
      default: 'Evening'
    }
  },
  partnerPreferences: {
    minBattingSkill: {
      type: Number,
      min: 1,
      max: 10,
      default: 1
    },
    maxBattingSkill: {
      type: Number,
      min: 1,
      max: 10,
      default: 10
    },
    minBowlingSkill: {
      type: Number,
      min: 1,
      max: 10,
      default: 1
    },
    maxBowlingSkill: {
      type: Number,
      min: 1,
      max: 10,
      default: 10
    },
    preferredBattingStyles: {
      type: [String],
      enum: ['Right-handed', 'Left-handed', 'Any'],
      default: ['Any']
    },
    preferredBowlingStyles: {
      type: [String],
      enum: ['Fast', 'Medium', 'Spin', 'Any'],
      default: ['Any']
    },
    preferredPositions: {
      type: [String],
      enum: ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper', 'Any'],
      default: ['Any']
    },
    preferredAvailability: {
      weekdays: {
        type: Boolean,
        default: true
      },
      weekends: {
        type: Boolean,
        default: true
      },
      preferred_time: {
        type: [String],
        enum: ['Morning', 'Afternoon', 'Evening', 'Any'],
        default: ['Any']
      }
    },
    complementarySkills: {
      type: Boolean,
      default: true,
      description: "Match with players who have complementary skills to yours"
    },
    maxDistance: {
      type: Number,
      min: 1,
      max: 100,
      default: 20,
      description: "Maximum distance in kilometers"
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for geospatial queries
cricketProfileSchema.index({ location: '2dsphere' });

const CricketProfile = mongoose.model('CricketProfile', cricketProfileSchema);

export default CricketProfile; 