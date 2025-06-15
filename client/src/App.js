import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SportsSelection from './pages/SportsSelection';
import CricketProfileForm from './pages/CricketProfileForm';
import FootballProfileForm from './pages/FootballProfileForm';
import FindPartners from './pages/FindPartners';
import Chat from './pages/Chat';
import Messages from './pages/Messages';
import FriendRequests from './pages/FriendRequests';
import CricketMatches from './pages/CricketMatches';
import Community from './pages/Community';

// Components
import PrivateRoute from './components/PrivateRoute';
import CricketMatch from './components/CricketMatch';

// Context
import { AuthProvider } from './context/AuthContext';

// Customize Chakra UI theme
const theme = extendTheme({
  colors: {
    brand: {
      50: '#E6FFFA',
      100: '#B2F5EA',
      500: '#38B2AC',
      900: '#1D4044',
    },
  },
  fonts: {
    heading: '"Montserrat", sans-serif',
    body: '"Open Sans", sans-serif',
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/sports-selection" element={<SportsSelection />} />
              <Route path="/cricket-profile" element={<CricketProfileForm />} />
              <Route path="/football-profile" element={<FootballProfileForm />} />
              <Route path="/find-partners" element={<FindPartners />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/friend-requests" element={<FriendRequests />} />
              <Route path="/create-cricket-match" element={<CricketMatch />} />
              <Route path="/matches" element={<CricketMatches />} />
              <Route path="/community" element={<Community />} />
            </Route>
            
            {/* Redirect root to dashboard if authenticated, otherwise to login */}
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <Navigate to="/dashboard" replace />
                </PrivateRoute>
              } 
            />
            
            {/* Catch all - redirect to dashboard if authenticated, otherwise to login */}
            <Route 
              path="*" 
              element={
                <PrivateRoute>
                  <Navigate to="/dashboard" replace />
                </PrivateRoute>
              } 
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App; 