/**
 * Collaborative Filtering utility for partner matching
 * Implements user-based and item-based collaborative filtering algorithms
 * with support for partner preferences
 */

// Calculate cosine similarity between two vectors
export const cosineSimilarity = (vectorA, vectorB) => {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    normA += vectorA[i] * vectorA[i];
    normB += vectorB[i] * vectorB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

// Calculate Euclidean distance between two vectors
export const euclideanDistance = (vectorA, vectorB) => {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length');
  }
  
  let sum = 0;
  for (let i = 0; i < vectorA.length; i++) {
    sum += Math.pow(vectorA[i] - vectorB[i], 2);
  }
  
  return 1 / (1 + Math.sqrt(sum)); // Transform to similarity (0-1)
};

// Convert a user profile to a feature vector for similarity calculations
export const profileToFeatureVector = (profile) => {
  // Normalize all values to 0-1 scale
  return [
    profile.battingSkill / 10,
    profile.bowlingSkill / 10,
    profile.fieldingSkill / 10,
    profile.preferredPosition === 'Batsman' ? 1 : 0,
    profile.preferredPosition === 'Bowler' ? 1 : 0,
    profile.preferredPosition === 'All-rounder' ? 1 : 0,
    profile.preferredPosition === 'Wicket-keeper' ? 1 : 0,
    profile.battingStyle === 'Right-handed' ? 1 : 0,
    profile.battingStyle === 'Left-handed' ? 1 : 0,
    profile.bowlingStyle === 'Fast' ? 1 : 0,
    profile.bowlingStyle === 'Medium' ? 1 : 0,
    profile.bowlingStyle === 'Spin' ? 1 : 0,
    profile.availability.weekdays ? 1 : 0,
    profile.availability.weekends ? 1 : 0,
    profile.availability.preferred_time === 'Morning' ? 1 : 0,
    profile.availability.preferred_time === 'Afternoon' ? 1 : 0,
    profile.availability.preferred_time === 'Evening' ? 1 : 0,
  ];
};

// Calculate complementary score between two profiles
export const calculateComplementaryScore = (userProfile, otherProfile) => {
  let score = 0;
  
  // Complementary positions get higher scores
  if (
    (userProfile.preferredPosition === 'Batsman' && otherProfile.preferredPosition === 'Bowler') ||
    (userProfile.preferredPosition === 'Bowler' && otherProfile.preferredPosition === 'Batsman') ||
    (userProfile.preferredPosition === 'Bowler' && otherProfile.preferredPosition === 'Wicket-keeper') ||
    (userProfile.preferredPosition === 'Batsman' && otherProfile.preferredPosition === 'All-rounder')
  ) {
    score += 1;
  } else if (userProfile.preferredPosition === otherProfile.preferredPosition) {
    score += 0.5; // Same roles are okay but not ideal
  } else {
    score += 0.7; // Different roles
  }
  
  // Complementary bowling and batting styles
  if (
    (userProfile.battingStyle === 'Right-handed' && otherProfile.bowlingStyle === 'Spin') ||
    (userProfile.battingStyle === 'Left-handed' && otherProfile.bowlingStyle === 'Fast') ||
    (userProfile.bowlingStyle === 'Spin' && otherProfile.battingStyle === 'Right-handed') ||
    (userProfile.bowlingStyle === 'Fast' && otherProfile.battingStyle === 'Left-handed')
  ) {
    score += 1;
  } else {
    score += 0.6;
  }
  
  // Return normalized score
  return score / 2;
};

// Calculate skill balance score
export const calculateSkillBalanceScore = (userProfile, otherProfile) => {
  // Calculate the overall skill level for both profiles
  const userSkillAvg = (userProfile.battingSkill + userProfile.bowlingSkill + userProfile.fieldingSkill) / 3;
  const otherSkillAvg = (otherProfile.battingSkill + otherProfile.bowlingSkill + otherProfile.fieldingSkill) / 3;
  
  // Players with similar skill levels are good matches
  const skillDifference = Math.abs(userSkillAvg - otherSkillAvg);
  return 1 - (skillDifference / 10); // Normalize to 0-1
};

