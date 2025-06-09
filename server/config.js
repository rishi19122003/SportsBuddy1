import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to load environment variables from .env file manually
const loadEnvVars = () => {
  try {
    const envPath = path.join(__dirname, '.env');
    console.log('Loading .env file from:', envPath);
    
    if (fs.existsSync(envPath)) {
      const envConfig = fs.readFileSync(envPath, 'utf8');
      const envVars = envConfig.split('\n').reduce((acc, line) => {
        // Skip empty lines and comments
        if (!line || line.startsWith('#')) return acc;
        
        // Parse key=value pairs
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          // Remove quotes if present
          let value = match[2] || '';
          value = value.replace(/^['"]|['"]$/g, '');
          
          // Only set if not already defined in process.env
          if (!process.env[key]) {
            process.env[key] = value;
            console.log(`Loaded env var: ${key}=${value.substring(0, 3)}...`);
          }
          
          acc[key] = value;
        }
        return acc;
      }, {});
      
      return envVars;
    } else {
      console.error('No .env file found at', envPath);
      return {};
    }
  } catch (error) {
    console.error('Error loading .env file:', error);
    return {};
  }
};

// Export the loaded environment variables
export const config = loadEnvVars();

// Export specific variables with defaults
export const EMAIL_CONFIG = {
  user: process.env.EMAIL_USER || '',
  password: process.env.EMAIL_PASSWORD || '',
};

export default {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/SportsBuddy',
  jwtSecret: process.env.JWT_SECRET || 'fallback_jwt_secret_key',
  emailConfig: EMAIL_CONFIG,
}; 