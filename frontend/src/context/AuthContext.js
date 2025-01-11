// contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
//import { apiClient } from '../utils/api';
import { getApiUrl } from '../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile using token
  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(getApiUrl('/api/users/profile'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Clear token and user if request fails
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Check for token on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  // Handle user login
  const login = async (email, password) => {
    try {
      const response = await fetch(getApiUrl('/api/users/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const { token, user } = data;
        localStorage.setItem('token', token);
        setUser(user);
        return { success: true, user };
      } else {
        return { 
          success: false, 
          error: data.message || 'Login failed'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'An error occurred during login'
      };
    }
  };

  // Handle user logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Handle user registration
  const register = async (userData) => {
    try {
      const response = await fetch(getApiUrl('/api/users/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        const { token, user } = data;
        localStorage.setItem('token', token);
        setUser(user);
        return { success: true };
      } else {
        return {
          success: false,
          error: data.message || 'Registration failed'
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'An error occurred during registration'
      };
    }
  };

  // Handle profile updates
  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/api/users/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return { success: true };
      } else {
        return {
          success: false,
          error: data.message || 'Profile update failed'
        };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: 'An error occurred while updating profile'
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook for accessing auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};