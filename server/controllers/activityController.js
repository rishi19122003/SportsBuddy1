import Activity from '../models/Activity.js';

// Create a new activity
export const createActivity = async (userId, type, action, details = null, relatedUsers = [], relatedMatch = null) => {
  try {
    const activity = await Activity.create({
      user: userId,
      type,
      action,
      details,
      relatedUsers,
      relatedMatch
    });
    return activity;
  } catch (error) {
    console.error('Error creating activity:', error);
    return null;
  }
};

// Get recent activities
export const getRecentActivities = async (req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ timestamp: -1 })
      .limit(3)
      .populate('user', 'name email profilePicture')
      .populate('relatedUsers', 'name email profilePicture')
      .populate('relatedMatch', 'title date time');

    res.status(200).json(activities);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's activities
export const getUserActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user._id })
      .sort({ timestamp: -1 })
      .limit(20)
      .populate('user', 'name email profilePicture')
      .populate('relatedUsers', 'name email profilePicture')
      .populate('relatedMatch', 'title date time');

    res.status(200).json(activities);
  } catch (error) {
    console.error('Error fetching user activities:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 