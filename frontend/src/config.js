// Base URLs for API and assets
export const API_URL = process.env.REACT_APP_API_URL || 'https://syrnyk-v2-production.up.railway.app';

// Helper functions for URL construction
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_URL}/uploads/${imagePath.replace(/^\/uploads\//, '')}`;
};

export const getApiUrl = (endpoint) => {
  return `${API_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
};