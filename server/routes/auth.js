import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import { EMAIL_CONFIG } from '../config.js';
import config from '../config.js';

const router = express.Router();

// Create a transporter object
let transporter;
try {
  // Log exact values (partially masked for security) to debug the issue
  console.log('\nEmail Configuration Debug:');
  console.log('EMAIL_CONFIG.user:', EMAIL_CONFIG.user ? EMAIL_CONFIG.user.substring(0, 5) + '...' : 'undefined');
  console.log('EMAIL_CONFIG.password:', EMAIL_CONFIG.password ? '*****' : 'undefined');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  if (!EMAIL_CONFIG.user || !EMAIL_CONFIG.password) {
    console.warn('Email credentials missing or empty. Email functionality will be limited.');
    console.log('To fix this, make sure your .env file has EMAIL_USER and EMAIL_PASSWORD set properly.');
  } else {
    console.log('Email credentials found. Attempting to configure transporter.');
  }
  
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_CONFIG.user,
      pass: EMAIL_CONFIG.password
    },
    debug: true, // Enable debug output
    logger: true // Log information about the mail
  });
  
  // Verify the connection configuration
  transporter.verify(function(error, success) {
    if (error) {
      console.error('Transporter verification failed:', error);
    } else {
      console.log('Transporter ready to send messages');
    }
  });
} catch (error) {
  console.error('Failed to configure email transporter:', error);
}

// Add a dummy email sending function for development
const sendEmail = async (mailOptions) => {
  // Always log the email for debugging purposes
  console.log('====== EMAIL ATTEMPT ======');
  console.log('To:', mailOptions.to);
  console.log('Subject:', mailOptions.subject);
  console.log('==============================');
  
  // If we're in development mode or missing credentials, use development logging
  if (process.env.NODE_ENV === 'development' && (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD)) {
    console.log('DEVELOPMENT MODE: Skipping actual email send');
    console.log('Content:', mailOptions.html);
    console.log('==============================');
    return true;
  }
  
  // Attempt to send real email
  try {
    if (!transporter) {
      console.error('Email transporter not configured');
      // Still return true in development to allow the flow to continue
      return process.env.NODE_ENV === 'development';
    }
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    
    // In development, we'll still return true to allow the flow to continue
    if (process.env.NODE_ENV === 'development') {
      console.log('DEVELOPMENT MODE: Continuing despite email error');
      return true;
    }
    
    throw error;
  }
};

// Store verification tokens temporarily (in a real production app, this would be in a database)
const verificationTokens = new Map();

// Step 1: Request email verification
router.post('/request-verification', async (req, res) => {
  try {
    const { name, email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store temp user data with OTP
    const tempToken = crypto.randomBytes(20).toString('hex');
    verificationTokens.set(email, {
      name,
      email,
      otp,
      token: tempToken,
      createdAt: new Date()
    });

    // Send email with OTP
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'SportsBuddy Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #38B2AC;">Welcome to SportsBuddy!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for registering with SportsBuddy. To verify your email address, please use the following verification code:</p>
          <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">${otp}</div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
          <p>Best regards,<br/>The SportsBuddy Team</p>
        </div>
      `
    };

    await sendEmail(mailOptions);

    res.status(200).json({ message: 'Verification code sent to your email' });
  } catch (error) {
    console.error('Error in request-verification:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Resend verification OTP
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email exists in our verification tokens
    const userData = verificationTokens.get(email);
    if (!userData) {
      return res.status(400).json({ message: 'Email not found in verification process' });
    }

    // Generate a new 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Update stored data with new OTP
    userData.otp = otp;
    userData.createdAt = new Date();
    verificationTokens.set(email, userData);

    // Send email with OTP
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'SportsBuddy Email Verification - New Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #38B2AC;">SportsBuddy Email Verification</h2>
          <p>Hi ${userData.name},</p>
          <p>You requested a new verification code. Please use the following code to verify your email address:</p>
          <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">${otp}</div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
          <p>Best regards,<br/>The SportsBuddy Team</p>
        </div>
      `
    };

    await sendEmail(mailOptions);

    res.status(200).json({ message: 'New verification code sent to your email' });
  } catch (error) {
    console.error('Error in resend-verification:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Step 2: Verify email with OTP
router.post('/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check if email exists in our verification tokens
    const userData = verificationTokens.get(email);
    if (!userData) {
      return res.status(400).json({ message: 'Email not found or verification session expired' });
    }

    // Check if OTP is valid
    if (userData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Check if OTP is expired (10 minutes)
    const otpCreatedAt = new Date(userData.createdAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now - otpCreatedAt) / (1000 * 60));
    
    if (diffInMinutes > 10) {
      return res.status(400).json({ message: 'Verification code expired. Please request a new one.' });
    }

    // Return success with verification token for the next step
    res.status(200).json({ 
      message: 'Email verified successfully',
      verificationToken: userData.token
    });
  } catch (error) {
    console.error('Error in verify-email:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Step 3: Complete registration by setting password
router.post('/complete-registration', async (req, res) => {
  try {
    const { email, password, verificationToken } = req.body;

    console.log('Complete registration for:', email);

    // Check if email exists in our verification tokens
    const userData = verificationTokens.get(email);
    if (!userData) {
      console.log('Email not found in verification tokens:', email);
      return res.status(400).json({ message: 'Email not found or verification session expired' });
    }

    // Verify the token
    if (userData.token !== verificationToken) {
      console.log('Invalid verification token for:', email);
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    // Check if OTP is expired (10 minutes)
    const otpCreatedAt = new Date(userData.createdAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now - otpCreatedAt) / (1000 * 60));
    
    if (diffInMinutes > 10) {
      return res.status(400).json({ message: 'Verification code expired. Please request a new one.' });
    }

    // Create a new user
    const newUser = new User({
      name: userData.name,
      email: userData.email,
      password: password,
      emailVerified: true
    });

    await newUser.save();
    console.log('New user created successfully:', email);

    // Clean up the verification data
    verificationTokens.delete(email);

    // Generate JWT using config
    const token = jwt.sign(
      { id: newUser._id },
      config.jwtSecret,
      { expiresIn: '30d' }
    );

    // Send response with user data
    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      emailVerified: newUser.emailVerified,
      token
    });
  } catch (error) {
    console.error('Error in complete-registration:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for:', email);

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password does not match for user:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    console.log('Login successful for user:', email);

    // Generate JWT using config
    const token = jwt.sign(
      { id: user._id },
      config.jwtSecret,
      { expiresIn: '30d' }
    );

    // Send response with user data
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      token
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Legacy register route (can be removed later if not needed)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: password
    });

    await newUser.save();

    // Generate JWT
    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Send response with user data
    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      emailVerified: false,
      token
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

export default router; 