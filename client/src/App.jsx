import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from '@mui/material';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Clubs from './components/Clubs';
import TrainingVideos from './components/TrainingVideos';
import Community from './pages/Community';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Container>
        <Routes>
          <Route path="/" element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/clubs" element={<Clubs />} />
            <Route path="/community" element={<Community />} />
            <Route path="/training/videos" element={<TrainingVideos />} />
            <Route index element={<Dashboard />} />
          </Route>
        </Routes>
      </Container>
    </Router>
  );
}

export default App; 