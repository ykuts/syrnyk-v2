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

  // Handle user registration with data consent
  const register = async (userData) => {
    try {
      // Проверяем согласие на обработку данных
      if (!userData.dataConsentAccepted) {
        return {
          success: false,
          error: 'Для реєстрації необхідно прийняти умови обробки даних'
        };
      }

      // Добавляем версию и дату согласия, если их еще нет
      const registrationData = {
        ...userData,
        dataConsentVersion: userData.dataConsentVersion || 'v1.0',
        dataConsentDate: userData.dataConsentDate || new Date().toISOString()
      };

      const response = await fetch(getApiUrl('/api/users/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
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

  // Handle consent updates
  const updateConsent = async (consentData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      // Добавляем версию и дату обновления согласия
      const updatedConsentData = {
        ...consentData,
        dataConsentVersion: consentData.dataConsentVersion || 'v1.0',
        dataConsentDate: new Date().toISOString()
      };

      const response = await fetch(getApiUrl('/api/users/consent'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedConsentData),
      });

      const data = await response.json();

      if (response.ok) {
        // Обновляем только поля, связанные с согласием
        setUser(prev => ({
          ...prev,
          dataConsentAccepted: data.user.dataConsentAccepted,
          dataConsentDate: data.user.dataConsentDate,
          dataConsentVersion: data.user.dataConsentVersion,
          marketingConsent: data.user.marketingConsent
        }));
        return { success: true };
      } else {
        return {
          success: false,
          error: data.message || 'Consent update failed'
        };
      }
    } catch (error) {
      console.error('Consent update error:', error);
      return {
        success: false,
        error: 'An error occurred while updating consent settings'
      };
    }
  };

  // Get data processing terms
  const getDataProcessingTerms = async () => {
    try {
      const response = await fetch(getApiUrl('/api/users/data-processing-terms'));
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        return {
          success: false,
          error: 'Failed to fetch data processing terms'
        };
      }
    } catch (error) {
      console.error('Error fetching data processing terms:', error);
      return {
        success: false,
        error: 'An error occurred while fetching data processing terms'
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    updateProfile,
    updateConsent,
    getDataProcessingTerms
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