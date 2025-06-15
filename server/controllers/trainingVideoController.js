import asyncHandler from '../middleware/asyncHandler.js';
import TrainingVideo from '../models/TrainingVideo.js';
import { createActivity } from './activityController.js';
import { cloudinary } from '../config/cloudinary.js';

// @desc    Create a new training video
// @route   POST /api/training/videos
// @access  Private
export const createTrainingVideo = asyncHandler(async (req, res) => {
  try {
    const { title, description, url, sport, category } = req.body;
    let videoUrl = url;

    if (!title || !description || !sport || !category) {
      res.status(400);
      throw new Error('Please provide all required fields');
    }

    // Handle file upload if present
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'video',
        folder: 'training_videos',
        transformation: [{ width: 1280, height: 720, crop: "limit" }]
      });
      videoUrl = result.secure_url;
    } else if (!url) {
      res.status(400);
      throw new Error('Please provide either a video URL or upload a video file');
    }

    const video = await TrainingVideo.create({
      title,
      description,
      url: videoUrl,
      sport,
      category,
      author: req.user._id
    });

    await createActivity(
      req.user._id,
      'profile',
      'Added training video',
      `Added new ${sport} training video: ${title}`
    );

    const populatedVideo = await TrainingVideo.findById(video._id)
      .populate('author', 'name profilePicture')
      .populate('comments.user', 'name profilePicture')
      .populate('likes', 'name');

    res.status(201).json(populatedVideo);
  } catch (error) {
    console.error('Error creating training video:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      res.status(400).json({
        message: Object.values(error.errors).map(err => err.message).join(', ')
      });
      return;
    }
    
    // Handle URL validation errors
    if (error.message.includes('URL')) {
      res.status(400).json({ message: error.message });
      return;
    }
    
    res.status(500).json({ message: 'Error creating training video' });
  }
});

// @desc    Get all training videos with filters
// @route   GET /api/training/videos
// @access  Private
export const getTrainingVideos = asyncHandler(async (req, res) => {
  try {
    const { sport, category, search } = req.query;
    let query = {};
    
    if (sport) query.sport = sport;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const videos = await TrainingVideo.find(query)
      .populate('author', 'name profilePicture')
      .populate('comments.user', 'name profilePicture')
      .populate('likes', 'name')
      .sort('-createdAt');

    res.json(videos);
  } catch (error) {
    console.error('Error fetching training videos:', error);
    res.status(500).json({ message: 'Error fetching training videos' });
  }
});

// @desc    Get single training video
// @route   GET /api/training/videos/:id
// @access  Private
export const getTrainingVideo = asyncHandler(async (req, res) => {
  try {
    const video = await TrainingVideo.findById(req.params.id)
      .populate('author', 'name profilePicture')
      .populate('comments.user', 'name profilePicture')
      .populate('likes', 'name');

    if (!video) {
      res.status(404);
      throw new Error('Video not found');
    }

    // Increment views
    video.views += 1;
    await video.save();

    res.json(video);
  } catch (error) {
    console.error('Error fetching training video:', error);
    res.status(500).json({ message: 'Error fetching training video' });
  }
});

// @desc    Like/unlike training video
// @route   POST /api/training/videos/:id/like
// @access  Private
export const likeTrainingVideo = asyncHandler(async (req, res) => {
  try {
    const video = await TrainingVideo.findById(req.params.id);

    if (!video) {
      res.status(404);
      throw new Error('Video not found');
    }

    const likeIndex = video.likes.indexOf(req.user._id);
    
    if (likeIndex > -1) {
      // Unlike
      video.likes.splice(likeIndex, 1);
    } else {
      // Like
      video.likes.push(req.user._id);
      
      await createActivity(
        req.user._id,
        'profile',
        'Liked training video',
        `Liked ${video.title}`,
        [video.author]
      );
    }

    await video.save();

    const updatedVideo = await TrainingVideo.findById(video._id)
      .populate('author', 'name profilePicture')
      .populate('comments.user', 'name profilePicture')
      .populate('likes', 'name');

    res.json(updatedVideo);
  } catch (error) {
    console.error('Error liking training video:', error);
    res.status(500).json({ message: 'Error updating video like' });
  }
});

// @desc    Comment on training video
// @route   POST /api/training/videos/:id/comment
// @access  Private
export const commentOnTrainingVideo = asyncHandler(async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      res.status(400);
      throw new Error('Please provide comment content');
    }

    const video = await TrainingVideo.findById(req.params.id);

    if (!video) {
      res.status(404);
      throw new Error('Video not found');
    }

    video.comments.push({
      user: req.user._id,
      content
    });

    await video.save();

    await createActivity(
      req.user._id,
      'profile',
      'Commented on training video',
      `Commented on ${video.title}`,
      [video.author]
    );

    const updatedVideo = await TrainingVideo.findById(video._id)
      .populate('author', 'name profilePicture')
      .populate('comments.user', 'name profilePicture')
      .populate('likes', 'name');

    res.json(updatedVideo);
  } catch (error) {
    console.error('Error commenting on training video:', error);
    res.status(500).json({ message: 'Error adding comment' });
  }
});

// @desc    Delete a training video
// @route   DELETE /api/training/videos/:id
// @access  Private
export const deleteTrainingVideo = asyncHandler(async (req, res) => {
  try {
    const video = await TrainingVideo.findById(req.params.id);

    if (!video) {
      res.status(404);
      throw new Error('Video not found');
    }

    // Check if the user is the owner of the video
    if (video.author.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this video');
    }

    await video.deleteOne();

    await createActivity(
      req.user._id,
      'profile',
      'Deleted training video',
      `Deleted ${video.title}`
    );

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting training video:', error);
    
    if (error.message.includes('not found')) {
      res.status(404).json({ message: error.message });
      return;
    }
    
    if (error.message.includes('Not authorized')) {
      res.status(403).json({ message: error.message });
      return;
    }
    
    res.status(500).json({ message: 'Error deleting training video' });
  }
}); 