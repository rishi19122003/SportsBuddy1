import trainingVideoRoutes from './routes/trainingVideoRoutes.js';
 
// Routes
app.use('/api/users', userRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/training/videos', trainingVideoRoutes); 