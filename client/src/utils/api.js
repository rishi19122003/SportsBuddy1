import axios from 'axios';

// Create an axios instance with default configuration
const api = axios.create({
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for common error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log errors for debugging
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with a non-2xx status
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received from server');
    } else {
      // Error in setting up the request
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api; 