import nodemailer from 'nodemailer';
import { EMAIL_CONFIG } from '../config.js';

// Create a transporter object
let transporter;
try {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_CONFIG.user,
      pass: EMAIL_CONFIG.password
    }
  });
} catch (error) {
  console.error('Failed to configure email transporter:', error);
}

// Send email function
export const sendEmail = async (mailOptions) => {
  // Always log the email attempt for debugging
  console.log('====== EMAIL ATTEMPT ======');
  console.log('To:', mailOptions.to);
  console.log('Subject:', mailOptions.subject);
  console.log('==============================');
  
  // If we're in development mode or missing credentials, log the email content
  if (process.env.NODE_ENV === 'development' && (!EMAIL_CONFIG.user || !EMAIL_CONFIG.password)) {
    console.log('DEVELOPMENT MODE: Skipping actual email send');
    console.log('Content:', mailOptions.html);
    console.log('==============================');
    return true;
  }
  
  try {
    if (!transporter) {
      throw new Error('Email transporter not configured');
    }
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}; 