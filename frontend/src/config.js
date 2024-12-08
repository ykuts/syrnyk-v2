export const API_URL = process.env.REACT_APP_API_URL || 'https://syrnyk-v2-production.up.railway.app';

export const getImageUrl = (imagePath) => {
  // Return null for missing images
  if (!imagePath) return null;
  
  // Return as is if it's already a full URL
  if (imagePath.startsWith('http')) return imagePath;
  
  // Ensure consistent path structure
  const cleanPath = imagePath
    .replace(/^\/uploads\//, '')  // Remove leading /uploads/ if present
    .replace(/^products\//, '');  // Remove leading products/ if present
    
  // Construct the full URL with proper structure
  return `${API_URL}/uploads/products/${cleanPath}`;
};

export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_URL}${cleanEndpoint}`;
};