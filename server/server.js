import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import config, { EMAIL_CONFIG } from './config.js';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Our config.js now handles the environment variable loading
console.log('Environment loaded from config.js');
console.log('PORT:', config.port);
console.log('EMAIL_USER:', EMAIL_CONFIG.user ? 'configured' : 'missing');
console.log('EMAIL_PASSWORD:', EMAIL_CONFIG.password ? 'configured' : 'missing');

// Now import routes after env vars are loaded
import authRoutes from './routes/auth.js';
import cricketRoutes from './routes/cricketRoutes.js';
import footballRoutes from './routes/footballRoutes.js';
import socialRoutes from './routes/socialRoutes.js';
import interactionRoutes from './routes/interactionRoutes.js';

// Initialize express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Connect to MongoDB
mongoose
  .connect(config.mongoUri)
  .then(() => {
    console.log('MongoDB Connected');
  })
  .catch((err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cricket', cricketRoutes);
app.use('/api/football', footballRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/interactions', interactionRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Handle 404 errors
app.use((req, res) => {
  console.error(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ message: `Route not found: ${req.method} ${req.url}` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  console.error(err.stack);
  res.status(500).json({ 
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// Port
const PORT = config.port;

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
}); 