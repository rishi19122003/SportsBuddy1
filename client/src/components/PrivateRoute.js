import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Spinner, Center } from '@chakra-ui/react';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // If still loading, show a loading spinner
  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="teal.500" />
      </Center>
    );
  }

  if (!user) {
    // Redirect them to the login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the child routes
  return children || <Outlet />;
};

export default PrivateRoute; 