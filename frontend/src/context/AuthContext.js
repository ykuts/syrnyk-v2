// contexts/AuthContext.js
import { createContext, useState, useContext, useEffect } from 'react';
import { apiClient } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile using token (теперь очень просто!)
  const fetchUserProfile = async () => {
    try {
      const data = await apiClient.get('/users/profile');
      setUser(data.user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Clear token and user if request fails
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
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  // Handle user login with email verification support
  const login = async (email, password) => {
    try {
      const data = await apiClient.post('/users/login', {
        email,
        password
      });

      const { token, user } = data;
      localStorage.setItem('token', token);
      setUser(user);
      return { success: true, user };

    } catch (error) {
      console.error('Login error:', error);
      
      // Проверяем сообщение об ошибке для определения типа
      const errorMessage = error.message || '';
      
      if (errorMessage.includes('verify your email') || errorMessage.includes('needsVerification')) {
        return { 
          success: false, 
          error: errorMessage,
          needsVerification: true,
          email: email
        };
      } else {
        return { 
          success: false, 
          error: errorMessage || 'Login failed'
        };
      }
    }
  };

  // Handle user logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Handle user registration with email verification support
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

      const data = await apiClient.post('/users/register', registrationData);

      // Check if email verification is required
      if (data.user?.requiresVerification) {
        return { 
          success: true, 
          requiresVerification: true,
          user: data.user,
          message: data.message
        };
      } else {
        // Old flow - direct login if verification not required
        const { token, user } = data;
        if (token) {
          localStorage.setItem('token', token);
          setUser(user);
        }
        return { success: true, user: data.user };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message || 'Registration failed'
      };
    }
  };

  // Handle profile updates (теперь очень просто!)
  const updateProfile = async (profileData) => {
    try {
      const data = await apiClient.put('/users/profile', profileData);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: error.message || 'Profile update failed'
      };
    }
  };

  // Handle consent updates (теперь очень просто!)
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

      const data = await apiClient.put('/users/consent', updatedConsentData);

      // Обновляем только поля, связанные с согласием
      setUser(prev => ({
        ...prev,
        dataConsentAccepted: data.user.dataConsentAccepted,
        dataConsentDate: data.user.dataConsentDate,
        dataConsentVersion: data.user.dataConsentVersion,
        marketingConsent: data.user.marketingConsent
      }));
      return { success: true };
    } catch (error) {
      console.error('Consent update error:', error);
      return {
        success: false,
        error: error.message || 'Consent update failed'
      };
    }
  };

  // Get data processing terms (теперь очень просто!)
  const getDataProcessingTerms = async () => {
    try {
      const data = await apiClient.get('/users/data-processing-terms');
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching data processing terms:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch data processing terms'
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
    getDataProcessingTerms,
    setUser // Добавляем setUser для использования в EmailVerification
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