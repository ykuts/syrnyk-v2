export const API_URL = process.env.REACT_APP_API_URL || 'https://syrnyk-v2-production.up.railway.app';

export const getImageUrl = (imagePath, type = 'product') => {
  if (!imagePath) {
    return type === 'station' 
      ? '/assets/default-station.png' 
      : '/assets/default-product.png';
  }

  if (imagePath.startsWith('http')) return imagePath;

  // Remove all instances of /uploads/, /products/, and /stations/
  const cleanPath = imagePath
    .replace(/^\/uploads\//, '')
    .replace(/^products\//, '')
    .replace(/^\/products\//, '')
    .replace(/^stations\//, '')
    .replace(/^\/stations\//, '');

  const uploadsFolder = type === 'station' ? 'stations' : 'products';
  return `${API_URL}/uploads/${uploadsFolder}/${cleanPath}`;
};

export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_URL}${cleanEndpoint}`;
};