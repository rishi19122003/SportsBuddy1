import mongoose from 'mongoose';

const trainingVideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // Allow Cloudinary URLs (for uploaded videos)
        if (v.includes('cloudinary.com')) {
          return true;
        }

        // Check if it's a YouTube URL
        const youtubeRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
        const match = v.match(youtubeRegExp);
        if (match && match[2].length === 11) {
          return true;
        }

        // For other URLs, check if it's a valid HTTPS URL
        try {
          const url = new URL(v);
          return url.protocol === 'https:';
        } catch (e) {
          return false;
        }
      },
      message: props => `${props.value} is not a valid video URL`
    }
  },
  sport: {
    type: String,
    required: true,
    enum: ['cricket', 'football', 'tennis', 'basketball', 'other']
  },
  category: {
    type: String,
    required: true,
    enum: ['technique', 'strategy', 'fitness', 'rules', 'equipment', 'other']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Add indexes for better query performance
trainingVideoSchema.index({ title: 'text', description: 'text' });
trainingVideoSchema.index({ sport: 1, category: 1 });

// Pre-save hook to ensure YouTube URLs are in embed format
trainingVideoSchema.pre('save', function(next) {
  if (this.isModified('url')) {
    // Don't modify Cloudinary URLs
    if (this.url.includes('cloudinary.com')) {
      return next();
    }

    // Check if it's a YouTube URL
    const youtubeRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = this.url.match(youtubeRegExp);
    
    if (match && match[2].length === 11) {
      // Convert to embed URL if it's not already
      if (!this.url.includes('/embed/')) {
        this.url = `https://www.youtube-nocookie.com/embed/${match[2]}`;
      } else if (!this.url.includes('youtube-nocookie.com')) {
        // Convert existing embed URLs to use youtube-nocookie.com
        this.url = this.url.replace('www.youtube.com', 'www.youtube-nocookie.com');
      }
    } else {
      // For other URLs, ensure they are HTTPS
      try {
        const url = new URL(this.url);
        if (url.protocol !== 'https:') {
          this.url = this.url.replace(/^http:/, 'https:');
        }
      } catch (e) {
        // If URL parsing fails, let the validation handle it
      }
    }
  }
  next();
});

export default mongoose.model('TrainingVideo', trainingVideoSchema); 