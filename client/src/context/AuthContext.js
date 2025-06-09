import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on app startup
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await api.post('/api/auth/login', { email, password });
      
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      
      return data;
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'An error occurred during login. Please try again.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Function to request email verification
  const requestEmailVerification = async (name, email) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await api.post('/api/auth/request-verification', {
        name,
        email
      });
      
      return data;
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'Failed to send verification code. Please try again.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Function to verify email with OTP
  const verifyEmail = async (email, otp) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await api.post('/api/auth/verify-email', {
        email,
        otp
      });
      
      return data;
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'Failed to verify email. Please try again.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Function to complete registration by setting password
  const completeRegistration = async (email, password, verificationToken) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await api.post('/api/auth/complete-registration', {
        email,
        password,
        verificationToken
      });
      
      // Make sure we're setting the user data properly
      console.log('Registration completed successfully. User data:', data);
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      
      return data;
    } catch (error) {
      console.error('Error in completeRegistration:', error);
      setError(
        error.response?.data?.message || 
        'Failed to complete registration. Please try again.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Legacy register function (kept for backward compatibility if needed)
  const register = async (name, email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await api.post('/api/auth/register', {
        name,
        email,
        password,
      });
      
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      
      return data;
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'An error occurred during registration. Please try again.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        requestEmailVerification,
        verifyEmail,
        completeRegistration,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 