// Calculate availability match score
export const calculateAvailabilityScore = (userProfile, otherProfile) => {
  let score = 0;
  
  // Match on weekdays/weekends
  if (userProfile.availability.weekdays && otherProfile.availability.weekdays) score += 0.5;
  if (userProfile.availability.weekends && otherProfile.availability.weekends) score += 0.5;
  
  // Match on preferred time
  if (userProfile.availability.preferred_time === otherProfile.availability.preferred_time) score += 1;
  
  return score / 2; // Normalize to 0-1
};

// Check if a profile meets the user's partner preferences
export const meetsPartnerPreferences = (userProfile, otherProfile) => {
  // If no partner preferences are set, all profiles meet criteria
  if (!userProfile.partnerPreferences) return true;
  
  const prefs = userProfile.partnerPreferences;
  
  // Check skill ranges
  if (otherProfile.battingSkill < prefs.minBattingSkill || 
      otherProfile.battingSkill > prefs.maxBattingSkill) {
    return false;
  }
  
  if (otherProfile.bowlingSkill < prefs.minBowlingSkill || 
      otherProfile.bowlingSkill > prefs.maxBowlingSkill) {
    return false;
  }
  
  // Check batting style preference
  if (!prefs.preferredBattingStyles.includes('Any') && 
      !prefs.preferredBattingStyles.includes(otherProfile.battingStyle)) {
    return false;
  }
  
  // Check bowling style preference
  if (!prefs.preferredBowlingStyles.includes('Any') && 
      !prefs.preferredBowlingStyles.includes(otherProfile.bowlingStyle)) {
    return false;
  }
  
  // Check position preference
  if (!prefs.preferredPositions.includes('Any') && 
      !prefs.preferredPositions.includes(otherProfile.preferredPosition)) {
    return false;
  }
  
  // Check availability
  const userAvailPref = prefs.preferredAvailability;
  
  // If user prefers weekdays, partner must be available on weekdays
  if (userAvailPref.weekdays && !otherProfile.availability.weekdays) {
    return false;
  }
  
  // If user prefers weekends, partner must be available on weekends
  if (userAvailPref.weekends && !otherProfile.availability.weekends) {
    return false;
  }
  
  // Check preferred time
  if (!userAvailPref.preferred_time.includes('Any') && 
      !userAvailPref.preferred_time.includes(otherProfile.availability.preferred_time)) {
    return false;
  }
  
  return true;
};

// Calculate preference match score between user preferences and other profile
export const calculatePreferenceMatchScore = (userProfile, otherProfile) => {
  // If no preferences are set, return perfect match
  if (!userProfile.partnerPreferences) return 1;
  
  const prefs = userProfile.partnerPreferences;
  let score = 0;
  let totalFactors = 0;
  
  // Batting skill match (how close to ideal range)
  const battingSkillRange = prefs.maxBattingSkill - prefs.minBattingSkill;
  const battingIdealPoint = prefs.minBattingSkill + (battingSkillRange / 2);
  const battingDistance = Math.abs(otherProfile.battingSkill - battingIdealPoint) / (battingSkillRange > 0 ? battingSkillRange : 10);
  const battingScore = 1 - battingDistance;
  score += battingScore;
  totalFactors++;
  
  // Bowling skill match
  const bowlingSkillRange = prefs.maxBowlingSkill - prefs.minBowlingSkill;
  const bowlingIdealPoint = prefs.minBowlingSkill + (bowlingSkillRange / 2);
  const bowlingDistance = Math.abs(otherProfile.bowlingSkill - bowlingIdealPoint) / (bowlingSkillRange > 0 ? bowlingSkillRange : 10);
  const bowlingScore = 1 - bowlingDistance;
  score += bowlingScore;
  totalFactors++;
  
  // Batting style match
  if (prefs.preferredBattingStyles.includes('Any') || 
      prefs.preferredBattingStyles.includes(otherProfile.battingStyle)) {
    score += 1;
  } else {
    score += 0.1; // Small score if not matching preference
  }
  totalFactors++;
  
  // Bowling style match
  if (prefs.preferredBowlingStyles.includes('Any') || 
      prefs.preferredBowlingStyles.includes(otherProfile.bowlingStyle)) {
    score += 1;
  } else {
    score += 0.1;
  }
  totalFactors++;
  
  // Position match
  if (prefs.preferredPositions.includes('Any') || 
      prefs.preferredPositions.includes(otherProfile.preferredPosition)) {
    score += 1;
  } else {
    score += 0.1;
  }
  totalFactors++;
  
  // Availability match
  let availScore = 0;
  
  // Check weekdays
  if (!prefs.preferredAvailability.weekdays || otherProfile.availability.weekdays) {
    availScore += 0.5;
  }
  
  // Check weekends
  if (!prefs.preferredAvailability.weekends || otherProfile.availability.weekends) {
    availScore += 0.5;
  }
  
  // Check time preference
  if (prefs.preferredAvailability.preferred_time.includes('Any') || 
      prefs.preferredAvailability.preferred_time.includes(otherProfile.availability.preferred_time)) {
    availScore += 1;
  }
  
  score += (availScore / 2); // Normalize to 0-1
  totalFactors++;
  
  return score / totalFactors;
};

