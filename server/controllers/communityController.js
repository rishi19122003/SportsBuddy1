import asyncHandler from '../middleware/asyncHandler.js';
import Club from '../models/clubModel.js';
import Post from '../models/Post.js';
import { createActivity } from './activityController.js';

// Club Controllers
export const createClub = asyncHandler(async (req, res) => {
  try {
    const { name, description, sport, location } = req.body;

    if (!name || !description || !sport || !location) {
      res.status(400);
      throw new Error('Please provide all required fields');
    }

    const club = await Club.create({
      name,
      description,
      sport,
      location,
      creator: req.user._id,
      members: [req.user._id],
      admins: [req.user._id],
    });

    await createActivity(
      req.user._id,
      'profile',
      'Created new club',
      `Created ${name} club for ${sport}`
    );

    res.status(201).json(club);
  } catch (error) {
    console.error('Error creating club:', error);
    res.status(500).json({ message: 'Error creating club' });
  }
});

export const getClubs = asyncHandler(async (req, res) => {
  try {
    const { sport, search } = req.query;
    let query = {};
    
    if (sport) query.sport = sport;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const clubs = await Club.find(query)
      .populate('creator', 'name')
      .populate('members', 'name')
      .sort('-createdAt');

    res.json(clubs);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    res.status(500).json({ message: 'Error fetching clubs' });
  }
});

export const joinClub = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Attempting to join club:', id);
    console.log('User:', req.user._id);

    const club = await Club.findById(id);

    if (!club) {
      console.log('Club not found:', id);
      res.status(404);
      throw new Error('Club not found');
    }

    console.log('Club found:', club);
    
    // Convert ObjectIds to strings for comparison
    const isMember = club.members.some(memberId => 
      memberId.toString() === req.user._id.toString()
    );

    if (isMember) {
      console.log('User already a member');
      res.status(400);
      throw new Error('Already a member of this club');
    }

    // Add user to members array
    club.members.push(req.user._id);
    const updatedClub = await club.save();
    console.log('Club updated with new member');

    await createActivity(
      req.user._id,
      'join',
      'Joined club',
      `Joined ${club.name}`,
      [club.creator]
    );

    // Return populated club data
    const populatedClub = await Club.findById(updatedClub._id)
      .populate('creator', 'name')
      .populate('members', 'name')
      .populate('admins', 'name');

    res.json({ 
      message: 'Successfully joined club', 
      club: populatedClub 
    });
  } catch (error) {
    console.error('Error joining club:', error);
    res.status(500).json({ 
      message: 'Error joining club',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Post Controllers
/**
 * @desc    Create a new post in a club
 * @route   POST /api/community/posts
 * @access  Private
 */
export const createPost = asyncHandler(async (req, res) => {
  try {
    const { title, content, type, media, clubId } = req.body;

    console.log('Creating post with data:', {
      title,
      contentLength: content?.length,
      type,
      hasMedia: !!media,
      clubId,
      userId: req.user?._id
    });

    if (!title || !content || !clubId) {
      console.log('Missing required fields:', { title: !!title, content: !!content, clubId: !!clubId });
      res.status(400);
      throw new Error('Please provide all required fields');
    }

    // Check if club exists and user is a member
    const club = await Club.findById(clubId);
    if (!club) {
      console.log('Club not found:', clubId);
      res.status(404);
      throw new Error('Club not found');
    }

    console.log('Club found:', {
      clubId: club._id,
      members: club.members,
      userId: req.user._id,
      isMember: club.members.includes(req.user._id)
    });

    if (!club.members.includes(req.user._id)) {
      console.log('User not a member of club:', {
        userId: req.user._id,
        clubId: club._id
      });
      res.status(403);
      throw new Error('You must be a member of the club to create posts');
    }

    // Handle media URL or base64 data
    let mediaUrl = media;
    if (media && media.startsWith('data:image')) {
      mediaUrl = media;
    }

    const postData = {
      title,
      content,
      type: type || 'discussion',
      media: mediaUrl,
      club: clubId,
      author: req.user._id,
    };

    console.log('Creating post with data:', { ...postData, contentLength: postData.content.length });

    const post = await Post.create(postData);
    console.log('Post created:', post._id);

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name profilePicture')
      .populate('club', 'name');

    console.log('Sending populated post response');
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Error in createPost:', error);
    res.status(500).json({ 
      message: 'Error creating post', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export const getPosts = asyncHandler(async (req, res) => {
  try {
    const { clubId } = req.query;

    if (!clubId) {
      res.status(400);
      throw new Error('Club ID is required');
    }

    // Check if club exists and user is a member
    const club = await Club.findById(clubId);
    if (!club) {
      res.status(404);
      throw new Error('Club not found');
    }

    if (!club.members.includes(req.user._id)) {
      res.status(403);
      throw new Error('You must be a member of the club to view posts');
    }

    const posts = await Post.find({ club: clubId })
      .populate('author', 'name profilePicture')
      .populate('club', 'name')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error('Error in getPosts:', error);
    res.status(500).json({ 
      message: 'Error fetching posts',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    console.log('Attempting to like/unlike post:', postId);

    const post = await Post.findById(postId);
    console.log('Found post:', post ? 'yes' : 'no');
    
    if (!post) {
      console.log('Post not found with ID:', postId);
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.user._id);
    console.log('Like index:', likeIndex);
    
    if (likeIndex > -1) {
      // Unlike
      console.log('Removing like from post');
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      console.log('Adding like to post');
      post.likes.push(req.user._id);
      
      await createActivity(
        req.user._id,
        'profile',
        'Liked post',
        `Liked: ${post.title}`,
        [post.author]
      );
    }

    await post.save();
    console.log('Post saved successfully');
    
    // Return the updated post with populated fields
    const updatedPost = await Post.findById(postId)
      .populate('author', 'name profilePicture')
      .populate('comments.user', 'name profilePicture')
      .populate('likes', 'name profilePicture');

    console.log('Sending response with updated post');
    res.json(updatedPost);
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ 
      message: 'Error liking post',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    console.log('Attempting to add comment to post:', postId);
    console.log('Comment content:', content);
    
    const post = await Post.findById(postId);
    console.log('Found post:', post ? 'yes' : 'no');
    
    if (!post) {
      console.log('Post not found with ID:', postId);
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      user: req.user._id,
      content
    });

    await post.save();
    console.log('Post saved with new comment');
    
    // Return the updated post with populated fields
    const updatedPost = await Post.findById(postId)
      .populate('author', 'name profilePicture')
      .populate('comments.user', 'name profilePicture')
      .populate('likes', 'name profilePicture');

    await createActivity(
      req.user._id,
      'profile',
      'Commented on post',
      `Commented on: ${post.title}`,
      [post.author]
    );

    console.log('Sending response with updated post');
    res.json(updatedPost);
  } catch (error) {
    console.error('Error commenting on post:', error);
    res.status(500).json({ 
      message: 'Error adding comment',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    console.log('Attempting to delete post:', postId);

    const post = await Post.findById(postId);
    console.log('Found post:', post ? 'yes' : 'no');

    if (!post) {
      console.log('Post not found with ID:', postId);
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user is the author of the post
    if (post.author.toString() !== req.user._id.toString()) {
      console.log('Unauthorized deletion attempt:', {
        postAuthor: post.author,
        requestUser: req.user._id
      });
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(postId);
    console.log('Post deleted successfully');

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ 
      message: 'Error deleting post',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export default {
  createClub,
  getClubs,
  joinClub,
  createPost,
  getPosts,
  likePost,
  commentOnPost,
  deletePost,
}; 