import CricketMatch from '../models/CricketMatch.js';
import { sendEmail } from '../utils/emailService.js';

// Create a new cricket match
export const createMatch = async (req, res) => {
  try {
    const matchData = {
      ...req.body,
      creator: req.user._id, // Assuming req.user is set by auth middleware
      date: new Date(`${req.body.date}T${req.body.time}`),
    };

    const match = new CricketMatch(matchData);
    await match.save();

    res.status(201).json({
      success: true,
      data: match,
      message: 'Cricket match created successfully'
    });
  } catch (error) {
    console.error('Error creating cricket match:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating cricket match',
      error: error.message
    });
  }
};

// Get all cricket matches
export const getMatches = async (req, res) => {
  try {
    const matches = await CricketMatch.find()
      .populate('creator', 'name email')
      .populate('participants', 'name email')
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      data: matches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cricket matches',
      error: error.message
    });
  }
};

// Get a single cricket match by ID
export const getMatch = async (req, res) => {
  try {
    const match = await CricketMatch.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('participants', 'name email');

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Cricket match not found'
      });
    }

    res.status(200).json({
      success: true,
      data: match
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cricket match',
      error: error.message
    });
  }
};

// Join a cricket match
export const joinMatch = async (req, res) => {
  try {
    const match = await CricketMatch.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('participants', 'name email');

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Cricket match not found'
      });
    }

    // Check if user is already a participant
    if (match.participants.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already a participant in this match'
      });
    }

    // Check if match is full
    if (match.participants.length >= match.playersNeeded) {
      return res.status(400).json({
        success: false,
        message: 'Match is already full'
      });
    }

    match.participants.push(req.user._id);
    
    // Update status if match becomes full
    if (match.participants.length === match.playersNeeded) {
      match.status = 'full';
    }

    await match.save();

    // Send email notification to the user
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: req.user.email,
      subject: 'Match Joining Confirmation - SportsBuddy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #38B2AC;">Match Joining Confirmation</h2>
          <p>Hi ${req.user.name},</p>
          <p>You have successfully joined the cricket match:</p>
          <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;">
            <p><strong>Match:</strong> ${match.title}</p>
            <p><strong>Date:</strong> ${new Date(match.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${match.time}</p>
            <p><strong>Location:</strong> ${match.location}</p>
            <p><strong>Format:</strong> ${match.format}</p>
            <p><strong>Skill Level:</strong> ${match.skill_level}</p>
          </div>
          <p>Please arrive at the location 15 minutes before the match time.</p>
          <p>Current participants: ${match.participants.length}/${match.playersNeeded}</p>
          <p>Best regards,<br/>The SportsBuddy Team</p>
        </div>
      `
    };

    await sendEmail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Successfully joined the match. Check your email for details.',
      data: match
    });
  } catch (error) {
    console.error('Error joining cricket match:', error);
    res.status(500).json({
      success: false,
      message: 'Error joining cricket match',
      error: error.message
    });
  }
}; 