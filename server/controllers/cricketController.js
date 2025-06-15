import CricketProfile from '../models/CricketProfile.js';
import { findBestMatches } from '../utils/collaborativeFiltering.js';
import { getUserInteractionsForRecommendation } from '../controllers/interactionController.js';
import { createActivity } from './activityController.js';
import CricketMatch from '../models/CricketMatch.js';

// @desc    Create or update cricket profile
// @route   POST /api/cricket/profile
// @access  Private
export const createUpdateCricketProfile = async (req, res) => {
  try {
    const {
      battingSkill,
      bowlingSkill,
      fieldingSkill,
      battingStyle,
      bowlingStyle,
      preferredPosition,
      location,
      availability
    } = req.body;

    // Check if profile already exists
    let profile = await CricketProfile.findOne({ user: req.user._id });

    if (profile) {
      // Update existing profile
      profile = await CricketProfile.findOneAndUpdate(
        { user: req.user._id },
        {
          battingSkill,
          bowlingSkill,
          fieldingSkill,
          battingStyle,
          bowlingStyle,
          preferredPosition,
          location,
          availability
        },
        { new: true }
      );
    } else {
      // Create new profile
      profile = await CricketProfile.create({
        user: req.user._id,
        battingSkill,
        bowlingSkill,
        fieldingSkill,
        battingStyle,
        bowlingStyle,
        preferredPosition,
        location,
        availability
      });
    }

    // Track profile update activity
    await createActivity(
      req.user._id,
      'profile',
      'Updated cricket profile',
      `Updated cricket preferences and skills`
    );

    res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get cricket profile
// @route   GET /api/cricket/profile
// @access  Private
export const getCricketProfile = async (req, res) => {
  try {
    const profile = await CricketProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: 'Cricket profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Find cricket partners using collaborative filtering
// @route   GET /api/cricket/partners
// @access  Private
export const findCricketPartners = async (req, res) => {
  try {
    // Get current user's profile
    const userProfile = await CricketProfile.findOne({ user: req.user._id }).populate('user', 'name email profilePicture');

    if (!userProfile) {
      return res.status(404).json({ 
        message: 'Please create your cricket profile first' 
      });
    }

    // Distance filter (in meters)
    const maxDistance = req.query.distance ? Number(req.query.distance) * 1000 : 10000; // Default 10km

    // Find potential partners within the distance radius
    const nearbyProfiles = await CricketProfile.find({
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
          battingSkill: profile.battingSkill,
          bowlingSkill: profile.bowlingSkill,
          fieldingSkill: profile.fieldingSkill,
          battingStyle: profile.battingStyle,
          bowlingStyle: profile.bowlingStyle,
          preferredPosition: profile.preferredPosition,
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

// @desc    Search cricket partners by preferences
// @route   POST /api/cricket/partners/search
// @access  Private
export const searchCricketPartners = async (req, res) => {
  try {
    const preferences = req.body;
    // Debug log
    console.log('Searching with preferences:', preferences);
    
    // Get current user's profile
    const userProfile = await CricketProfile.findOne({ user: req.user._id }).populate('user', 'name email profilePicture');
    if (!userProfile) {
      return res.status(404).json({ message: 'Please create your cricket profile first' });
    }

    // Determine which location to use for search
    let searchLocation;
    if (preferences.location.useProfileLocation) {
      searchLocation = userProfile.location;
    } else {
      searchLocation = preferences.location;
    }

    // Debug log
    console.log('Search location:', searchLocation);
    
    // Distance filter (in meters)
    const maxDistance = preferences.maxDistance ? Number(preferences.maxDistance) * 1000 : 10000;
    
    // Find potential partners within the distance radius
    const nearbyProfiles = await CricketProfile.find({
      user: { $ne: req.user._id },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: searchLocation.coordinates
          },
          $maxDistance: maxDistance
        }
      },
      battingSkill: { $gte: preferences.minBattingSkill, $lte: preferences.maxBattingSkill },
      bowlingSkill: { $gte: preferences.minBowlingSkill, $lte: preferences.maxBowlingSkill },
      fieldingSkill: { $gte: preferences.minFieldingSkill, $lte: preferences.maxFieldingSkill },
      battingStyle: { $in: preferences.preferredBattingStyles.includes('Any') ? ['Right-handed', 'Left-handed'] : preferences.preferredBattingStyles },
      bowlingStyle: { $in: preferences.preferredBowlingStyles.includes('Any') ? ['Fast', 'Medium', 'Spin'] : preferences.preferredBowlingStyles },
      preferredPosition: { $in: preferences.preferredPositions.includes('Any') ? ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper'] : preferences.preferredPositions },
      'availability.weekdays': preferences.weekdays,
      'availability.weekends': preferences.weekends,
      'availability.preferred_time': { $in: preferences.preferredTime.includes('Any') ? ['Morning', 'Afternoon', 'Evening'] : preferences.preferredTime }
    }).populate('user', 'name email profilePicture');

    // Debug log
    console.log('Nearby profiles found:', nearbyProfiles.length);

    // Assign submitted preferences to userProfile.partnerPreferences for matching
    userProfile.partnerPreferences = {
      minBattingSkill: preferences.minBattingSkill,
      maxBattingSkill: preferences.maxBattingSkill,
      minBowlingSkill: preferences.minBowlingSkill,
      maxBowlingSkill: preferences.maxBowlingSkill,
      minFieldingSkill: preferences.minFieldingSkill,
      maxFieldingSkill: preferences.maxFieldingSkill,
      preferredBattingStyles: preferences.preferredBattingStyles,
      preferredBowlingStyles: preferences.preferredBowlingStyles,
      preferredPositions: preferences.preferredPositions,
      preferredAvailability: {
        weekdays: preferences.weekdays,
        weekends: preferences.weekends,
        preferred_time: preferences.preferredTime
      },
      complementarySkills: preferences.complementarySkills || false,
      maxDistance: preferences.maxDistance
    };

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
          battingSkill: profile.battingSkill,
          bowlingSkill: profile.bowlingSkill,
          fieldingSkill: profile.fieldingSkill,
          battingStyle: profile.battingStyle,
          bowlingStyle: profile.bowlingStyle,
          preferredPosition: profile.preferredPosition,
          availability: profile.availability,
          location: profile.location.address
        },
        similarityScore,
        matchDetails: details
      };
    });

    // Track search activity
    await createActivity(
      req.user._id,
      'search',
      'Searched for cricket partners',
      `Looking for partners with similar preferences in ${preferences.location || 'any location'}`,
    );

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

// @desc    Join a cricket match
// @route   POST /api/cricket/matches/join
// @access  Private
export const joinCricketMatch = async (req, res) => {
  try {
    const { matchId } = req.body;
    const match = await CricketMatch.findById(matchId).populate('organizer', 'name');
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Add user to match participants
    if (!match.participants.includes(req.user._id)) {
      match.participants.push(req.user._id);
      await match.save();
    }

    // Track join activity
    await createActivity(
      req.user._id,
      'match',
      'Joined cricket match',
      `Joined ${match.organizer.name}'s match: ${match.title}`,
      [match.organizer._id],
      match._id
    );

    res.json({ message: 'Successfully joined the match', match });
  } catch (error) {
    console.error('Error joining match:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 