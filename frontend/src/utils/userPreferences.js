// Updated userPreferences.js - Enhanced canton support
import { apiClient } from './api';

/**
 * Export all functions for use in other components
 */
//export { loadUserPreferences, applyUserPreferencesToCheckout, validateUserPreferences };

/**
 * Load user delivery preferences and transform for checkout form
 * Now includes proper canton handling
 */
export const loadUserPreferences = async (token) => {
  try {
    const response = await apiClient.get('/users/delivery-preferences', {
      'Authorization': `Bearer ${token}`
    });

    // Transform API response to match checkout form structure
    const preferences = response.preferences;
    if (!preferences) return null;

    // Validate and ensure canton is properly set for address delivery
    let canton = 'VD'; // Default to Vaud
    if (preferences.type === 'ADDRESS' && preferences.address) {
      // Use saved canton if available, otherwise default to VD
      canton = preferences.address.canton || 'VD';
      
      // Validate canton value
      if (!['VD', 'GE'].includes(canton)) {
        console.warn('Invalid canton value in user preferences:', canton, 'defaulting to VD');
        canton = 'VD';
      }
    }

    const transformedPreferences = {
      deliveryType: preferences.type || 'PICKUP',
      // Address delivery fields (with proper canton handling)
      street: preferences.address?.street || '',
      house: preferences.address?.house || '',
      apartment: preferences.address?.apartment || '',
      city: preferences.address?.city || '',
      postalCode: preferences.address?.postalCode || '',
      canton: canton, // Always include canton with validated value
      // Station delivery field
      stationId: preferences.stationId?.toString() || '',
      // Store delivery field (assuming we have a default store)
      storeId: '1',
      // Additional checkout-specific fields that might be needed
      deliveryDate: '', // Will be selected during checkout
      deliveryTimeSlot: '', // Will be selected during checkout
      deliveryCost: 0 // Will be calculated during checkout
    };

    console.log('Loaded user preferences:', transformedPreferences);
    return transformedPreferences;

  } catch (error) {
    console.error('Error loading user preferences:', error);
    
    // Return null if error - checkout will use default values
    return null;
  }
};

/**
 * Apply user preferences to checkout form data
 * This function ensures that loaded preferences are properly applied
 * while maintaining form validation logic
 */
export const applyUserPreferencesToCheckout = (currentFormData, userPreferences) => {
  if (!userPreferences) {
    console.log('No user preferences provided, returning current form data');
    return currentFormData;
  }

  console.log('Applying user preferences:', userPreferences);
  console.log('Current form data:', currentFormData);

  // Only apply preferences for fields that are relevant to the selected delivery type
  const updatedFormData = { ...currentFormData };

  // Always set delivery type from preferences
  updatedFormData.deliveryType = userPreferences.deliveryType;

  // Apply address-specific preferences only if delivery type is ADDRESS
  if (userPreferences.deliveryType === 'ADDRESS') {
    updatedFormData.street = userPreferences.street;
    updatedFormData.house = userPreferences.house;
    updatedFormData.apartment = userPreferences.apartment;
    updatedFormData.city = userPreferences.city;
    updatedFormData.postalCode = userPreferences.postalCode;
    updatedFormData.canton = userPreferences.canton; // Critical: include canton
    
    // Clear other delivery type fields
    updatedFormData.stationId = '';
    updatedFormData.storeId = '';
    
    console.log('Applied ADDRESS delivery preferences with canton:', userPreferences.canton);
  }
  
  // Apply station-specific preferences only if delivery type is RAILWAY_STATION
  else if (userPreferences.deliveryType === 'RAILWAY_STATION') {
    updatedFormData.stationId = userPreferences.stationId;
    
    // Clear other delivery type fields
    updatedFormData.street = '';
    updatedFormData.house = '';
    updatedFormData.apartment = '';
    updatedFormData.city = '';
    updatedFormData.postalCode = '';
    updatedFormData.canton = 'VD'; // Reset to default
    updatedFormData.storeId = '';
    
    console.log('Applied RAILWAY_STATION delivery preferences with station ID:', userPreferences.stationId);
  }
  
  // Apply pickup-specific preferences only if delivery type is PICKUP
  else if (userPreferences.deliveryType === 'PICKUP') {
    updatedFormData.storeId = userPreferences.storeId;
    
    // Clear other delivery type fields
    updatedFormData.street = '';
    updatedFormData.house = '';
    updatedFormData.apartment = '';
    updatedFormData.city = '';
    updatedFormData.postalCode = '';
    updatedFormData.canton = 'VD'; // Reset to default
    updatedFormData.stationId = '';
    
    console.log('Applied PICKUP delivery preferences with store ID:', userPreferences.storeId);
  }

  console.log('Final updated form data after applying preferences:', updatedFormData);
  return updatedFormData;
};

/**
 * Validate that user preferences are compatible with current system
 * This helps identify any data migration issues or invalid stored data
 */
export const validateUserPreferences = (preferences) => {
  if (!preferences) return { isValid: true, issues: [] };

  const issues = [];

  // Check delivery type
  if (!['PICKUP', 'ADDRESS', 'RAILWAY_STATION'].includes(preferences.deliveryType)) {
    issues.push(`Invalid delivery type: ${preferences.deliveryType}`);
  }

  // Validate address delivery preferences
  if (preferences.deliveryType === 'ADDRESS') {
    if (!preferences.canton || !['VD', 'GE'].includes(preferences.canton)) {
      issues.push(`Invalid or missing canton for address delivery: ${preferences.canton}`);
    }
    
    if (!preferences.street || !preferences.house || !preferences.city) {
      issues.push('Missing required address fields');
    }
    
    // For Vaud canton, postal code is important for region determination
    if (preferences.canton === 'VD' && !preferences.postalCode) {
      issues.push('Missing postal code for Vaud canton (needed to determine Coppet-Lausanne region)');
    }
  }

  // Validate station delivery preferences
  if (preferences.deliveryType === 'RAILWAY_STATION') {
    if (!preferences.stationId) {
      issues.push('Missing station ID for railway station delivery');
    }
  }

  // Validate pickup delivery preferences
  if (preferences.deliveryType === 'PICKUP') {
    if (!preferences.storeId) {
      issues.push('Missing store ID for pickup delivery');
    }
  }

  return {
    isValid: issues.length === 0,
    issues: issues
  };
};