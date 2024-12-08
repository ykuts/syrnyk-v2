// contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 200) {
        setUser(response.data.user);
      } else {
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/login`, {
        email,
        password
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      
      return { 
        success: true,
        user: user
      };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'An error occurred during login';
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/register`, userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'An error occurred during registration';
      return { success: false, error: errorMessage };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/profile`,
        profileData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error.response?.data?.message || 'An error occurred while updating profile';
      return { success: false, error: errorMessage };
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};