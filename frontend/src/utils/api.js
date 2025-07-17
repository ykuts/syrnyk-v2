// utils/api.js
import { API_URL } from '../config';

export const apiClient = {
  get: async (endpoint, options = {}) => {
    // Get current language and token
    const language = localStorage.getItem('i18nextLng') || 'uk';
    const token = localStorage.getItem('token');
    
    // Extract query parameters if provided
    let url = `${API_URL}/api${endpoint}`;
    
    // If options contains params, append them to the URL as query parameters
    if (options.params) {
      const queryParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value);
        }
      });
      
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    
    // Remove params from options to avoid sending it as a header
    const { params, ...customHeaders } = options;

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      'Accept-Language': language,
      ...customHeaders
    };

    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { headers });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  post: async (endpoint, data, customHeaders = {}) => {
    const token = localStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders
    };

    // Add authorization if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/api${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  upload: async (endpoint, formData) => {
    const token = localStorage.getItem('token');
    
    const headers = {};
    
    // Add authorization if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/api${endpoint}`, {
      method: 'POST',
      headers, // Don't set Content-Type for FormData
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  put: async (endpoint, data, customHeaders = {}) => {
    const token = localStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders
    };

    // Add authorization if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/api${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  patch: async (endpoint, data, customHeaders = {}) => {
    const token = localStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders
    };

    // Add authorization if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/api${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  delete: async (endpoint, customHeaders = {}) => {
    const token = localStorage.getItem('token');
    
    const headers = {
      ...customHeaders
    };

    // Add authorization if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/api${endpoint}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
};