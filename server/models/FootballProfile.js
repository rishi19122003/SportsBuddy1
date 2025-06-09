import mongoose from 'mongoose';

const footballProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attackingSkill: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  defendingSkill: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  passSkill: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  preferredPosition: {
    type: String,
    required: true,
    enum: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Striker', 'Winger', 'Any']
  },
  preferredFoot: {
    type: String,
    required: true,
    enum: ['Left', 'Right', 'Both']
  },
  playingStyle: {
    type: String,
    enum: ['Possession', 'Counter-attacking', 'High-pressing', 'Tiki-taka', 'Defensive', 'Long-ball', 'Wing-play']
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
      enum: ['Morning', 'Afternoon', 'Evening', 'Any'],
      default: 'Evening'
    }
  },
  partnerPreferences: {
    minAttackingSkill: {
      type: Number,
      min: 1,
      max: 10,
      default: 1
    },
    maxAttackingSkill: {
      type: Number,
      min: 1,
      max: 10,
      default: 10
    },
    minDefendingSkill: {
      type: Number,
      min: 1,
      max: 10,
      default: 1
    },
    maxDefendingSkill: {
      type: Number,
      min: 1,
      max: 10,
      default: 10
    },
    preferredPositions: {
      type: [String],
      enum: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Striker', 'Winger', 'Any'],
      default: ['Any']
    },
    preferredPlayingStyles: {
      type: [String],
      enum: ['Possession', 'Counter-attacking', 'High-pressing', 'Tiki-taka', 'Defensive', 'Long-ball', 'Wing-play', 'Any'],
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
footballProfileSchema.index({ location: '2dsphere' });

const FootballProfile = mongoose.model('FootballProfile', footballProfileSchema);

export default FootballProfile; 