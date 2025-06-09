import FootballProfile from '../models/FootballProfile.js';
import { findBestMatches } from '../utils/collaborativeFiltering.js';
import { getUserInteractionsForRecommendation } from '../controllers/interactionController.js';

// @desc    Create or update football profile
// @route   POST /api/football/profile
// @access  Private
export const createUpdateFootballProfile = async (req, res) => {
  try {
    const {
      attackingSkill,
      defendingSkill,
      passSkill,
      preferredPosition,
      preferredFoot,
      playingStyle,
      location,
      availability
    } = req.body;

    // Check if profile already exists
    let profile = await FootballProfile.findOne({ user: req.user._id });

    if (profile) {
      // Update existing profile
      profile = await FootballProfile.findOneAndUpdate(
        { user: req.user._id },
        {
          attackingSkill,
          defendingSkill,
          passSkill,
          preferredPosition,
          preferredFoot,
          playingStyle,
          location,
          availability
        },
        { new: true }
      );
    } else {
      // Create new profile
      profile = await FootballProfile.create({
        user: req.user._id,
        attackingSkill,
        defendingSkill,
        passSkill,
        preferredPosition,
        preferredFoot,
        playingStyle,
        location,
        availability
      });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get football profile
// @route   GET /api/football/profile
// @access  Private
export const getFootballProfile = async (req, res) => {
  try {
    const profile = await FootballProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: 'Football profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Find football partners using collaborative filtering
// @route   GET /api/football/partners
// @access  Private
export const findFootballPartners = async (req, res) => {
  try {
    // Get current user's profile
    const userProfile = await FootballProfile.findOne({ user: req.user._id }).populate('user', 'name email profilePicture');

    if (!userProfile) {
      return res.status(404).json({ 
        message: 'Please create your football profile first' 
      });
    }

    // Distance filter (in meters)
    const maxDistance = req.query.distance ? Number(req.query.distance) * 1000 : 10000; // Default 10km

    // Find potential partners within the distance radius
    const nearbyProfiles = await FootballProfile.find({
      user: { $ne: req.user._id }, // Exclude current user
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: userProfile.location.coordinates
          },
          $maxDistance: maxDistance
        }
      }
    }).populate('user', 'name email profilePicture');

    if (nearbyProfiles.length === 0) {
      return res.status(200).json({ 
        message: 'No players found in your area',
        partners: [] 
      });
    }

    // Get user interactions for collaborative filtering
    const userInteractions = await getUserInteractionsForRecommendation(req.user._id);
    
    // Calculate similarity scores using collaborative filtering
    const partnersWithScores = findBestMatches(userProfile, nearbyProfiles, userInteractions);
    
    // Format the response
    const formattedPartners = partnersWithScores.map(partnerData => {
      const { profile, similarityScore, details } = partnerData;
      
      return {
        profile: {
          _id: profile._id,
          user: profile.user,
          attackingSkill: profile.attackingSkill,
          defendingSkill: profile.defendingSkill,
          passSkill: profile.passSkill,
          preferredPosition: profile.preferredPosition,
          preferredFoot: profile.preferredFoot,
          playingStyle: profile.playingStyle,
          availability: profile.availability,
          location: profile.location.address
        },
        similarityScore,
        matchDetails: details
      };
    });
    
    res.status(200).json({
      message: 'Partners found',
      count: formattedPartners.length,
      partners: formattedPartners
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}; 