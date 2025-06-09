import UserInteraction from '../models/UserInteraction.js';

/**
 * Record a user interaction
 * @param {Object} req.user - The authenticated user
 * @param {String} req.body.targetUserId - The user being interacted with
 * @param {String} req.body.interactionType - The type of interaction
 * @param {Number} req.body.rating - Optional rating (1-5)
 */
export const recordInteraction = async (req, res) => {
  try {
    const { targetUserId, interactionType, rating } = req.body;
    
    if (!targetUserId || !interactionType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Don't allow users to interact with themselves
    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot interact with yourself' });
    }
    
    // Try to find an existing interaction
    let interaction = await UserInteraction.findOne({
      user: req.user._id,
      targetUser: targetUserId,
      interactionType
    });
    
    if (interaction) {
      // Update existing interaction
      interaction.count += 1;
      interaction.lastInteractedAt = Date.now();
      
      // Update rating if provided
      if (rating && interactionType === 'rate_match') {
        interaction.rating = rating;
      }
      
      await interaction.save();
    } else {
      // Create new interaction
      interaction = await UserInteraction.create({
        user: req.user._id,
        targetUser: targetUserId,
        interactionType,
        rating: rating || null
      });
    }
    
    res.status(200).json({ success: true, interaction });
  } catch (error) {
    console.error('Error recording interaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all interactions for the authenticated user
 */
export const getUserInteractions = async (req, res) => {
  try {
    const interactions = await UserInteraction.find({ user: req.user._id })
      .populate('targetUser', 'name email profilePicture')
      .sort({ lastInteractedAt: -1 });
    
    res.status(200).json(interactions);
  } catch (error) {
    console.error('Error getting user interactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get user interaction matrix for collaborative filtering
 * Returns a simplified form of user interactions suitable for collaborative filtering
 */
export const getUserInteractionMatrix = async (req, res) => {
  try {
    // Get all interactions
    const allInteractions = await UserInteraction.find({})
      .select('user targetUser interactionType count rating')
      .lean();
    
    // Transform into a matrix format
    const userMatrix = {};
    
    allInteractions.forEach(interaction => {
      const userId = interaction.user.toString();
      const targetId = interaction.targetUser.toString();
      
      if (!userMatrix[userId]) {
        userMatrix[userId] = {};
      }
      
      if (!userMatrix[userId][targetId]) {
        userMatrix[userId][targetId] = {};
      }
      
      // Record interaction data
      userMatrix[userId][targetId][interaction.interactionType] = {
        count: interaction.count,
        rating: interaction.rating
      };
    });
    
    res.status(200).json(userMatrix);
  } catch (error) {
    console.error('Error getting interaction matrix:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Helper function to get interaction matrix for a specific user
 * @param {String} userId - User ID to get interactions for
 * @returns {Object} - User's interaction matrix
 */
export const getUserInteractionsForRecommendation = async (userId) => {
  try {
    // Find all interactions where this user is involved
    const interactions = await UserInteraction.find({
      $or: [
        { user: userId },
        { targetUser: userId }
      ]
    }).lean();
    
    // Format interactions for collaborative filtering
    const interactionMap = {};
    
    interactions.forEach(interaction => {
      const isUserInitiator = interaction.user.toString() === userId.toString();
      const otherUserId = isUserInitiator ? 
        interaction.targetUser.toString() : 
        interaction.user.toString();
      
      if (!interactionMap[otherUserId]) {
        interactionMap[otherUserId] = {
          totalInteractions: 0,
          interactionScore: 0
        };
      }
      
      // Calculate a weighted interaction score based on type and count
      let weight = 0;
      switch (interaction.interactionType) {
        case 'view_profile':
          weight = 1;
          break;
        case 'send_message':
          weight = 5;
          break;
        case 'send_friend_request':
          weight = 3;
          break;
        case 'accept_friend_request':
          weight = 8;
          break;
        case 'play_together':
          weight = 10;
          break;
        case 'rate_match':
          // If rating exists, use it as weight multiplied by 2
          weight = interaction.rating ? interaction.rating * 2 : 5;
          break;
        default:
          weight = 1;
      }
      
      // If user is the target (received interaction), it's also valuable
      if (!isUserInitiator) {
        weight = Math.round(weight * 0.7); // Slightly less value for received interactions
      }
      
      interactionMap[otherUserId].totalInteractions += interaction.count;
      interactionMap[otherUserId].interactionScore += (weight * interaction.count);
    });
    
    return interactionMap;
  } catch (error) {
    console.error('Error getting user interactions for recommendation:', error);
    return {};
  }
}; 