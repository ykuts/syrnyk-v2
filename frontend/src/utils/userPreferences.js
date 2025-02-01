import { apiClient } from './api';

export const loadUserPreferences = async (token) => {
  try {
    const response = await apiClient.get('/users/delivery-preferences', {
      'Authorization': `Bearer ${token}`
    });

    // Transform API response to match checkout form structure
    const preferences = response.preferences;
    if (!preferences) return null;

    return {
      deliveryType: preferences.type || 'PICKUP',
      // Address delivery fields
      street: preferences.address?.street || '',
      house: preferences.address?.house || '',
      apartment: preferences.address?.apartment || '',
      city: preferences.address?.city || '',
      postalCode: preferences.address?.postalCode || '',
      // Station delivery field
      stationId: preferences.stationId?.toString() || '',
      // Store delivery field (assuming we have a default store)
      storeId: '1'
    };
  } catch (error) {
    console.error('Error loading user preferences:', error);
    return null;
  }
};