// Collaborative filtering main function
export const findBestMatches = (userProfile, allProfiles, userInteractions = {}) => {
  // Initialize empty array for all similarity scores
  const userFeatureVector = profileToFeatureVector(userProfile);
  const matchScores = [];
  
  // Loop through all other profiles
  for (const profile of allProfiles) {
    // Skip if it's the same user
    if (profile.user._id.toString() === userProfile.user.toString()) continue;
    
    // Check if the profile meets the user's partner preferences
    if (!meetsPartnerPreferences(userProfile, profile)) continue;
    
    // Calculate similarity based on feature vectors
    const profileFeatureVector = profileToFeatureVector(profile);
    const similarity = cosineSimilarity(userFeatureVector, profileFeatureVector);
    
    // Calculate complementary score (if user prefers complementary skills)
    const complementaryScore = userProfile.partnerPreferences?.complementarySkills 
      ? calculateComplementaryScore(userProfile, profile) 
      : 0.5; // Neutral score if user doesn't prefer complementary skills
    
    // Calculate skill balance
    const skillBalanceScore = calculateSkillBalanceScore(userProfile, profile);
    
    // Calculate availability match
    const availabilityScore = calculateAvailabilityScore(userProfile, profile);
    
    // Calculate preference match score
    const preferenceMatchScore = calculatePreferenceMatchScore(userProfile, profile);
    
    // Calculate collaborative filtering score based on user interactions if available
    let collaborativeScore = 0;
    
    if (Object.keys(userInteractions).length > 0) {
      // Get interaction data for this profile's user if it exists
      const userInteractionData = userInteractions[profile.user._id.toString()];
      
      if (userInteractionData) {
        // Use interaction score normalized to 0-1
        const maxPossibleScore = 100; // Arbitrary high value that represents maximum interaction
        collaborativeScore = Math.min(userInteractionData.interactionScore / maxPossibleScore, 1);
      }
    }
    
    // Weighted final score (can adjust weights as needed)
    const finalScore = (
      similarity * 0.2 +
      complementaryScore * 0.2 +
      skillBalanceScore * 0.15 +
      availabilityScore * 0.15 +
      preferenceMatchScore * 0.25 + // Highest weight to preference match
      collaborativeScore * 0.05 // Small weight until we have more interaction data
    ) * 100; // Convert to percentage
    
    matchScores.push({
      profile,
      similarityScore: Math.round(finalScore),
      details: {
        featureSimilarity: similarity,
        complementary: complementaryScore,
        skillBalance: skillBalanceScore,
        availability: availabilityScore,
        preferenceMatch: preferenceMatchScore,
        interactions: collaborativeScore
      }
    });
  }
  
  // Sort by similarity score (descending)
  return matchScores.sort((a, b) => b.similarityScore - a.similarityScore);
}; 