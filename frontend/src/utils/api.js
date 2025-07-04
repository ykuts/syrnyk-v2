import { API_URL } from '../config';

export const apiClient = {
  get: async (endpoint, options = {}) => {
    // Get current language
    const language = localStorage.getItem('i18nextLng') || 'uk';
    
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

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': language, // Include language in header
        ...customHeaders
      }
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  post: async (endpoint, data, customHeaders = {}) => {
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...customHeaders
      },
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
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      method: 'POST',
      body: formData, // Don't set Content-Type for FormData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  put: async (endpoint, data, customHeaders = {}) => {
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...customHeaders
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  patch: async (endpoint, data, customHeaders = {}) => {
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...customHeaders
      },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  
    return response.json();
  },

  delete: async (endpoint, customHeaders = {}) => {
    const response = await fetch(`${API_URL}/api${endpoint}`, {
        method: 'DELETE',
        headers: {
            ...customHeaders
        }
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
};